export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 