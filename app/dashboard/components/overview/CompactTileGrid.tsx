/**
 * CompactTileGrid - Dense, colorful tile-based dashboard layout
 * Inspired by modern dashboard designs with collapsible sections
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';

import {
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BookmarkIcon,
  ClockIcon,
  MinusSmallIcon,
  SparklesIcon,
  UserGroupIcon,
  StarIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import type { Booking, MarketplaceStats, Review } from '../../types';

interface CompactTileGridProps {
  stats: MarketplaceStats;
  bookings: Booking[];
  reviews: Review[];
}

type BookingStatus = Booking['status'];

type DashboardView = 'overview' | 'pipeline' | 'feedback';

const viewOptions: Array<{ value: DashboardView; label: string }> = [
  { value: 'overview', label: 'Snapshot' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'feedback', label: 'Feedback' },
];

const activityDayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const getCardBaseClasses = (compact: boolean) =>
  [
    'rounded-2xl border border-white/10 bg-white/5 shadow-[0_32px_80px_-40px_rgba(148,163,184,0.45)] backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
    compact ? 'p-4' : 'p-5',
  ].join(' ');

const accentRing =
  'after:absolute after:-inset-px after:rounded-2xl after:opacity-0 after:transition after:content-["\""] hover:after:opacity-100';

type TrendDirection = 'up' | 'down' | 'steady';

interface TrendDescriptor {
  direction: TrendDirection;
  label: string;
}

interface ActivityPoint {
  label: string;
  completed: number;
  cancelled: number;
  inProgress: number;
  total: number;
}

interface SummaryTileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  hint?: string;
  trend?: TrendDescriptor;
  accentClass: string;
  compact: boolean;
}

const SummaryTile = ({ icon: Icon, label, value, hint, trend, accentClass, compact }: SummaryTileProps) => {
  const cardClasses = getCardBaseClasses(compact);
  const iconPadding = compact ? 'p-1.5' : 'p-2';
  const valueClasses = compact ? 'text-2xl' : 'text-3xl';
  const labelClasses = compact ? 'text-[10px]' : 'text-xs';
  const hintClasses = compact ? 'text-[11px]' : 'text-xs';

  const trendClasses = trend
    ? trend.direction === 'up'
      ? 'bg-emerald-400/15 text-emerald-200'
      : trend.direction === 'down'
        ? 'bg-rose-400/20 text-rose-100'
        : 'bg-white/10 text-white/70'
    : '';

  return (
    <div className={`${cardClasses} relative overflow-hidden ${accentRing}`}>
      <div className={`pointer-events-none absolute inset-0 ${accentClass}`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex items-center justify-center rounded-xl bg-white/10 ${iconPadding} text-white shadow-inner`}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        {trend ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 ${compact ? 'py-0.5 text-[10px]' : 'py-0.5 text-[11px]'} font-semibold ${trendClasses}`}
          >
            {trend.direction === 'up' ? (
              <ArrowTrendingUpIcon className="h-3.5 w-3.5" aria-hidden />
            ) : trend.direction === 'down' ? (
              <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <MinusSmallIcon className="h-4 w-4" aria-hidden />
            )}
            {trend.label}
          </span>
        ) : null}
      </div>
      <div className="relative mt-4 space-y-1">
        <p className={`${valueClasses} font-semibold text-white`}>{value}</p>
        <p className={`${labelClasses} font-semibold uppercase tracking-widest text-white/70`}>{label}</p>
        {hint ? <p className={`${hintClasses} text-white/60`}>{hint}</p> : null}
      </div>
    </div>
  );
};

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact: boolean;
  className?: string;
}

const SectionCard = ({ title, subtitle, icon: Icon, children, actionLabel, onAction, compact, className }: SectionCardProps) => {
  const cardClasses = `${getCardBaseClasses(compact)} ${className ?? ''}`;
  const headerMargin = compact ? 'mb-3' : 'mb-4';
  const actionPadding = compact ? 'px-3 py-1' : 'px-3.5 py-1.5';
  const subtitleSize = compact ? 'text-xs' : 'text-sm';

  return (
    <section className={`${cardClasses} relative ${accentRing}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60"
        aria-hidden
      />
      <header className={`relative flex items-start justify-between gap-4 ${headerMargin}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <Icon className="h-5 w-5 text-cyan-300" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">{title}</h3>
          </div>
          {subtitle ? <p className={`${subtitleSize} text-white/70`}>{subtitle}</p> : null}
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className={`inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/40 hover:text-white ${actionPadding}`}
          >
            {actionLabel}
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </header>
      <div className="relative">{children}</div>
    </section>
  );
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCurrency = (amount: number, currency = 'USD') =>
  amount.toLocaleString(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  });

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

export const CompactTileGrid = ({ stats, bookings, reviews }: CompactTileGridProps) => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [isCompact, setIsCompact] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollIndicators, setScrollIndicators] = useState<ScrollIndicatorsState>({
    velocity: 0,
    canScrollUp: false,
    canScrollDown: false,
  });
  const msInDay = 24 * 60 * 60 * 1000;

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

  const conversionRate = useMemo(() => {
    if (!stats.totalViews) return 0;
    const ratio = (stats.completedBookings / stats.totalViews) * 100;
    return Math.min(100, Math.max(0, Number(ratio.toFixed(1))));
  }, [stats.completedBookings, stats.totalViews]);

  const activitySeries = useMemo(() => {
    const baseline = activityDayOrder.map<ActivityPoint>((label) => ({
      label,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
      total: 0,
    }));

    bookings.forEach((booking) => {
      const candidate = booking.startDate ?? booking.date ?? null;
      const parsed = parseDate(candidate);
      if (!parsed) return;
      const index = (parsed.getDay() + 6) % 7;
      const point = baseline[index];
      point.total += 1;
      if (booking.status === 'completed') {
        point.completed += 1;
      } else if (booking.status === 'cancelled') {
        point.cancelled += 1;
      } else {
        point.inProgress += 1;
      }
    });

    return baseline;
  }, [bookings]);

  const maxActivityValue = useMemo(() => {
    const values = activitySeries.map((point) => Math.max(point.total, point.completed + point.inProgress));
    return values.length ? Math.max(...values, 1) : 1;
  }, [activitySeries]);

  const periodComparison = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentPeriodStart = today.getTime() - 6 * msInDay;
    const previousPeriodStart = currentPeriodStart - 7 * msInDay;

    let currentTotal = 0;
    let previousTotal = 0;
    let currentCompleted = 0;
    let previousCompleted = 0;
    let currentCancelled = 0;
    let previousCancelled = 0;

    bookings.forEach((booking) => {
      const parsed = parseDate(booking.startDate ?? booking.date ?? null);
      if (!parsed) return;
      const time = parsed.getTime();

      if (time >= currentPeriodStart) {
        currentTotal += 1;
        if (booking.status === 'completed') currentCompleted += 1;
        if (booking.status === 'cancelled') currentCancelled += 1;
      } else if (time >= previousPeriodStart && time < currentPeriodStart) {
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
  }, [bookings, msInDay]);

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

  const pendingBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === 'pending')
        .map((booking) => ({
          booking,
          timestamp: parseDate(booking.startDate ?? booking.date ?? null)?.getTime() ?? Infinity,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ booking }) => booking),
    [bookings],
  );

  const topPendingBookings = pendingBookings.slice(0, 3);
  const pipelineInProgress = statusCounts.byStatus.pending + statusCounts.byStatus.confirmed;
  const responseGoalHours = stats.responseGoalHours ?? 1;

  const upcomingBooking = useMemo(() => {
    const withDate = bookings
      .filter((booking) => !['completed', 'cancelled'].includes(booking.status))
      .map((booking) => ({
        booking,
        time: Math.min(parseDate(booking.startDate)?.getTime() ?? Infinity, parseDate(booking.date)?.getTime() ?? Infinity),
      }))
      .filter(({ time }) => Number.isFinite(time))
      .sort((a, b) => a.time - b.time);

    return withDate[0]?.booking ?? null;
  }, [bookings]);

  const latestReviews = useMemo(() => {
    const withTime = reviews
      .map((review) => ({
        review,
        time: Math.max(parseDate(review.createdAt)?.getTime() ?? -Infinity, parseDate(review.date)?.getTime() ?? -Infinity),
      }))
      .sort((a, b) => b.time - a.time);
    return withTime.slice(0, 4).map(({ review }) => review);
  }, [reviews]);

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
        if (prev.canScrollUp === canScrollUp && prev.canScrollDown === canScrollDown) {
          return prev;
        }
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

  const verticalGap = isCompact ? 'gap-3' : 'gap-5';
  const summaryGap = isCompact ? 'gap-2' : 'gap-3';
  const layoutGap = isCompact ? 'gap-3' : 'gap-4';
  const clusterGap = isCompact ? 'gap-2.5' : 'gap-3';
  const bookingListSpacing = isCompact ? 'space-y-2.5' : 'space-y-3';
  const reviewListSpacing = isCompact ? 'space-y-2.5' : 'space-y-3';

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
  const savedLeadTrend = buildTrendDescriptor(stats.pendingBookings, stats.previousPendingBookings, {
    format: 'count',
  });
  const pipelineInProgressTrend = buildTrendDescriptor(pipelineInProgress, stats.previousPipelineTotal, {
    format: 'count',
  });

  const responseRateValue = Math.min(Math.max(stats.responseRate ?? 0, 0), 100);
  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - responseRateValue / 100);

  const chartHeightClass = isCompact ? 'h-40' : 'h-48';

  const activityCard = (
    <SectionCard
      compact={isCompact}
      title="Activity Overview"
      subtitle="Trailing 7-day performance"
      icon={ChartBarIcon}
      actionLabel="View analytics"
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${isCompact ? 'p-3' : 'p-4'}`}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`${chartHeightClass} w-full`}
          role="presentation"
          aria-hidden
        >
          <defs>
            <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.45)" />
              <stop offset="70%" stopColor="rgba(14,165,233,0.2)" />
              <stop offset="100%" stopColor="rgba(14,116,144,0)" />
            </linearGradient>
            <linearGradient id="activityStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#activityFill)" opacity={0.08} />

          {activityPaths.totalArea ? (
            <path d={activityPaths.totalArea} fill="url(#activityFill)" opacity={0.55} />
          ) : null}

          {activityPaths.completedLine ? (
            <path d={activityPaths.completedLine} fill="none" stroke="url(#activityStroke)" strokeWidth={1.6} strokeLinecap="round" />
          ) : null}

          {activityPaths.cancelledLine ? (
            <path
              d={activityPaths.cancelledLine}
              fill="none"
              stroke="rgba(248,113,113,0.55)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          ) : null}

          {activityPaths.completedPoints.map(({ x, y }, idx) => (
            <circle key={`completed-${idx}`} cx={x} cy={y} r={1.4} fill="#fdf4ff" stroke="#a855f7" strokeWidth={0.6} />
          ))}

          {activityPaths.cancelledPoints.map(({ x, y }, idx) => (
            <circle key={`cancelled-${idx}`} cx={x} cy={y} r={1.2} fill="#fee2e2" stroke="#f87171" strokeWidth={0.5} />
          ))}
        </svg>

        <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {activitySeries.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>

  <div className={`grid text-sm text-white/70 md:grid-cols-3 ${isCompact ? 'mt-4 gap-2' : 'mt-6 gap-3'}`}>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Completed (7d)</p>
          <p className={`${isCompact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentCompleted}</p>
          {completedTrend ? <p className="mt-1 text-[11px] font-medium text-emerald-300">{completedTrend.label}</p> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Total Volume</p>
          <p className={`${isCompact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentTotal}</p>
          {totalTrend ? <p className="mt-1 text-[11px] font-medium text-cyan-200">{totalTrend.label}</p> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Cancelled</p>
          <p className={`${isCompact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentCancelled}</p>
          {cancelledTrend ? <p className="mt-1 text-[11px] font-medium text-rose-200">{cancelledTrend.label}</p> : null}
        </div>
      </div>
    </SectionCard>
  );

  const nextBookingCard = (
    <SectionCard
      compact={isCompact}
      title="Next Booking"
      subtitle={upcomingBooking ? 'Keep this touchpoint on track' : 'No upcoming bookings yet'}
      icon={CalendarIcon}
      actionLabel={upcomingBooking ? 'Open booking' : undefined}
      className="border-white/15 bg-gradient-to-br from-indigo-500/20 via-slate-900/30 to-transparent"
    >
      {upcomingBooking ? (
        <div className="space-y-4 text-sm text-white">
          <div className="flex items-start justify-between gap-3 text-white/80">
            <div className="space-y-1">
              <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-white`}> 
                {upcomingBooking.listingTitle ?? upcomingBooking.service ?? 'Unnamed service'}
              </p>
              <p className="text-xs uppercase tracking-wide text-white/50">Client</p>
              <p className="text-sm font-medium text-white/80">{upcomingBooking.client ?? 'Anonymous client'}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              {upcomingBooking.status}
            </span>
          </div>

          <div className={`grid ${isCompact ? 'gap-2' : 'gap-3'} text-white/80 sm:grid-cols-2`}>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">When</p>
              <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-white`}>
                {formatDate(upcomingBooking.startDate ?? upcomingBooking.date) ?? 'Date to be scheduled'}
              </p>
            </div>
            {typeof upcomingBooking.amount === 'number' ? (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">Projected payout</p>
                <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-emerald-100`}>
                  {formatCurrency(upcomingBooking.amount, bookingCurrency)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard?tab=messages"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Chat client
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard?tab=calendar"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/60 transition hover:border-white/25 hover:text-white"
            >
              Reschedule
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/70">
          You&apos;re all caught up. Encourage conversions by sharing a promotion or checking in with past clients.
        </p>
      )}
    </SectionCard>
  );

  const inboxCard = (
    <SectionCard
      compact={isCompact}
      title="Inbox & Response"
      subtitle="Keep your response rate high"
      icon={EnvelopeIcon}
      actionLabel="Open messages"
    >
      <div className={`flex flex-col ${isCompact ? 'gap-4' : 'gap-5'} text-sm text-white/80 md:flex-row md:items-center md:justify-between`}>
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center md:mx-0">
          <svg viewBox="0 0 80 80" className="h-full w-full" role="presentation" aria-hidden>
            <defs>
              <linearGradient id="responseGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={6} />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#responseGradient)"
              strokeWidth={6}
              strokeDasharray={gaugeCircumference.toFixed(2)}
              strokeDashoffset={gaugeOffset.toFixed(2)}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Rate</p>
            <p className={`${isCompact ? 'text-lg' : 'text-xl'} font-semibold text-white`}>{responseRateValue}%</p>
            {responseTrend ? <p className="text-[10px] font-medium text-emerald-200/80">{responseTrend.label}</p> : null}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Avg. response time</p>
            <p className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{stats.responseTime}</p>
            <p className="text-[11px] text-white/60">Target: &lt;{responseGoalHours} hour{responseGoalHours > 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Instant wins</p>
            <p className="text-[11px] text-white/70">Reply to unread messages within 60 minutes to stay eligible for boosted placement.</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const createListingCard = (
    <div className={`${getCardBaseClasses(isCompact)} relative overflow-hidden ${accentRing}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/35 via-[#22d3ee]/20 to-transparent opacity-70" aria-hidden />
      <div className="relative flex flex-col gap-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Create a new listing</p>
            <p className="text-sm text-white/80">Launch a polished service in minutes with AI-assisted copy and pricing suggestions.</p>
          </div>
          <SparklesIcon className="h-6 w-6 text-cyan-200" aria-hidden />
        </div>
        <Link
          href="/dashboard?tab=content&view=create"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-900 transition hover:border-white/40 hover:bg-white/80"
        >
          <span>Start building</span>
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );

  const savedLeadsCard = (
    <SectionCard
      compact={isCompact}
      title="Saved Leads"
      subtitle="Pending requests ready to convert"
      icon={BookmarkIcon}
    >
      <div className="space-y-4 text-sm text-white/80">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
          <span className="text-white/60">Active leads</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
            {stats.pendingBookings} hot
          </span>
        </div>
        <div className={`${topPendingBookings.length ? 'space-y-3' : ''}`}>
          {topPendingBookings.length ? (
            topPendingBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-white/50">
                  <span>{booking.client ?? 'Anonymous client'}</span>
                  <span>{formatDate(booking.startDate ?? booking.date) ?? 'TBD'}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  {booking.listingTitle ?? booking.service ?? 'Untitled booking'}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-white/60">
              No saved leads right now. Promote a listing to capture new demand.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>Momentum</span>
          {savedLeadTrend ? <span className="text-amber-200">{savedLeadTrend.label}</span> : <span>Holding steady</span>}
        </div>
        <Link
          href="/dashboard?tab=bookings&view=pipeline"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200 transition hover:text-amber-100"
        >
          Review pipeline
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionCard>
  );

  const relationshipCard = (
    <SectionCard
      compact={isCompact}
      title="Relationship Health"
      subtitle="Where your client loyalty sits right now"
      icon={UserGroupIcon}
    >
      <div className={`grid ${isCompact ? 'gap-2.5' : 'gap-3'} text-sm text-white/80 sm:grid-cols-2`}>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">New clients (7d)</p>
          <p className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{newClientsThisWeek}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Returning clients</p>
          <p className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{returningClients}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Loyalty ratio</p>
          <p className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{loyaltyRatio}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Avg. ticket</p>
          <p className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-white`}>
            {formatCurrency(averageTicketValue, bookingCurrency)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-white/60">
        Top tip: send a personalised follow-up within 24 hours to new clients to nudge them into a repeat booking cycle.
      </p>
      <Link
        href="/dashboard?tab=clients&view=saved"
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 transition hover:text-cyan-100"
      >
        Manage relationships
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </SectionCard>
  );

  const pendingRequestsCard = (
    <SectionCard
      compact={isCompact}
      title="Pending Requests"
      subtitle="Follow up before they drift"
      icon={TicketIcon}
    >
      <div className="space-y-4 text-sm text-white/80">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>In progress</span>
          <span className="inline-flex items-center gap-2 text-white">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
              {pipelineInProgress}
            </span>
            {pipelineInProgressTrend ? (
              <span className="text-emerald-200">{pipelineInProgressTrend.label}</span>
            ) : null}
          </span>
        </div>

        <div className={`${pendingBookings.length ? 'space-y-3' : ''}`}>
          {pendingBookings.length ? (
            pendingBookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-white/50">
                  <span>{booking.client ?? 'Anonymous client'}</span>
                  <span>{formatDate(booking.startDate ?? booking.date) ?? 'TBD'}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">{booking.listingTitle ?? booking.service ?? 'Untitled booking'}</span>
                  {typeof booking.amount === 'number' ? (
                    <span className="text-xs text-white/70">{formatCurrency(booking.amount, bookingCurrency)}</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-white/60">
              No pending requests. Share a discount to re-ignite interest.
            </p>
          )}
        </div>

        <div className="flex justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>Confirmed</span>
          <span className="text-white">{statusCounts.byStatus.confirmed}</span>
        </div>

        <Link
          href="/dashboard?tab=bookings&view=pipeline"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:text-white"
        >
          Manage bookings
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionCard>
  );

  const bookingsCard = (
    <SectionCard
      compact={isCompact}
      title="Pipeline"
      subtitle="Bookings and projected revenue"
      icon={TicketIcon}
      actionLabel="Manage bookings"
    >
      <div className={`text-sm ${bookingListSpacing}`}>
        {bookings.length ? (
          bookings
            .slice()
            .sort((a, b) => bookingStatusOrder[a.status] - bookingStatusOrder[b.status])
            .slice(0, 6)
            .map((booking) => {
              const scheduledFor = formatDate(booking.startDate ?? booking.date);

              return (
                <div
                  key={booking.id}
                  className={`flex items-start justify-between rounded-xl bg-white/5 ${isCompact ? 'px-3 py-2.5' : 'px-3 py-3'} text-sm text-white`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{booking.listingTitle ?? booking.service ?? 'Untitled booking'}</p>
                    <p className="text-xs text-white/60">{booking.client ?? 'Anonymous client'}</p>
                  </div>
                  <div className="text-right text-xs text-white/70">
                    <p className="font-semibold capitalize text-white/80">{booking.status}</p>
                    <p>{scheduledFor ?? 'Date TBA'}</p>
                    {typeof booking.amount === 'number' ? (
                      <p className="mt-1 font-semibold text-white">{formatCurrency(booking.amount, bookingCurrency)}</p>
                    ) : null}
                  </div>
                </div>
              );
            })
        ) : (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-sm text-white/70">
            No bookings yet. Promote your top listing to fill your calendar.
          </p>
        )}
      </div>
      <div className={`mt-4 grid md:grid-cols-3 ${isCompact ? 'gap-2.5' : 'gap-3'}`}>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Average ticket</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(averageTicketValue || 0, bookingCurrency)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Pending approvals</p>
          <p className="mt-1 text-lg font-semibold text-white">{statusCounts.byStatus.pending}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Expected revenue</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(statusCounts.revenue, bookingCurrency)}
          </p>
        </div>
      </div>
    </SectionCard>
  );

  const reviewsCard = (
    <SectionCard
      compact={isCompact}
      title="Latest Reviews"
      subtitle="What clients are saying"
      icon={ChatBubbleLeftRightIcon}
      actionLabel="Respond"
    >
      <div className={`text-sm ${reviewListSpacing}`}>
        {latestReviews.length ? (
          latestReviews.map((review) => {
            const reviewDate = formatDate(review.createdAt ?? review.date);

            return (
              <article key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                <header className="mb-2 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-semibold">
                      {review.reviewerName ?? review.client ?? 'Anonymous client'}
                    </p>
                    {reviewDate ? <p className="text-xs text-white/50">{reviewDate}</p> : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-amber-400" aria-hidden />
                    <span className="text-sm font-semibold text-white">{review.rating.toFixed(1)}</span>
                  </div>
                </header>
                <p className="text-sm text-white/70">{review.comment}</p>
              </article>
            );
          })
        ) : (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-sm text-white/70">
            You have no reviews yet. Encourage clients to leave feedback after each completed booking.
          </p>
        )}
      </div>
    </SectionCard>
  );

  const sentimentCard = (
    <SectionCard
      compact={isCompact}
      title="Rating Summary"
      subtitle="Overall satisfaction at a glance"
      icon={StarIcon}
    >
      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Average rating</p>
          <p className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-semibold text-white`}>{stats.averageRating.toFixed(1)}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Total reviews</p>
          <p className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-semibold text-white`}>{stats.totalReviews}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Conversion rate</p>
          <p className={`${isCompact ? 'text-xl' : 'text-2xl'} font-semibold text-white`}>{conversionRate}%</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Response rate</p>
          <p className={`${isCompact ? 'text-xl' : 'text-2xl'} font-semibold text-white`}>{stats.responseRate}%</p>
        </div>
      </div>
    </SectionCard>
  );

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
    'pointer-events-none absolute inset-0 rounded-[26px] border border-white/5 bg-gradient-to-b from-white/10 via-transparent to-white/5';

  const overviewView = (
    <section
      className={`snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.2fr,1.6fr,1.1fr]`}
    >
      <div className={`grid ${clusterGap}`}>
        {createListingCard}
        {relationshipCard}
      </div>
      <div className={`grid ${clusterGap}`}>
        {activityCard}
        {savedLeadsCard}
      </div>
      <div className={`grid ${clusterGap}`}>
        {nextBookingCard}
        {pendingRequestsCard}
        {inboxCard}
      </div>
    </section>
  );

  const pipelineView = (
    <section
  className={`snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.6fr,1fr]`}
    >
      {bookingsCard}
      <div className={`grid ${clusterGap}`}>
        {nextBookingCard}
        {sentimentCard}
      </div>
    </section>
  );

  const feedbackView = (
    <section
  className={`snap-start grid min-h-[min(78vh,860px)] ${layoutGap} rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl xl:grid-cols-[1.4fr,1fr]`}
    >
      {reviewsCard}
      <div className={`grid ${clusterGap}`}>
        {inboxCard}
        {sentimentCard}
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

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className={`relative flex flex-col ${verticalGap}`}>
        <div className={`grid md:grid-cols-2 xl:grid-cols-4 ${summaryGap}`}>
        <SummaryTile
          compact={isCompact}
          icon={DocumentTextIcon}
          label="Active Listings"
          value={stats.activeListings.toString()}
          hint={`${stats.totalViews.toLocaleString()} views this month`}
          accentClass="bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent"
          trend={activeListingsTrend}
        />
        <SummaryTile
          compact={isCompact}
          icon={TicketIcon}
          label="Bookings Pipeline"
          value={statusCounts.total.toString()}
          hint={`${periodComparison.currentCompleted} completed • ${statusCounts.byStatus.pending} pending`}
          accentClass="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent"
          trend={pipelineTrend}
        />
        <SummaryTile
          compact={isCompact}
          icon={ChartPieIcon}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          hint={`${stats.completedBookings} bookings from ${stats.totalViews.toLocaleString()} visits`}
          accentClass="bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent"
          trend={conversionTrendDescriptor}
        />
        <SummaryTile
          compact={isCompact}
          icon={StarIcon}
          label="Customer Rating"
          value={stats.averageRating.toFixed(1)}
          hint={`${stats.totalReviews} total reviews${stats.responseRate ? ` • ${stats.responseRate}% response rate` : ''}`}
          accentClass="bg-gradient-to-br from-amber-400/20 via-amber-500/5 to-transparent"
          trend={ratingTrend}
        />
        </div>

        <div className={`flex flex-wrap items-center justify-between ${isCompact ? 'gap-2' : 'gap-3'}`}>
        <div className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 ${isCompact ? 'p-1' : 'p-1.5'}`} role="tablist">
          {viewOptions.map(({ value, label }) => {
            const isActive = activeView === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveView(value)}
                className={`relative rounded-full text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isCompact ? 'px-3 py-1' : 'px-4 py-1.5'} ${
                  isActive ? 'bg-white text-slate-900 shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setIsCompact((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border border-white/15 text-xs font-semibold uppercase tracking-wide transition ${
            isCompact ? 'bg-white text-slate-900' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          } ${isCompact ? 'px-3 py-1' : 'px-4 py-1.5'}`}
          aria-pressed={isCompact}
        >
          <span>{isCompact ? 'Compact' : 'Comfort'}</span>
        </button>
        </div>

        <div className={contentShellClasses}>
          <div className={contentOverlayClasses} aria-hidden />
          <div
            ref={scrollContainerRef}
            style={scrollVelocityStyle}
            className={`relative flex h-full flex-col overflow-y-auto ${isCompact ? 'gap-4 p-4' : 'gap-6 p-6'} snap-y snap-mandatory scroll-smooth`}
          >
            {renderActiveView()}
          </div>
          <div
            className="pointer-events-none absolute left-8 right-8 top-0 flex h-10 items-center justify-center gap-2 rounded-b-full bg-gradient-to-b from-slate-900/80 via-slate-900/30 to-transparent"
            style={{
              opacity: scrollIndicators.canScrollUp ? Math.min(0.85, 0.25 + scrollIndicators.velocity * 0.8) : 0,
              transition: 'opacity 200ms ease-out',
            }}
            aria-hidden
          >
            <ChevronUpIcon className="h-4 w-4 text-white/60" aria-hidden />
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-8 right-8 flex h-10 items-center justify-center gap-2 rounded-t-full bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"
            style={{
              opacity: scrollIndicators.canScrollDown ? Math.min(0.85, 0.25 + scrollIndicators.velocity * 0.8) : 0,
              transition: 'opacity 200ms ease-out',
            }}
            aria-hidden
          >
            <ChevronDownIcon className="h-4 w-4 text-white/60" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
};
