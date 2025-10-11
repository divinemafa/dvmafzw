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
  responseGoalHours?: number;
  previousActiveListings?: number;
  previousPendingBookings?: number;
  previousPipelineTotal?: number;
  previousCompletedBookings?: number;
  previousTotalViews?: number;
  previousConversionRate?: number;
  previousAverageRating?: number;
  previousResponseRate?: number;
  trends?: {
    activeListings?: number;
    pipelineBookings?: number;
    conversionRate?: number;
    averageRating?: number;
  };
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
  imageUrl?: string | null;
}

export interface Booking {
  id: string | number;
  // primary display fields (legacy)
  service?: string;
  client?: string;
  date?: string;
  time?: string;
  amount?: number;
  // fields used by dashboard components
  listingTitle?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  location?: string | null;
  // Legacy datasets shipped location under a misspelled key; keep for compatibility
  loaction?: string | null;
  // include cancelled for broader status handling
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export interface Review {
  id: number | string;
  service?: string;
  client?: string;
  rating: number;
  comment: string;
  // UI-friendly fields
  reviewerName?: string;
  createdAt?: string;
  date?: string;
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
  // both aliases supported
  avatar?: string | null;
  avatarUrl?: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  rating?: number;
  // createdAt used in components
  createdAt?: string;
  joined?: string;
  // UI convenience
  isActive?: boolean;
  company?: string | null;
  phone?: string | null;
  preferredChannel?: 'email' | 'sms' | 'phone' | 'in-app';
  tags?: string[];
  consentStatus?: 'granted' | 'revoked' | 'pending';
  complianceTier?: 'verified' | 'pending' | 'restricted';
  outstandingDocuments?: number;
  openInvoices?: number;
  outstandingBalance?: number;
  lastInvoiceAt?: string;
  currency?: string;
  nextMilestone?: string;
}

// Message Types
export interface Message {
  id: string;
  // legacy / server-side shape
  clientId?: string;
  clientName?: string;
  clientAvatar?: string | null;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  bookingId?: string;

  // dashboard / UI-friendly fields
  senderName?: string;
  sentAt?: string;
  subject?: string;
  preview?: string;
  isRead?: boolean;
}

// Calendar/Schedule Types
export interface CalendarEvent {
  id: string;
  title: string;
  // canonical timestamps
  start?: string; // ISO
  end?: string; // ISO
  // UI-friendly aliases
  startTime?: string;
  endTime?: string;
  description?: string;
  // allow meeting type used by components
  type: 'booking' | 'blocked' | 'available' | 'meeting' | 'automation';
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
  // canonical fields
  period?: string;
  revenue?: number;
  bookings?: number;
  views?: number;
  conversion?: number;

  // UI/more detailed metrics used in components
  totalViews?: number;
  totalClicks?: number;
  conversionRate?: number; // percent
  averageSessionDuration?: number; // seconds
  bounceRate?: number; // percent
  revenueGrowth?: number; // percent
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export type TabType_OLD = 'overview' | 'content' | 'finance';
