
export interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contactInfo: string;
  status: 'open' | 'closed';
  userId: string;
  createdAt: string;
  image?: string;
  gmail?: string;
}

export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'userId' | 'status'>;
