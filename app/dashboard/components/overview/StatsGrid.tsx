import { DocumentTextIcon, CalendarIcon, StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { MarketplaceStats } from '../../types';

interface StatsGridProps {
  stats: MarketplaceStats;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Active Listings */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Active Listings</span>
          <DocumentTextIcon className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-white">{stats.activeListings}</p>
        <p className="mt-1 text-xs text-white/50">{stats.totalViews.toLocaleString()} total views</p>
      </div>

      {/* Bookings */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Bookings</span>
          <CalendarIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
        <p className="mt-1 text-xs text-emerald-300">{stats.completedBookings} completed</p>
      </div>

      {/* Rating */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Rating</span>
          <StarIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
        <p className="mt-1 text-xs text-white/50">{stats.totalReviews} reviews</p>
      </div>

      {/* Response Rate */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Response Rate</span>
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400" />
        </div>
        <p className="text-2xl font-bold text-white">{stats.responseRate}%</p>
        <p className="mt-1 text-xs text-white/50">Avg {stats.responseTime}</p>
      </div>
    </div>
  );
};
