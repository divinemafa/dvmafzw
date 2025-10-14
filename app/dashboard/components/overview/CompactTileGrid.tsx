/**
 * CompactTileGrid - Dense, colorful tile-based dashboard layout
 * Orchestrates dashboard view switching and layout management
 * 
 * REFACTORED: Individual cards extracted to separate components for maintainability
 * Ready for backend integration - each card can be wired independently
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { Booking, MarketplaceStats, Review, TabType, Listing } from '../../types';
import { useSavedLeads } from '../../hooks/useSavedLeads';
import { useProviderBookings } from '../../hooks/useProviderBookings';
import { useMessagesData } from '../../hooks/useMessagesData';
import { CreateListingModal } from '../content/listings/components/CreateListingModal';
import {
  SummaryTiles,
  CreateListingCard,
  ActivityOverviewCard,
  NextBookingCard,
  InboxResponseCard,
  SavedLeadsCard,
  RelationshipHealthCard,
  PendingRequestsCard,
  PipelineBookingsCard,
  LatestReviewsCard,
  RatingSummaryCard,
  parseDate,
  type TrendDescriptor,
  type ActivityPoint,
} from './tiles';

interface CompactTileGridProps {
  stats: MarketplaceStats;
  bookings: Booking[];
  reviews: Review[];
  onTabChange?: (tab: TabType) => void;
  listings?: Listing[];
  listingsLoading?: boolean;
}

type BookingStatus = Booking['status'];
type DashboardView = 'overview' | 'pipeline' | 'feedback';

const viewOptions: Array<{ value: DashboardView; label: string }> = [
  { value: 'overview', label: 'Snapshot' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'feedback', label: 'Feedback' },
];

const activityDayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const bookingStatusOrder: Record<BookingStatus, number> = {
  pending: 1,
  client_cancellation_requested: 2,
  provider_cancellation_requested: 3,
  confirmed: 4,
  completed: 5,
  cancelled: 6,
};

interface ScrollIndicatorsState {
  velocity: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

const SCROLL_DECAY = 0.88;
const SCROLL_VELOCITY_EPSILON = 0.004;

export const CompactTileGrid = ({ stats, bookings, reviews, onTabChange, listings = [], listingsLoading = false }: CompactTileGridProps) => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [isCompact, setIsCompact] = useState(false);
  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollIndicators, setScrollIndicators] = useState<ScrollIndicatorsState>({
    velocity: 0,
    canScrollUp: false,
    canScrollDown: false,
  });
  const msInDay = 24 * 60 * 60 * 1000;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialRange = (searchParams.get('range') as 'day' | 'week' | '30d' | null) ?? 'week';
  const [activityRange, setActivityRange] = useState<'day' | 'week' | '30d'>(initialRange);

  // Keep URL in sync when activityRange changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (params.get('range') !== activityRange) {
      params.set('range', activityRange);
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityRange]);

  // ✅ BACKEND INTEGRATION: Fetch real pending bookings data
  const {
    topBookings: realTopPendingBookings,
    totalCount: realPendingCount,
    trend: realSavedLeadTrend,
    loading: savedLeadsLoading,
    error: savedLeadsError,
  } = useSavedLeads();

  // ✅ BACKEND INTEGRATION: Fetch real messaging data
  const {
    responseRate: realResponseRate,
    avgResponseTime: realAvgResponseTime,
    trend: realResponseTrend,
    nextUnread: realNextUnread,
  } = useMessagesData();

  // ✅ BACKEND INTEGRATION: Fetch provider next booking
  const { upcomingBooking: realUpcomingBooking } = useProviderBookings();

  // Calculate status counts and revenue
  const statusCounts = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          acc.total += 1;
          acc.byStatus[booking.status] = (acc.byStatus[booking.status] ?? 0) + 1;
          acc.revenue += booking.amount ?? 0;
          return acc;
        },
        {
          total: 0,
          revenue: 0,
          byStatus: {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            client_cancellation_requested: 0,
            provider_cancellation_requested: 0,
          } satisfies Record<BookingStatus, number>,
        },
      ),
    [bookings],
  );

  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    if (!stats.totalViews) return 0;
    const ratio = (stats.completedBookings / stats.totalViews) * 100;
    return Math.min(100, Math.max(0, Number(ratio.toFixed(1))));
  }, [stats.completedBookings, stats.totalViews]);

  // Build activity series for chart (day/week/30d)
  const activitySeries = useMemo(() => {
    const now = new Date();
    const getBookingDate = (b: Booking): Date | null =>
      parseDate((b as any).preferredDate) ||
      parseDate((b as any).startDate) ||
      parseDate((b as any).date) ||
      parseDate((b as any).createdAt) ||
      parseDate((b as any).created_at) ||
      null;
    if (activityRange === 'day') {
      // Trailing 24 hours, aligned to the current hour
      const HOUR = 60 * 60 * 1000;
      const end = new Date(now);
      end.setMinutes(0, 0, 0); // start of current hour
      const startMs = end.getTime() - 23 * HOUR;
      const series: ActivityPoint[] = Array.from({ length: 24 }, (_, i) => {
        const ts = startMs + i * HOUR;
        const label = new Date(ts).getHours().toString().padStart(2, '0');
        return { label, completed: 0, cancelled: 0, inProgress: 0, total: 0 };
      });
      bookings.forEach((booking) => {
        const d = getBookingDate(booking);
        if (!d) return;
        const idx = Math.floor((d.getTime() - startMs) / HOUR);
        if (idx >= 0 && idx < 24) {
          const point = series[idx];
          point.total += 1;
          if (booking.status === 'completed') point.completed += 1;
          else if (booking.status === 'cancelled') point.cancelled += 1;
          else point.inProgress += 1;
        }
      });
      return series;
    }

    if (activityRange === '30d') {
      // trailing 30 days, oldest to newest [start, start+30d)
      const endDay = new Date(now);
      endDay.setHours(0, 0, 0, 0);
      const startMs = endDay.getTime() - 29 * msInDay;
      const endMs = startMs + 30 * msInDay;
      const series: ActivityPoint[] = Array.from({ length: 30 }, (_, i) => {
        const ts = startMs + i * msInDay;
        const d = new Date(ts);
        const label = `${d.getDate().toString().padStart(2, '0')}`; // day of month
        return { label, completed: 0, cancelled: 0, inProgress: 0, total: 0 };
      });
      bookings.forEach((booking) => {
        const d = getBookingDate(booking);
        if (!d) return;
        const t = d.getTime();
        if (t < startMs || t >= endMs) return;
        const index = Math.floor((t - startMs) / msInDay);
        const point = series[index];
        point.total += 1;
        if (booking.status === 'completed') point.completed += 1;
        else if (booking.status === 'cancelled') point.cancelled += 1;
        else point.inProgress += 1;
      });
      return series;
    }

    // week (Mon..Sun)
    const baseline = activityDayOrder.map<ActivityPoint>((label) => ({
      label,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
      total: 0,
    }));
    bookings.forEach((booking) => {
      const d = getBookingDate(booking);
      if (!d) return;
      const index = (d.getDay() + 6) % 7;
      const point = baseline[index];
      point.total += 1;
      if (booking.status === 'completed') point.completed += 1;
      else if (booking.status === 'cancelled') point.cancelled += 1;
      else point.inProgress += 1;
    });
    return baseline;
  }, [bookings, activityRange, msInDay]);

  function seriesStartDate(series: ActivityPoint[], now: Date) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (series.length - 1));
    return start.getTime();
  }

  function seriesEndDate(series: ActivityPoint[], now: Date) {
    const end = new Date(now);
    end.setHours(0, 0, 0, 0);
    return end.getTime();
  }

  const maxActivityValue = useMemo(() => {
    const values = activitySeries.map((point) => Math.max(point.total, point.completed + point.inProgress));
    return values.length ? Math.max(...values, 1) : 1;
  }, [activitySeries]);

  // Calculate period comparison (7-day vs previous 7-day)
  const periodComparison = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let currentStart: number;
    let previousStart: number;
    if (activityRange === 'day') {
      const HOUR = 60 * 60 * 1000;
      const end = new Date(now);
      end.setMinutes(0, 0, 0);
      currentStart = end.getTime() - 23 * HOUR; // trailing 24h
      previousStart = currentStart - 24 * HOUR;
    } else {
      const window = activityRange === 'week' ? 7 : 30;
      currentStart = today.getTime() - (window - 1) * msInDay;
      previousStart = currentStart - window * msInDay;
    }

    let currentTotal = 0;
    let previousTotal = 0;
    let currentCompleted = 0;
    let previousCompleted = 0;
    let currentCancelled = 0;
    let previousCancelled = 0;

    const getBookingDate = (b: Booking): Date | null =>
      parseDate((b as any).preferredDate) ||
      parseDate((b as any).startDate) ||
      parseDate((b as any).date) ||
      parseDate((b as any).createdAt) ||
      parseDate((b as any).created_at) ||
      null;

    bookings.forEach((booking) => {
      const parsed = getBookingDate(booking);
      if (!parsed) return;
      const time = parsed.getTime();
      if (time >= currentStart) {
        currentTotal += 1;
        if (booking.status === 'completed') currentCompleted += 1;
        if (booking.status === 'cancelled') currentCancelled += 1;
      } else if (time >= previousStart && time < currentStart) {
        previousTotal += 1;
        if (booking.status === 'completed') previousCompleted += 1;
        if (booking.status === 'cancelled') previousCancelled += 1;
      }
    });

    return {
      currentTotal,
      previousTotal,
      currentCompleted,
      previousCompleted,
      currentCancelled,
      previousCancelled,
    };
  }, [bookings, activityRange, msInDay]);

  // Build trend descriptors
  const buildTrendDescriptor = (
    current: number,
    previous?: number,
    options: { format?: 'count' | 'percent'; precision?: number } = {},
  ): TrendDescriptor | undefined => {
    if (previous == null) return undefined;
    if (previous === 0) {
      if (current === 0) return { direction: 'steady', label: 'Holding steady' };
      return { direction: 'up', label: 'New activity' };
    }

    const diff = current - previous;
    if (Math.abs(diff) < 0.0001) {
      return { direction: 'steady', label: 'Holding steady' };
    }

    const { format = 'count', precision = format === 'percent' ? 1 : 0 } = options;
    const magnitude = format === 'percent' ? Math.abs((diff / previous) * 100) : Math.abs(diff);
    const sign = diff > 0 ? '+' : '-';
    const suffix = format === 'percent' ? '%' : '';
    return {
      direction: diff > 0 ? 'up' : 'down',
      label: `${sign}${magnitude.toFixed(precision)}${suffix} vs prev`,
    };
  };

  const previousConversionRate = useMemo(() => {
    if (typeof stats.previousConversionRate === 'number') {
      return stats.previousConversionRate;
    }
    if (typeof stats.previousCompletedBookings === 'number' && typeof stats.previousTotalViews === 'number') {
      if (!stats.previousTotalViews) return undefined;
      const ratio = (stats.previousCompletedBookings / stats.previousTotalViews) * 100;
      return Number(ratio.toFixed(1));
    }
    if (periodComparison.previousCompleted && stats.totalViews) {
      const ratio = (periodComparison.previousCompleted / stats.totalViews) * 100;
      return Number(ratio.toFixed(1));
    }
    return undefined;
  }, [periodComparison.previousCompleted, stats.previousCompletedBookings, stats.previousConversionRate, stats.previousTotalViews, stats.totalViews]);

  // Build activity chart paths
  const activityPaths = useMemo(() => {
    if (!activitySeries.length) {
      return { totalArea: '', completedLine: '', cancelledLine: '', completedPoints: [], cancelledPoints: [] };
    }

    const step = activitySeries.length > 1 ? 100 / (activitySeries.length - 1) : 100;
    const toCoord = (value: number, index: number) => {
      const x = Number((step * index).toFixed(2));
      const y = Number((100 - (value / (maxActivityValue || 1)) * 100).toFixed(2));
      return `${x},${y}`;
    };

    const buildLine = (values: number[]) => {
      if (!values.length) return '';
      return values
        .map((value, index) => `${index === 0 ? 'M' : 'L'}${toCoord(value, index)}`)
        .join(' ');
    };

    const buildArea = (values: number[]) => {
      if (!values.length) return '';
      const lastX = Number((step * (values.length - 1)).toFixed(2));
      const segments = values
        .map((value, index) => `L${toCoord(value, index)}`)
        .join(' ');
      return `M0,100 ${segments} L${lastX},100 Z`;
    };

    const totals = activitySeries.map((point) => point.total);
    const completes = activitySeries.map((point) => point.completed);
    const cancels = activitySeries.map((point) => point.cancelled);

    const totalArea = buildArea(totals);
    const completedLine = buildLine(completes);
    const cancelledLine = buildLine(cancels);
    const completedPoints = completes.map((value, index) => {
      const [x, y] = toCoord(value, index).split(',').map(Number);
      return { x, y };
    });
    const cancelledPoints = cancels.map((value, index) => {
      const [x, y] = toCoord(value, index).split(',').map(Number);
      return { x, y };
    });

    return { totalArea, completedLine, cancelledLine, completedPoints, cancelledPoints };
  }, [activitySeries, maxActivityValue]);

  // ❌ REMOVED: Mock pending bookings calculation (replaced with real API data)
  // const pendingBookings = useMemo(
  //   () =>
  //     bookings
  //       .filter((booking) => booking.status === 'pending')
  //       .map((booking) => ({
  //         booking,
  //         timestamp: parseDate(booking.startDate ?? booking.date ?? null)?.getTime() ?? Infinity,
  //       }))
  //       .sort((a, b) => a.timestamp - b.timestamp)
  //       .map(({ booking }) => booking),
  //   [bookings],
  // );

  // ✅ BACKEND INTEGRATION: Use real pending bookings from API
  const topPendingBookings = realTopPendingBookings;
  const pendingBookings = realTopPendingBookings; // For backward compatibility with other cards
  const pipelineInProgress = statusCounts.byStatus.pending + statusCounts.byStatus.confirmed;
  const responseGoalHours = stats.responseGoalHours ?? 1;

  // Get upcoming booking
  const upcomingBooking = useMemo(() => {
    if (realUpcomingBooking) return realUpcomingBooking;
    const withDate = bookings
      .filter((booking) => !['completed', 'cancelled'].includes(booking.status))
      .map((booking) => ({
        booking,
        time: Math.min(
          parseDate(booking.preferredDate ?? booking.startDate)?.getTime() ?? Infinity,
          parseDate(booking.date)?.getTime() ?? Infinity,
        ),
      }))
      .filter(({ time }) => Number.isFinite(time))
      .sort((a, b) => a.time - b.time);

    return withDate[0]?.booking ?? null;
  }, [bookings, realUpcomingBooking]);

  // Get latest reviews
  const latestReviews = useMemo(() => {
    const withTime = reviews
      .map((review) => ({
        review,
        time: Math.max(parseDate(review.createdAt)?.getTime() ?? -Infinity, parseDate(review.date)?.getTime() ?? -Infinity),
      }))
      .sort((a, b) => b.time - a.time);
    return withTime.slice(0, 4).map(({ review }) => review);
  }, [reviews]);

  // Calculate derived metrics
  const averageTicketValue = useMemo(() => {
    if (!statusCounts.total) return 0;
    return statusCounts.revenue / statusCounts.total;
  }, [statusCounts.revenue, statusCounts.total]);

  const bookingCurrency = useMemo(() => 'USD', []);

  const returningClients = useMemo(() => {
    const occurrences = bookings.reduce<Map<string, number>>((acc, booking) => {
      if (!booking.client) return acc;
      const current = acc.get(booking.client) ?? 0;
      acc.set(booking.client, current + 1);
      return acc;
    }, new Map());

    let returning = 0;
    occurrences.forEach((count) => {
      if (count > 1) {
        returning += 1;
      }
    });
    return returning;
  }, [bookings]);

  const newClientsThisWeek = useMemo(() => {
    const uniqueClients = new Set<string>();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    bookings.forEach((booking) => {
      if (!booking.client) return;
      const candidate = parseDate(booking.startDate ?? booking.date ?? null);
      if (!candidate) return;
      if (candidate.getTime() >= weekAgo) {
        uniqueClients.add(booking.client);
      }
    });

    return uniqueClients.size;
  }, [bookings]);

  const loyaltyRatio = useMemo(() => {
    const total = returningClients + newClientsThisWeek;
    if (!total) return 0;
    return Math.round((returningClients / total) * 100);
  }, [newClientsThisWeek, returningClients]);

  // Format date function
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
    [],
  );

  const formatDate = useMemo(() => {
    return (value?: string | null) => {
      const parsed = parseDate(value);
      return parsed ? formatter.format(parsed) : null;
    };
  }, [formatter]);

  // Calculate trends
  const activeListingsTrend = buildTrendDescriptor(stats.activeListings, stats.previousActiveListings, { format: 'count' });
  const pipelineTrend = buildTrendDescriptor(statusCounts.total, periodComparison.previousTotal, { format: 'count' });
  const conversionTrendDescriptor = buildTrendDescriptor(conversionRate, previousConversionRate, {
    format: 'percent',
    precision: 1,
  });
  const ratingTrend = buildTrendDescriptor(stats.averageRating, stats.previousAverageRating, { precision: 1 });
  const completedTrend = buildTrendDescriptor(periodComparison.currentCompleted, periodComparison.previousCompleted, {
    format: 'percent',
    precision: 1,
  });
  const cancelledTrend = buildTrendDescriptor(periodComparison.currentCancelled, periodComparison.previousCancelled, {
    format: 'count',
  });
  const totalTrend = buildTrendDescriptor(periodComparison.currentTotal, periodComparison.previousTotal, {
    format: 'percent',
    precision: 1,
  });
  const responseTrend = buildTrendDescriptor(stats.responseRate, stats.previousResponseRate, {
    format: 'percent',
    precision: 1,
  });
  // ❌ REMOVED: Mock saved lead trend (replaced with real API data)
  // const savedLeadTrend = buildTrendDescriptor(stats.pendingBookings, stats.previousPendingBookings, {
  //   format: 'count',
  // });
  // ✅ BACKEND INTEGRATION: Use real trend from API (convert null to undefined for type compatibility)
  const savedLeadTrend = realSavedLeadTrend ?? undefined;
  const pipelineInProgressTrend = buildTrendDescriptor(pipelineInProgress, stats.previousPipelineTotal, {
    format: 'count',
  });

  // ✅ BACKEND INTEGRATION: Use real response rate from messaging data
  const responseRateValue = Math.min(Math.max(realResponseRate ?? 0, 0), 100);
  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - responseRateValue / 100);

  // ✅ BACKEND INTEGRATION: Handler for opening messages tab
  const handleOpenMessages = () => {
    if (onTabChange) {
      onTabChange('messages');
    }
  };

  // Spacing classes
  const verticalGap = isCompact ? 'gap-3' : 'gap-5';
  const summaryGap = isCompact ? 'gap-2' : 'gap-3';
  const layoutGap = isCompact ? 'gap-3' : 'gap-4';
  const clusterGap = isCompact ? 'gap-2.5' : 'gap-3';
  const bookingListSpacing = isCompact ? 'space-y-2.5' : 'space-y-3';
  const reviewListSpacing = isCompact ? 'space-y-2.5' : 'space-y-3';

  // Scroll handling
  const scrollVelocityStyle = useMemo(
    () => ({ '--scroll-velocity': scrollIndicators.velocity.toFixed(3) }) as CSSProperties,
    [scrollIndicators.velocity],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrame: number | null = null;
    let pendingVelocity = 0;
    let lastScrollTop = container.scrollTop;
    let lastTimestamp = performance.now();

    const updateBounds = () => {
      const canScrollUp = container.scrollTop > 2;
      const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight - 2;
      setScrollIndicators((prev) => {
        if (prev.canScrollUp === canScrollUp && prev.canScrollDown === canScrollDown) return prev;
        return { ...prev, canScrollUp, canScrollDown };
      });
    };

    const decayVelocity = () => {
      pendingVelocity *= SCROLL_DECAY;
      if (pendingVelocity < SCROLL_VELOCITY_EPSILON) {
        pendingVelocity = 0;
        animationFrame = null;
        setScrollIndicators((prev) => (prev.velocity === 0 ? prev : { ...prev, velocity: 0 }));
        return;
      }

      const nextVelocity = parseFloat(pendingVelocity.toFixed(3));
      setScrollIndicators((prev) => (Math.abs(prev.velocity - nextVelocity) < 0.003 ? prev : { ...prev, velocity: nextVelocity }));
      animationFrame = requestAnimationFrame(decayVelocity);
    };

    const handleScroll = () => {
      const now = performance.now();
      const delta = container.scrollTop - lastScrollTop;
      const elapsed = Math.max(now - lastTimestamp, 16);
      const rawVelocity = Math.min(Math.abs(delta / elapsed), 1);

      lastScrollTop = container.scrollTop;
      lastTimestamp = now;
      pendingVelocity = rawVelocity;

      const canScrollUp = container.scrollTop > 2;
      const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight - 2;

      setScrollIndicators({ velocity: parseFloat(rawVelocity.toFixed(3)), canScrollUp, canScrollDown });

      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(decayVelocity);
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(container);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({ top: 0, behavior: 'smooth' });

    const updateAfterFrame = () => {
      const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight - 2;
      setScrollIndicators({ velocity: 0, canScrollUp: false, canScrollDown });
    };

    const frame = requestAnimationFrame(() => requestAnimationFrame(updateAfterFrame));

    return () => cancelAnimationFrame(frame);
  }, [activeView, isCompact]);

  // View layouts
  const overviewView = (
    <section
      className={`relative z-10 snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.2fr,1.6fr,1.1fr]`}
    >
  <div className={`relative z-10 grid content-start ${clusterGap}`}>
        <CreateListingCard 
          compact={isCompact} 
          onCreateClick={() => setCreateListingModalOpen(true)}
          listings={listings}
          loading={listingsLoading}
        />
        <RelationshipHealthCard
          compact={isCompact}
          newClientsThisWeek={newClientsThisWeek}
          returningClients={returningClients}
          loyaltyRatio={loyaltyRatio}
          averageTicketValue={averageTicketValue}
          bookingCurrency={bookingCurrency}
        />
      </div>
  <div className={`relative z-10 grid content-start ${clusterGap}`}>
        <ActivityOverviewCard
          compact={isCompact}
          activitySeries={activitySeries}
          activityPaths={activityPaths}
          periodComparison={periodComparison}
          completedTrend={completedTrend}
          totalTrend={totalTrend}
          cancelledTrend={cancelledTrend}
          selectedRange={activityRange}
          onRangeChange={setActivityRange}
        />
        <SavedLeadsCard
          compact={isCompact}
          stats={{
            ...stats,
            // ✅ BACKEND INTEGRATION: Use real pending count from API
            pendingBookings: realPendingCount,
          }}
          topPendingBookings={topPendingBookings}
          formatDate={formatDate}
          savedLeadTrend={savedLeadTrend}
        />
      </div>
  <div className={`relative z-10 grid content-start ${clusterGap}`}>
        <NextBookingCard
          compact={isCompact}
          upcomingBooking={upcomingBooking}
          formatDate={formatDate}
          bookingCurrency={bookingCurrency}
        />
        <InboxResponseCard
          compact={isCompact}
          stats={{
            ...stats,
            responseTime: realAvgResponseTime, // ✅ BACKEND INTEGRATION: Use real avg response time
          }}
          responseRateValue={responseRateValue}
          gaugeRadius={gaugeRadius}
          gaugeCircumference={gaugeCircumference}
          gaugeOffset={gaugeOffset}
          responseGoalHours={responseGoalHours}
          responseTrend={realResponseTrend} // ✅ BACKEND INTEGRATION: Use real trend from messages
          nextUnread={
            realNextUnread
              ? {
                  senderName: realNextUnread.senderName ?? 'Unknown',
                  preview: realNextUnread.preview ?? 'No preview available',
                }
              : null
          }
          onOpenMessages={handleOpenMessages}
        />
        <PendingRequestsCard
          compact={isCompact}
          pendingBookings={pendingBookings}
          pipelineInProgress={pipelineInProgress}
          statusCounts={statusCounts}
          formatDate={formatDate}
          bookingCurrency={bookingCurrency}
          pipelineInProgressTrend={pipelineInProgressTrend}
        />
      </div>
    </section>
  );

  const pipelineView = (
    <section
      className={`relative z-10 snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.6fr,1fr]`}
    >
      <PipelineBookingsCard
        compact={isCompact}
        bookings={bookings}
        statusCounts={statusCounts}
        averageTicketValue={averageTicketValue}
        bookingCurrency={bookingCurrency}
        formatDate={formatDate}
        bookingListSpacing={bookingListSpacing}
      />
      <div className={`relative z-10 grid ${clusterGap}`}>
        <SavedLeadsCard
          compact={isCompact}
          stats={stats}
          topPendingBookings={topPendingBookings}
          formatDate={formatDate}
          savedLeadTrend={savedLeadTrend}
        />
        <PendingRequestsCard
          compact={isCompact}
          pendingBookings={pendingBookings}
          pipelineInProgress={pipelineInProgress}
          statusCounts={statusCounts}
          formatDate={formatDate}
          bookingCurrency={bookingCurrency}
          pipelineInProgressTrend={pipelineInProgressTrend}
        />
      </div>
    </section>
  );

  const feedbackView = (
    <section
      className={`relative z-10 snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.4fr,1fr]`}
    >
      <LatestReviewsCard
        compact={isCompact}
        latestReviews={latestReviews}
        formatDate={formatDate}
        reviewListSpacing={reviewListSpacing}
      />
      <div className={`relative z-10 grid ${clusterGap}`}>
        <RatingSummaryCard compact={isCompact} stats={stats} conversionRate={conversionRate} />
        <RelationshipHealthCard
          compact={isCompact}
          newClientsThisWeek={newClientsThisWeek}
          returningClients={returningClients}
          loyaltyRatio={loyaltyRatio}
          averageTicketValue={averageTicketValue}
          bookingCurrency={bookingCurrency}
        />
      </div>
    </section>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'pipeline':
        return pipelineView;
      case 'feedback':
        return feedbackView;
      case 'overview':
      default:
        return overviewView;
    }
  };

  const frameClasses = [
    'relative isolate flex min-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[32px]',
    'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
    'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
  ].join(' ');

  const frameOverlayClasses =
    'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

  const contentShellClasses = [
    'relative flex-1 overflow-hidden rounded-[26px]',
    'border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_45px_120px_-80px_rgba(59,130,246,0.45)]',
  ].join(' ');

  const contentOverlayClasses =
    'pointer-events-none absolute inset-0 -z-10 rounded-[26px] border border-white/5 bg-gradient-to-b from-white/10 via-transparent to-white/5';

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className={`relative z-10 flex flex-col ${verticalGap}`}>
        {/* Summary Tiles */}
        <SummaryTiles
          compact={isCompact}
          stats={stats}
          statusCounts={statusCounts}
          periodComparison={periodComparison}
          conversionRate={conversionRate}
          summaryGap={summaryGap}
          activeListingsTrend={activeListingsTrend}
          pipelineTrend={pipelineTrend}
          conversionTrendDescriptor={conversionTrendDescriptor}
          ratingTrend={ratingTrend}
          activitySeries={activitySeries}
        />

        {/* View Toggle & Compact Mode */}
        <div className={`flex flex-wrap items-center justify-between ${isCompact ? 'gap-2' : 'gap-3'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveView(option.value)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
                  activeView === option.value
                    ? 'border-white/30 bg-white/15 text-white shadow-[0_4px_24px_-8px_rgba(255,255,255,0.2)]'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 transition hover:border-white/20 hover:text-white/80"
          >
            {isCompact ? 'Expand' : 'Compact'}
            {isCompact ? <ChevronDownIcon className="h-4 w-4" aria-hidden /> : <ChevronUpIcon className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        {/* Content Shell with Scroll */}
        <div className={contentShellClasses}>
          <div className={contentOverlayClasses} aria-hidden />
          <div
            ref={scrollContainerRef}
            className="relative z-10 h-full snap-y snap-mandatory overflow-y-auto overscroll-contain p-6 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
            style={scrollVelocityStyle}
          >
            {renderActiveView()}
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={createListingModalOpen}
        onClose={() => setCreateListingModalOpen(false)}
        mode="create"
      />
    </div>
  );
};
