import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '../services/databaseService';
import { MatchingService } from '../services/matchingService';
import { NotificationService } from '../services/notificationService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const YOUR_EMAIL = "chanukyaop@gmail.com";

async function testFullFlow() {
    try {
        // Generate unique IDs and emails using timestamp
        const timestamp = Date.now();
        const testUserId = `test-user-${timestamp}`;
        const finderUserId = `test-finder-${timestamp}`;
        const finderEmail = `finder.${timestamp}@test.com`;

        console.log('\n🚀 Starting test with unique IDs:', { testUserId, finderUserId });

        // Step 1: Clean up existing data
        console.log('\n📝 Step 1: Cleaning up existing data...');
        
        // First find users to clean up
        const usersToDelete = await prisma.user.findMany({
            where: {
                OR: [
                    { email: YOUR_EMAIL },
                    { email: finderEmail }
                ]
            },
            include: {
                lostItems: true,
                foundItems: true
            }
        });

        // Delete related data first
        for (const user of usersToDelete) {
            // Delete matches related to user's items
            await prisma.itemMatch.deleteMany({
                where: {
                    OR: [
                        { lostItemId: { in: user.lostItems.map(item => item.id) } },
                        { foundItemId: { in: user.foundItems.map(item => item.id) } }
                    ]
                }
            });

            // Delete notification preferences
            await prisma.notificationPreference.deleteMany({
                where: { userId: user.id }
            });

            // Delete lost items
            await prisma.lostItem.deleteMany({
                where: { userId: user.id }
            });

            // Delete found items
            await prisma.foundItem.deleteMany({
                where: { userId: user.id }
            });
        }

        // Finally delete the users
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: YOUR_EMAIL },
                    { email: finderEmail }
                ]
            }
        });

        console.log('✅ Cleanup completed');

        // Step 2: Create Main User
        console.log('\n📝 Step 2: Creating main test user...');
        const user = await prisma.user.create({
            data: {
                id: testUserId,
                email: YOUR_EMAIL,
                name: 'Test User',
                notifications: {
                    create: {
                        email: true,
                        sms: false
                    }
                }
            }
        });
        console.log('✅ Main user created:', { id: user.id, email: user.email });

        // Step 3: Create Finder User
        console.log('\n📝 Step 3: Creating finder user...');
        const finderUser = await prisma.user.create({
            data: {
                id: finderUserId,
                email: finderEmail,
                name: 'Finder User'
            }
        });
        console.log('✅ Finder user created:', { id: finderUser.id, email: finderUser.email });

        // Step 4: Verify User Preferences
        console.log('\n📝 Step 4: Verifying user preferences...');
        const prefs = await DatabaseService.getUserPreferences(user.id);
        console.log('✅ User preferences:', prefs);

        // Step 5: Create Found Item
        console.log('\n📝 Step 5: Creating found item...');
        const foundItem = await DatabaseService.createFoundItem({
            userId: finderUser.id,
            category: 'Electronics',
            title: 'Found MacBook Pro',
            description: 'Found a silver MacBook Pro with stickers, found in the library study area',
            foundLocation: 'University Library, Study Area',
            whereStored: 'Library Lost and Found Office',
            date: new Date(),
            characteristics: {
                color: 'Silver',
                brand: 'Apple',
                size: '13-inch',
                markings: 'Has stickers on top',
                additionalDetails: 'Noticed a scratch near charging port'
            },
            status: 'pending' as const
        });
        console.log('✅ Found item created:', { id: foundItem.id, title: foundItem.title });

        // Step 6: Create Lost Item
        console.log('\n📝 Step 6: Creating lost item...');
        const lostItem = await DatabaseService.createLostItem({
            userId: user.id,
            category: 'Electronics',
            title: 'MacBook Pro 13-inch',
            description: 'Silver MacBook Pro with stickers on the cover, last used in the library',
            lastSeenLocation: 'University Library, 2nd Floor',
            date: new Date(),
            characteristics: {
                color: 'Silver',
                brand: 'Apple',
                size: '13-inch',
                markings: 'Stickers on the cover',
                additionalDetails: 'Has a small scratch near the charging port'
            },
            status: 'pending' as const
        });
        console.log('✅ Lost item created:', { id: lostItem.id, title: lostItem.title });

        // Step 7: Find Matches
        console.log('\n📝 Step 7: Finding potential matches...');
        const matches = await MatchingService.findPotentialMatches(lostItem);
        console.log('✅ Matches found:', matches.length);

        // Step 8: Send Direct Notification
        console.log('\n📝 Step 8: Sending direct notification for first match...');
        if (matches.length > 0) {
            const match = matches[0];
            await NotificationService.notifyUserOfMatch(match);
            console.log('✅ Match notification sent successfully');
        } else {
            console.log('❌ No matches found to send notification for');
        }

        // Step 9: Send Test Email
        console.log('\n📝 Step 9: Sending final test email...');
        await NotificationService.sendTestEmail(YOUR_EMAIL);
        console.log('✅ Test email sent successfully');

    } catch (error) {
        console.error('❌ Error details:', {
            name: (error as Error).name,
            message: (error as Error).message,
            // @ts-ignore
            code: error?.code,
            // @ts-ignore
            meta: error?.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

console.log('🚀 Starting full system test...');
testFullFlow().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}); 