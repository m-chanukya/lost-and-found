import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '../services/databaseService';
import { MatchingService } from '../services/matchingService';
import { NotificationService } from '../services/notificationService';
import { LostItem, FoundItem } from '@/types/item';

const prisma = new PrismaClient();

// User's email address
const YOUR_EMAIL = "chanukyaop@gmail.com";

async function testMatching() {
  try {
    console.log('Starting test with configuration:', {
      emailUser: process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD,
      targetEmail: YOUR_EMAIL
    });

    // Create test user
    console.log('Creating test user...');
    const user = await prisma.user.create({
      data: {
        id: 'test-user-1',
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

    console.log('Created test user:', {
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Verify user preferences
    const prefs = await DatabaseService.getUserPreferences(user.id);
    console.log('User preferences:', prefs);

    // Create found item first
    console.log('Creating found item...');
    const foundItemData: Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user-2',
      category: 'Electronics',
      title: 'Found MacBook Pro',
      description: 'Found a silver MacBook Pro with stickers, found in the library study area',
      foundLocation: 'University Library, Study Area',
      whereStored: 'Library Lost and Found Office',
      date: new Date('2024-03-20T16:45:00Z'),
      characteristics: {
        color: 'Silver',
        brand: 'Apple',
        size: '13-inch',
        markings: 'Has stickers on top',
        additionalDetails: 'Noticed a scratch near charging port'
      },
      status: 'pending' as const
    };

    const foundItem = await DatabaseService.createFoundItem(foundItemData);
    console.log('Created found item:', {
      id: foundItem.id,
      title: foundItem.title
    });

    // Create lost item
    console.log('Creating lost item...');
    const lostItemData: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.id,
      category: 'Electronics',
      title: 'MacBook Pro 13-inch',
      description: 'Silver MacBook Pro with stickers on the cover, last used in the library',
      lastSeenLocation: 'University Library, 2nd Floor',
      date: new Date('2024-03-20T14:30:00Z'),
      characteristics: {
        color: 'Silver',
        brand: 'Apple',
        size: '13-inch',
        markings: 'Stickers on the cover',
        additionalDetails: 'Has a small scratch near the charging port'
      },
      status: 'pending' as const
    };

    const lostItem = await DatabaseService.createLostItem(lostItemData);
    console.log('Created lost item:', {
      id: lostItem.id,
      title: lostItem.title
    });

    // Find matches
    console.log('Finding potential matches...');
    const matches = await MatchingService.findPotentialMatches(lostItem);
    console.log('Found matches:', matches.length);

    // Try sending a direct test email
    console.log('Attempting to send a direct test email...');
    try {
      await NotificationService.sendTestEmail(YOUR_EMAIL);
      console.log('Direct test email sent successfully');
    } catch (error) {
      console.error('Error sending direct test email:', error);
    }

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMatching().catch(console.error); 