export type ItemCategory = 
  | 'Electronics'
  | 'Books'
  | 'Clothing'
  | 'Accessories'
  | 'Documents'
  | 'Others';

export interface ItemCharacteristics {
  color?: string;
  brand?: string;
  size?: string;
  markings?: string;
  additionalDetails?: string;
}

export interface BaseItem {
  id: string;
  userId: string;
  category: ItemCategory;
  title: string;
  description: string;
  characteristics: ItemCharacteristics;
  location: string;
  date: Date;
  images?: string[];
  status: 'pending' | 'matched' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface LostItem {
  id: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  lastSeenLocation: string;
  date: Date;
  characteristics: ItemCharacteristics;
  images?: string[];
  reward?: number;
  status: 'pending' | 'found' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface FoundItem {
  id: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  foundLocation: string;
  whereStored?: string;
  date: Date;
  characteristics: ItemCharacteristics;
  images?: string[];
  status: 'pending' | 'claimed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  matchConfidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  lostItem?: LostItem;
  foundItem?: FoundItem;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  emailAddress?: string;
  phoneNumber?: string;
} 