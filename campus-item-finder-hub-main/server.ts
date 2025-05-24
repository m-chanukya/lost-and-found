import express, { Request, Response } from 'express';
import cors from 'cors';
import { DatabaseService } from './src/services/databaseService';
import { MatchingService } from './src/services/matchingService';
import { LostItem, FoundItem } from './src/types/item';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// Lost Items endpoint
app.post('/api/lost-items', async (req: Request, res: Response) => {
  try {
    console.log('Received lost item data:', JSON.stringify(req.body, null, 2));
    const lostItemData = req.body as Omit<LostItem, 'id' | 'createdAt' | 'updatedAt'>;

    // Validate required fields
    if (!lostItemData.userId || !lostItemData.title || !lostItemData.description || !lostItemData.lastSeenLocation) {
      throw new Error('Missing required fields');
    }

    // Create the lost item in the database
    console.log('Creating lost item in database...');
    const savedLostItem = await DatabaseService.createLostItem(lostItemData);
    console.log('Lost item created:', JSON.stringify(savedLostItem, null, 2));

    // Find potential matches
    console.log('Finding potential matches...');
    const matches = await MatchingService.findPotentialMatches(savedLostItem);
    console.log('Found matches:', JSON.stringify(matches, null, 2));

    res.json({
      message: 'Lost item submitted successfully',
      item: savedLostItem,
      matches: matches.length > 0 ? {
        count: matches.length,
        items: matches
      } : null
    });
  } catch (error) {
    console.error('Detailed error processing lost item:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      message: 'Error processing lost item',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Found Items endpoint
app.post('/api/found-items', async (req: Request, res: Response) => {
  try {
    console.log('Received found item data:', JSON.stringify(req.body, null, 2));
    const foundItemData = req.body as Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt'>;

    // Validate required fields
    if (!foundItemData.userId || !foundItemData.title || !foundItemData.description || !foundItemData.foundLocation) {
      throw new Error('Missing required fields');
    }

    // Create the found item in the database
    console.log('Creating found item in database...');
    const savedFoundItem = await DatabaseService.createFoundItem(foundItemData);
    console.log('Found item created:', JSON.stringify(savedFoundItem, null, 2));

    // Find potential matches
    console.log('Finding potential matches...');
    const matches = await MatchingService.findPotentialMatches(savedFoundItem);
    console.log('Found matches:', JSON.stringify(matches, null, 2));

    res.json({
      message: 'Found item submitted successfully',
      item: savedFoundItem,
      matches: matches.length > 0 ? {
        count: matches.length,
        items: matches
      } : null
    });
  } catch (error) {
    console.error('Detailed error processing found item:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      message: 'Error processing found item',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Initialize server
async function startServer() {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error); 