/**
 * SummaryTiles - Top-level metrics tiles for dashboard
 * Displays key performance indicators: Active Listings, Pipeline, Conversion, Rating
 */

'use client';

import {
  DocumentTextIcon,
  TicketIcon,
  ChartPieIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { SummaryTile } from './SummaryTile';
import type { MarketplaceStats } from '../../../types';
import type { TrendDescriptor } from './shared/types';

interface StatusCounts {
  total: number;
  byStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    client_cancellation_requested: number;
    provider_cancellation_requested: number;
  };
}

interface PeriodComparison {
  currentCompleted: number;
  currentTotal: number;
  currentCancelled: number;
}

interface SummaryTilesProps {
  compact: boolean;
  stats: MarketplaceStats;
  statusCounts: StatusCounts;
  periodComparison: PeriodComparison;
  conversionRate: number;
  summaryGap: string;
  activeListingsTrend?: TrendDescriptor;
  pipelineTrend?: TrendDescriptor;
  conversionTrendDescriptor?: TrendDescriptor;
  ratingTrend?: TrendDescriptor;
}

export const SummaryTiles = ({
  compact,
  stats,
  statusCounts,
  periodComparison,
  conversionRate,
  summaryGap,
  activeListingsTrend,
  pipelineTrend,
  conversionTrendDescriptor,
  ratingTrend,
}: SummaryTilesProps) => {
  return (
    <div className={`grid md:grid-cols-2 xl:grid-cols-4 ${summaryGap}`}>
      <SummaryTile
        compact={compact}
        icon={DocumentTextIcon}
        label="Active Listings"
        value={stats.activeListings.toString()}
        hint={`${stats.totalViews.toLocaleString()} views this month`}
        accentClass="bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent"
        trend={activeListingsTrend}
      />
      <SummaryTile
        compact={compact}
        icon={TicketIcon}
        label="Bookings Pipeline"
        value={statusCounts.total.toString()}
        hint={`${periodComparison.currentCompleted} completed • ${statusCounts.byStatus.pending} pending`}
        accentClass="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent"
        trend={pipelineTrend}
      />
      <SummaryTile
        compact={compact}
        icon={ChartPieIcon}
        label="Conversion Rate"
        value={`${conversionRate}%`}
        hint={`${stats.completedBookings} bookings from ${stats.totalViews.toLocaleString()} visits`}
        accentClass="bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent"
        trend={conversionTrendDescriptor}
      />
      <SummaryTile
        compact={compact}
        icon={StarIcon}
        label="Customer Rating"
        value={stats.averageRating.toFixed(1)}
        hint={`${stats.totalReviews} total reviews${stats.responseRate ? ` • ${stats.responseRate}% response rate` : ''}`}
        accentClass="bg-gradient-to-br from-amber-400/20 via-amber-500/5 to-transparent"
        trend={ratingTrend}
      />
    </div>
  );
};
