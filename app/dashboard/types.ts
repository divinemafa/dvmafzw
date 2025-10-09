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

// Dashboard Navigation Types
// Ordered by priority: Business-critical first, supporting tools last
export type TabType = 
  | 'overview'    // 1. Dashboard home
  | 'content'     // 2. Products/Listings (MOST IMPORTANT)
  | 'finance'     // 3. Money management
  | 'bookings'    // 4. Active appointments
  | 'reviews'     // 5. Customer feedback
  | 'clients'     // 6. Customer management
  | 'analytics'   // 7. Performance insights
  | 'messages'    // 8. Communication (supporting)
  | 'calendar'    // 9. Scheduling (supporting)
  | 'settings';   // 10. Product/business settings (NOT profile settings)

// Client/Customer Types
export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  rating: number;
  joined: string;
}

// Message Types
export interface Message {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  bookingId?: string;
}

// Calendar/Schedule Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'booking' | 'blocked' | 'available';
  clientName?: string;
  status?: 'confirmed' | 'pending' | 'completed';
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

// Analytics Types
export interface AnalyticsData {
  period: string;
  revenue: number;
  bookings: number;
  views: number;
  conversion: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export type TabType_OLD = 'overview' | 'content' | 'finance';
