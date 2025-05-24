import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/services/databaseService';
import { MatchingService } from '@/services/matchingService';
import { LostItem } from '@/types/item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const lostItemData = req.body as Omit<LostItem, 'id' | 'createdAt' | 'updatedAt'>;

    // Create the lost item in the database
    const savedLostItem = await DatabaseService.createLostItem(lostItemData);

    // Find potential matches
    const matches = await MatchingService.findPotentialMatches(savedLostItem);

    return res.status(200).json({
      message: 'Lost item submitted successfully',
      item: savedLostItem,
      matches: matches.length > 0 ? {
        count: matches.length,
        items: matches
      } : null
    });
  } catch (error) {
    console.error('Error processing lost item:', error);
    return res.status(500).json({ message: 'Error processing lost item' });
  }
} 