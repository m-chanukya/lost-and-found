import stringSimilarity from 'string-similarity';
import { DatabaseService } from './databaseService';
import { LostItem, FoundItem, ItemMatch } from '@/types/item';
import { NotificationService } from './notificationService';

export class MatchingService {
  private static SIMILARITY_THRESHOLD = 0.6;

  private static calculateTitleSimilarity(lostItem: LostItem, foundItem: FoundItem): number {
    return stringSimilarity.compareTwoStrings(
      lostItem.title.toLowerCase(),
      foundItem.title.toLowerCase()
    );
  }

  private static calculateDescriptionSimilarity(lostItem: LostItem, foundItem: FoundItem): number {
    return stringSimilarity.compareTwoStrings(
      lostItem.description.toLowerCase(),
      foundItem.description.toLowerCase()
    );
  }

  private static calculateLocationSimilarity(lostItem: LostItem, foundItem: FoundItem): number {
    return stringSimilarity.compareTwoStrings(
      lostItem.lastSeenLocation.toLowerCase(),
      foundItem.foundLocation.toLowerCase()
    );
  }

  private static calculateCharacteristicsSimilarity(lostItem: LostItem, foundItem: FoundItem): number {
    let characteristicMatches = 0;
    let totalCharacteristics = 0;

    if (lostItem.characteristics?.color && foundItem.characteristics?.color) {
      totalCharacteristics++;
      if (lostItem.characteristics.color.toLowerCase() === foundItem.characteristics.color.toLowerCase()) {
        characteristicMatches++;
      }
    }

    if (lostItem.characteristics?.brand && foundItem.characteristics?.brand) {
      totalCharacteristics++;
      if (lostItem.characteristics.brand.toLowerCase() === foundItem.characteristics.brand.toLowerCase()) {
        characteristicMatches++;
      }
    }

    if (lostItem.characteristics?.size && foundItem.characteristics?.size) {
      totalCharacteristics++;
      if (lostItem.characteristics.size.toLowerCase() === foundItem.characteristics.size.toLowerCase()) {
        characteristicMatches++;
      }
    }

    return totalCharacteristics > 0 ? characteristicMatches / totalCharacteristics : 0;
  }

  private static calculateMatchConfidence(lostItem: LostItem, foundItem: FoundItem): number {
    const titleSimilarity = this.calculateTitleSimilarity(lostItem, foundItem);
    const descriptionSimilarity = this.calculateDescriptionSimilarity(lostItem, foundItem);
    const locationSimilarity = this.calculateLocationSimilarity(lostItem, foundItem);
    const characteristicsSimilarity = this.calculateCharacteristicsSimilarity(lostItem, foundItem);

    // Weight the different components
    const weights = {
      title: 0.35,
      description: 0.25,
      location: 0.2,
      characteristics: 0.2
    };

    // Calculate final confidence score
    const confidence = (
      titleSimilarity * weights.title +
      descriptionSimilarity * weights.description +
      locationSimilarity * weights.location +
      characteristicsSimilarity * weights.characteristics
    );

    return Number(confidence.toFixed(2));
  }

  static async findPotentialMatches(item: LostItem | FoundItem): Promise<ItemMatch[]> {
    const matches: ItemMatch[] = [];

    if ('lastSeenLocation' in item) {
      // This is a lost item, find matching found items
      const foundItems = await DatabaseService.getPendingFoundItems();
      
      for (const foundItem of foundItems) {
        // Skip if categories don't match
        if (item.category !== foundItem.category) continue;

        const confidence = this.calculateMatchConfidence(item, foundItem);

        // If confidence exceeds threshold, create a match
        if (confidence >= this.SIMILARITY_THRESHOLD) {
          const match: Omit<ItemMatch, 'createdAt' | 'updatedAt'> = {
            id: `${item.id}-${foundItem.id}`,
            lostItemId: item.id,
            foundItemId: foundItem.id,
            matchConfidence: confidence,
            status: 'pending',
            lostItem: item,
            foundItem
          };

          // Save match to database
          const savedMatch = await DatabaseService.createMatch(match);
          matches.push(savedMatch);

          // Send notification to the user who lost the item
          await NotificationService.notifyUserOfMatch(savedMatch);
        }
      }
    } else {
      // This is a found item, find matching lost items
      const lostItems = await DatabaseService.getPendingLostItems();
      
      for (const lostItem of lostItems) {
        // Skip if categories don't match
        if (item.category !== lostItem.category) continue;

        const confidence = this.calculateMatchConfidence(lostItem, item);

        // If confidence exceeds threshold, create a match
        if (confidence >= this.SIMILARITY_THRESHOLD) {
          const match: Omit<ItemMatch, 'createdAt' | 'updatedAt'> = {
            id: `${lostItem.id}-${item.id}`,
            lostItemId: lostItem.id,
            foundItemId: item.id,
            matchConfidence: confidence,
            status: 'pending',
            lostItem,
            foundItem: item
          };

          // Save match to database
          const savedMatch = await DatabaseService.createMatch(match);
          matches.push(savedMatch);

          // Send notification to the user who lost the item
          await NotificationService.notifyUserOfMatch(savedMatch);
        }
      }
    }

    return matches;
  }
} 