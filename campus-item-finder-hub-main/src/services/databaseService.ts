import { PrismaClient } from '@prisma/client';
import { LostItem, FoundItem, ItemMatch, NotificationPreferences } from '@/types/item';

const prisma = new PrismaClient();

export class DatabaseService {
  // Helper function to convert database item to domain item with characteristics
  static mapItemCharacteristics(item: any) {
    // Create characteristics object only if at least one characteristic exists
    const characteristics: Record<string, string | undefined> = {};
    
    if (item.color) characteristics.color = item.color;
    if (item.brand) characteristics.brand = item.brand;
    if (item.size) characteristics.size = item.size;
    if (item.markings) characteristics.markings = item.markings;
    if (item.additionalDetails) characteristics.additionalDetails = item.additionalDetails;

    const mappedItem = {
      ...item,
      characteristics: Object.keys(characteristics).length > 0 ? characteristics : {},
      images: item.images ? item.images.split(',') : undefined
    };

    // Remove the flat characteristics from the root level
    delete mappedItem.color;
    delete mappedItem.brand;
    delete mappedItem.size;
    delete mappedItem.markings;
    delete mappedItem.additionalDetails;

    return mappedItem;
  }

  // User Preferences
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return {
      userId: prefs.userId,
      email: prefs.email,
      sms: prefs.sms,
      emailAddress: user?.email,
      phoneNumber: user?.phoneNumber || undefined
    };
  }

  // Lost Items
  static async createLostItem(data: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LostItem> {
    const item = await prisma.lostItem.create({
      data: {
        userId: data.userId,
        category: data.category,
        title: data.title,
        description: data.description,
        lastSeenLocation: data.lastSeenLocation,
        date: data.date,
        color: data.characteristics?.color,
        brand: data.characteristics?.brand,
        size: data.characteristics?.size,
        markings: data.characteristics?.markings,
        additionalDetails: data.characteristics?.additionalDetails,
        images: data.images?.join(','),
        reward: data.reward,
        status: data.status
      }
    });

    return this.mapItemCharacteristics(item) as LostItem;
  }

  static async getPendingLostItems(): Promise<LostItem[]> {
    const items = await prisma.lostItem.findMany({
      where: {
        status: 'pending'
      }
    });

    return items.map(item => this.mapItemCharacteristics(item)) as LostItem[];
  }

  // Found Items
  static async createFoundItem(data: Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoundItem> {
    const item = await prisma.foundItem.create({
      data: {
        userId: data.userId,
        category: data.category,
        title: data.title,
        description: data.description,
        foundLocation: data.foundLocation,
        whereStored: data.whereStored,
        date: data.date,
        color: data.characteristics?.color,
        brand: data.characteristics?.brand,
        size: data.characteristics?.size,
        markings: data.characteristics?.markings,
        additionalDetails: data.characteristics?.additionalDetails,
        images: data.images?.join(','),
        status: data.status
      }
    });

    return this.mapItemCharacteristics(item) as FoundItem;
  }

  static async getPendingFoundItems(): Promise<FoundItem[]> {
    const items = await prisma.foundItem.findMany({
      where: {
        status: 'pending'
      }
    });

    return items.map(item => this.mapItemCharacteristics(item)) as FoundItem[];
  }

  // Matches
  static async createMatch(match: Omit<ItemMatch, 'createdAt' | 'updatedAt'>): Promise<ItemMatch> {
    const createdMatch = await prisma.itemMatch.create({
      data: {
        id: match.id,
        lostItemId: match.lostItemId,
        foundItemId: match.foundItemId,
        matchConfidence: match.matchConfidence,
        status: match.status
      },
      include: {
        lostItem: true,
        foundItem: true
      }
    });

    return {
      ...createdMatch,
      lostItem: this.mapItemCharacteristics(createdMatch.lostItem),
      foundItem: this.mapItemCharacteristics(createdMatch.foundItem)
    } as ItemMatch;
  }

  static async updateMatchStatus(matchId: string, status: 'pending' | 'confirmed' | 'rejected'): Promise<ItemMatch> {
    const updatedMatch = await prisma.itemMatch.update({
      where: { id: matchId },
      data: { status },
      include: {
        lostItem: true,
        foundItem: true
      }
    });

    return {
      ...updatedMatch,
      lostItem: this.mapItemCharacteristics(updatedMatch.lostItem),
      foundItem: this.mapItemCharacteristics(updatedMatch.foundItem)
    } as ItemMatch;
  }

  static async getMatchById(matchId: string): Promise<ItemMatch | null> {
    const match = await prisma.itemMatch.findUnique({
      where: { id: matchId },
      include: {
        lostItem: true,
        foundItem: true
      }
    });

    if (!match) return null;

    return {
      ...match,
      lostItem: this.mapItemCharacteristics(match.lostItem),
      foundItem: this.mapItemCharacteristics(match.foundItem)
    } as ItemMatch;
  }
} 