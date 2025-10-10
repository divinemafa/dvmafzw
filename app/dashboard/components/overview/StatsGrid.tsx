import { DocumentTextIcon, CalendarIcon, StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { MarketplaceStats } from '../../types';

interface StatsGridProps {
  stats: MarketplaceStats;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const statCards = [
    {
      label: 'Active Listings',
      value: stats.activeListings,
      subtext: `${stats.totalViews.toLocaleString()} views`,
      icon: DocumentTextIcon,
      bgGradient: 'from-blue-600 to-blue-500',
      trend: null,
    },
    {
      label: 'Bookings',
      value: stats.pendingBookings,
      subtext: `${stats.completedBookings} completed`,
      icon: CalendarIcon,
      bgGradient: 'from-emerald-600 to-emerald-500',
      trend: '+12%',
    },
    {
      label: 'Rating',
      value: stats.averageRating,
      subtext: `${stats.totalReviews} reviews`,
      icon: StarIcon,
      bgGradient: 'from-yellow-600 to-yellow-500',
      trend: null,
    },
    {
      label: 'Response Rate',
      value: `${stats.responseRate}%`,
      subtext: `Avg ${stats.responseTime}`,
      icon: ChatBubbleLeftRightIcon,
      bgGradient: 'from-purple-600 to-purple-500',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-0">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`group relative overflow-hidden bg-gradient-to-br ${card.bgGradient} p-3 backdrop-blur-xl transition-all duration-300 hover:brightness-110`}
        >
          <div className="relative">
            {/* Icon and Trend */}
            <div className="mb-2 flex items-start justify-between">
              <card.icon className="h-5 w-5 text-white/90" />
              {card.trend && (
                <span className="bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {card.trend}
                </span>
              )}
            </div>

            {/* Value */}
            <p className="mb-0.5 text-2xl font-bold text-white">
              {card.value}
            </p>

            {/* Label */}
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {card.label}
            </p>

            {/* Subtext */}
            <p className="text-[10px] text-white/70">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
