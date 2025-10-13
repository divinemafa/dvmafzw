/**
 * RatingSummaryCard - Overall satisfaction metrics
 * Shows average rating, total reviews, conversion rate, and response rate
 */

'use client';

import { StarIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import type { MarketplaceStats } from '../../../types';

interface RatingSummaryCardProps {
  compact: boolean;
  stats: MarketplaceStats;
  conversionRate: number;
}

export const RatingSummaryCard = ({
  compact,
  stats,
  conversionRate,
}: RatingSummaryCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Rating Summary"
      subtitle="Overall satisfaction at a glance"
      icon={StarIcon}
    >
      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Average rating</p>
          <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-semibold text-white`}>{stats.averageRating.toFixed(1)}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Total reviews</p>
          <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-semibold text-white`}>{stats.totalReviews}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Conversion rate</p>
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold text-white`}>{conversionRate}%</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Response rate</p>
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold text-white`}>{stats.responseRate}%</p>
        </div>
      </div>
    </SectionCard>
  );
};
