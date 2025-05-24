import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/services/databaseService';
import { MatchingService } from '@/services/matchingService';
import { FoundItem } from '@/types/item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const foundItemData = req.body as Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt'>;

    // Create the found item in the database
    const savedFoundItem = await DatabaseService.createFoundItem(foundItemData);

    // Find potential matches with existing lost items
    const matches = await MatchingService.findPotentialMatches(savedFoundItem);

    return res.status(200).json({
      message: 'Found item submitted successfully',
      item: savedFoundItem,
      matches: matches.length > 0 ? {
        count: matches.length,
        items: matches
      } : null
    });
  } catch (error) {
    console.error('Error processing found item:', error);
    return res.status(500).json({ message: 'Error processing found item' });
  }
} 