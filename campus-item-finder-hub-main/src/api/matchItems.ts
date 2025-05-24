import { LostItem, FoundItem, ItemMatch } from '@/types/item';
import { MatchingService } from '@/services/matchingService';
import { NotificationService } from '@/services/notificationService';
import { getUserPreferences } from '@/services/userService'; // You'll need to implement this

export async function matchItems(lostItem: LostItem, foundItems: FoundItem[]): Promise<ItemMatch[]> {
  try {
    // Find potential matches
    const matches = MatchingService.findMatches(lostItem, foundItems);

    // If matches are found, notify the user
    if (matches.length > 0) {
      const userPreferences = await getUserPreferences(lostItem.userId);
      
      // Get the best match (highest confidence)
      const bestMatch = matches[0];
      const matchedFoundItem = foundItems.find(item => item.id === bestMatch.foundItemId);

      if (matchedFoundItem) {
        // Send notifications
        await NotificationService.notifyMatch(
          bestMatch,
          lostItem,
          matchedFoundItem,
          userPreferences
        );

        // Update match status in database
        // You'll need to implement this part based on your database setup
        await updateMatchStatus(bestMatch.id, 'pending');
      }
    }

    return matches;
  } catch (error) {
    console.error('Error in matchItems:', error);
    throw error;
  }
}

// Example usage in your API route handler:
export async function handleNewFoundItem(foundItem: FoundItem) {
  try {
    // Get all pending lost items from the database
    // You'll need to implement this based on your database setup
    const pendingLostItems = await getPendingLostItems();

    // Check for matches with the new found item
    for (const lostItem of pendingLostItems) {
      const matches = await matchItems(lostItem, [foundItem]);
      
      if (matches.length > 0) {
        // Store matches in database
        // You'll need to implement this based on your database setup
        await storeMatches(matches);
      }
    }
  } catch (error) {
    console.error('Error handling new found item:', error);
    throw error;
  }
} 