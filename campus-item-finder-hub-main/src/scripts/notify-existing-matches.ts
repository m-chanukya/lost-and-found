import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notificationService';
import { DatabaseService } from '../services/databaseService';
import type { ItemMatch } from '../types/item';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function notifyExistingMatches() {
    try {
        console.log('🔍 Finding existing matches...');
        
        // Get all pending matches
        const matches = await prisma.itemMatch.findMany({
            where: {
                status: 'pending'
            },
            include: {
                lostItem: {
                    include: {
                        user: true
                    }
                },
                foundItem: {
                    include: {
                        user: true
                    }
                }
            }
        });

        console.log(`Found ${matches.length} pending matches`);

        // Send notifications for each match
        for (const match of matches) {
            try {
                console.log(`\n📧 Processing match between:`);
                console.log(`Lost item: ${match.lostItem.title} (User: ${match.lostItem.user.email})`);
                console.log(`Found item: ${match.foundItem.title} (User: ${match.foundItem.user.email})`);

                const typedMatch: ItemMatch = {
                    ...match,
                    status: match.status as 'pending' | 'confirmed' | 'rejected',
                    lostItem: DatabaseService.mapItemCharacteristics(match.lostItem),
                    foundItem: DatabaseService.mapItemCharacteristics(match.foundItem)
                };

                await NotificationService.notifyUserOfMatch(typedMatch);
                console.log('✅ Notification sent successfully');
            } catch (error) {
                console.error('❌ Error sending notification for match:', {
                    matchId: match.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        console.log('\n✨ Finished processing all matches');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

console.log('🚀 Starting to process existing matches...\n');
notifyExistingMatches().catch(console.error); 