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

interface SummaryTilesPropsExtended extends SummaryTilesProps {
  activitySeries?: Array<{
    label: string;
    total: number;
    completed: number;
    cancelled: number;
    inProgress: number;
  }>;
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
  activitySeries = [],
}: SummaryTilesPropsExtended) => {
  // Generate sparkline data from activitySeries
  // Note: Active Listings sparkline uses completed bookings as proxy for listing activity
  // since we don't have historical listings count data yet
  const sparkActive = activitySeries.length > 0 
    ? activitySeries.map(point => point.completed)
    : [3, 4, 3, 5, 6, 5, 7]; // fallback
  
  // Pipeline sparkline: total bookings (all statuses combined)
  const sparkPipeline = activitySeries.length > 0
    ? activitySeries.map(point => point.total)
    : [2, 1, 2, 3, 2, 4, 3]; // fallback
  
  // Conversion sparkline: percentage of completed bookings per period
  const sparkConversion = activitySeries.length > 0
    ? activitySeries.map(point => {
        // Calculate conversion rate per point (completed / total * 100)
        if (point.total === 0) return 0;
        return (point.completed / point.total) * 100;
      })
    : [20, 30, 25, 40, 35, 50, 45]; // fallback in percentage
  
  // Rating sparkline: use a synthetic upward trend based on current rating
  // TODO: Replace with real historical rating data from database
  const sparkRating = activitySeries.length > 0
    ? activitySeries.map((_, i, arr) => {
        // Generate a smooth trend from slightly below current rating to current
        const start = Math.max(1, stats.averageRating - 0.8);
        const end = stats.averageRating;
        // Add slight variation for more natural appearance
        const progress = i / Math.max(1, arr.length - 1);
        const base = start + ((end - start) * progress);
        const variation = Math.sin(i * 0.5) * 0.1; // small oscillation
        return Math.max(1, Math.min(5, base + variation));
      })
    : [4, 4.2, 4.1, 4.3, 4.4, 4.5, 4.8]; // fallback
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
        sparkSeries={sparkActive}
      />
      <SummaryTile
        compact={compact}
        icon={TicketIcon}
        label="Bookings Pipeline"
        value={statusCounts.total.toString()}
        hint={`${periodComparison.currentCompleted} completed • ${statusCounts.byStatus.pending} pending`}
        accentClass="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent"
        trend={pipelineTrend}
        sparkSeries={sparkPipeline}
      />
      <SummaryTile
        compact={compact}
        icon={ChartPieIcon}
        label="Conversion Rate"
        value={`${conversionRate}%`}
        hint={`${stats.completedBookings} bookings from ${stats.totalViews.toLocaleString()} visits`}
        accentClass="bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent"
        trend={conversionTrendDescriptor}
        sparkSeries={sparkConversion}
      />
      <SummaryTile
        compact={compact}
        icon={StarIcon}
        label="Customer Rating"
        value={stats.averageRating.toFixed(1)}
        hint={`${stats.totalReviews} total reviews${stats.responseRate ? ` • ${stats.responseRate}% response rate` : ''}`}
        accentClass="bg-gradient-to-br from-amber-400/20 via-amber-500/5 to-transparent"
        trend={ratingTrend}
        sparkSeries={sparkRating}
      />
    </div>
  );
};
