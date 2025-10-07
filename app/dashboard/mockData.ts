import {
  UserCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
  GiftIcon,
  StarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { MarketplaceStats, Listing, Booking, Review, UserData, Activity, EarnOpportunity, PremiumFeature } from './types';

// Marketplace Overview Mock Data
export const mockMarketplaceStats: MarketplaceStats = {
  activeListings: 5,
  totalViews: 1243,
  pendingBookings: 3,
  completedBookings: 28,
  averageRating: 4.8,
  totalReviews: 24,
  responseRate: 95,
  responseTime: '2 hours',
};

export const mockListings: Listing[] = [
  { 
    id: 1, 
    title: 'Professional House Cleaning', 
    category: 'Home Services', 
    price: 450, 
    currency: 'ZAR',
    views: 324, 
    bookings: 12, 
    status: 'active',
    featured: true,
    rating: 4.9,
  },
  { 
    id: 2, 
    title: 'Garden Maintenance & Landscaping', 
    category: 'Outdoor Services', 
    price: 600, 
    currency: 'ZAR',
    views: 189, 
    bookings: 8, 
    status: 'active',
    featured: false,
    rating: 4.7,
  },
  { 
    id: 3, 
    title: 'Math Tutoring (High School)', 
    category: 'Education', 
    price: 250, 
    currency: 'ZAR',
    views: 521, 
    bookings: 15, 
    status: 'active',
    featured: true,
    rating: 5.0,
  },
  { 
    id: 4, 
    title: 'Pet Sitting & Dog Walking', 
    category: 'Pet Care', 
    price: 200, 
    currency: 'ZAR',
    views: 156, 
    bookings: 6, 
    status: 'paused',
    featured: false,
    rating: 4.8,
  },
  { 
    id: 5, 
    title: 'Plumbing Repairs & Installation', 
    category: 'Home Services', 
    price: 550, 
    currency: 'ZAR',
    views: 53, 
    bookings: 2, 
    status: 'draft',
    featured: false,
    rating: 0,
  },
];

export const mockBookings: Booking[] = [
  { 
    id: 1, 
    service: 'Professional House Cleaning',
    client: 'Sarah M.',
    date: '2025-10-08',
    time: '09:00 AM',
    amount: 450,
    status: 'confirmed',
  },
  { 
    id: 2, 
    service: 'Math Tutoring (High School)',
    client: 'John D.',
    date: '2025-10-07',
    time: '03:00 PM',
    amount: 250,
    status: 'pending',
  },
  { 
    id: 3, 
    service: 'Garden Maintenance',
    client: 'Mike K.',
    date: '2025-10-06',
    time: '08:00 AM',
    amount: 600,
    status: 'completed',
  },
  { 
    id: 4, 
    service: 'Professional House Cleaning',
    client: 'Linda P.',
    date: '2025-10-05',
    time: '10:00 AM',
    amount: 450,
    status: 'completed',
  },
];

export const mockReviews: Review[] = [
  {
    id: 1,
    service: 'Math Tutoring (High School)',
    client: 'Emma W.',
    rating: 5,
    comment: 'Excellent tutor! My son improved his grades significantly.',
    date: '2 days ago',
  },
  {
    id: 2,
    service: 'Professional House Cleaning',
    client: 'David L.',
    rating: 5,
    comment: 'Very professional and thorough. Highly recommend!',
    date: '5 days ago',
  },
  {
    id: 3,
    service: 'Garden Maintenance',
    client: 'Rachel T.',
    rating: 4,
    comment: 'Good service, arrived on time. Minor issues but overall satisfied.',
    date: '1 week ago',
  },
];

// Finance Mock Data
export const mockUserData: UserData = {
  bmcBalance: 1245,
  fiatBalance: 2450.50,
  currency: 'ZAR',
  pendingRewards: 125,
  totalEarned: 3450,
  level: 'Pro Member',
  joinDate: 'March 2025',
};

export const mockActivity: Activity[] = [
  { type: 'earn', action: 'Completed booking', amount: 25, time: '2 hours ago' },
  { type: 'spend', action: 'Featured listing', amount: -50, time: '5 hours ago' },
  { type: 'earn', action: 'Received 5-star review', amount: 30, time: '1 day ago' },
  { type: 'earn', action: 'Referral bonus', amount: 100, time: '2 days ago' },
  { type: 'spend', action: 'Boosted service', amount: -20, time: '3 days ago' },
];

export const mockEarnOpportunities: EarnOpportunity[] = [
  { title: 'Complete your profile', reward: 25, icon: UserCircleIcon, status: 'available' },
  { title: 'Verify your ID', reward: 50, icon: ShieldCheckIcon, status: 'available' },
  { title: 'List your first service', reward: 50, icon: SparklesIcon, status: 'available' },
  { title: 'Get your first booking', reward: 100, icon: BoltIcon, status: 'locked' },
  { title: 'Refer 3 friends', reward: 300, icon: GiftIcon, status: 'locked' },
];

export const mockPremiumFeatures: PremiumFeature[] = [
  { title: 'Featured Listing', cost: 50, period: '/week', icon: StarIcon, color: 'from-yellow-500/60 to-orange-500/60' },
  { title: 'Top Search Boost', cost: 20, period: '/day', icon: ArrowTrendingUpIcon, color: 'from-blue-500/60 to-cyan-500/60' },
  { title: 'Verified Pro Badge', cost: 100, period: '/month', icon: ShieldCheckIcon, color: 'from-purple-500/60 to-pink-500/60' },
  { title: 'Priority Support', cost: 25, period: '/month', icon: BoltIcon, color: 'from-emerald-500/60 to-teal-500/60' },
];
