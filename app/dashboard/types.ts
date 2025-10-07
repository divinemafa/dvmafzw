// Dashboard Types
export interface MarketplaceStats {
  activeListings: number;
  totalViews: number;
  pendingBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  responseTime: string;
}

export interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  views: number;
  bookings: number;
  status: 'active' | 'paused' | 'draft';
  featured: boolean;
  rating: number;
}

export interface Booking {
  id: number;
  service: string;
  client: string;
  date: string;
  time: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface Review {
  id: number;
  service: string;
  client: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserData {
  bmcBalance: number;
  fiatBalance: number;
  currency: string;
  pendingRewards: number;
  totalEarned: number;
  level: string;
  joinDate: string;
}

export interface Activity {
  type: 'earn' | 'spend';
  action: string;
  amount: number;
  time: string;
}

export interface EarnOpportunity {
  title: string;
  reward: number;
  icon: React.ComponentType<{ className?: string }>;
  status: 'available' | 'locked';
}

export interface PremiumFeature {
  title: string;
  cost: number;
  period: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export type TabType = 'overview' | 'content' | 'finance';
