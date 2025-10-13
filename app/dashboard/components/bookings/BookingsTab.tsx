/**
 * Bookings Tab - Immersive scheduling and pipeline console
 * Now with REAL DATA from provider-dashboard API
 */

'use client';

import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Booking } from '../../types';
import { BookingDetailsModal } from './BookingDetailsModal';
import { BookingsHero, buildHeroMetrics, type NextBookingSummary } from './BookingsHero';
import { PipelineBoard, type PipelineRow } from './PipelineBoard';
import { TimelineSection, type TimelineRow } from './TimelineSection';
import { InsightsPanel } from './InsightsPanel';
import { AlertsPanel } from './AlertsPanel';
import { TeamPanel } from './TeamPanel';
import { statusOrder } from './statusConfig';

interface BookingsTabProps {
  bookings?: Booking[];
}

type BookingStatus = Booking['status'];

interface TimelineItem {
  id: Booking['id'];
  title: string;
  windowLabel: string;
  status: BookingStatus;
  client: string;
  location?: string | null;
  start: Date | null;
  end: Date | null;
  amount?: number;
}

const frameClasses = [
  'relative isolate flex flex-col overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatRange = (start: Date | null, end: Date | null) => {
  if (!start && !end) return 'Timing to be confirmed';
  if (start && !end)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(start);

  if (start && end) {
    const startDay = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(start);
    const endDay = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(end);
    return `${startDay} → ${endDay}`;
  }

  return 'Timing to be confirmed';
};

export function BookingsTab({ bookings = [] }: BookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pipeline: true,
    timeline: true,
    insights: true,
    alerts: true,
    team: true,
  });
  
  // Modal state for booking details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // Fetch real booking data from provider-dashboard API
  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/bookings/provider-dashboard');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.details || errorData.error || response.statusText;
          
          if (response.status === 401) {
            throw new Error('Please log in to view your bookings');
          }
          
          throw new Error(`Failed to load bookings: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('✅ Bookings data loaded:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingsData();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  // Use real data if available, fallback to props for backward compatibility
  const actualBookings = dashboardData?.bookings || bookings;
  
  const normalized = useMemo(() => actualBookings.slice().sort((a: Booking, b: Booking) => statusOrder[a.status] - statusOrder[b.status]), [actualBookings]);
  
  // Use metrics from API if available, otherwise calculate
  const counts = useMemo(() => {
    if (dashboardData?.metrics?.counts) {
      return dashboardData.metrics.counts;
    }
    
    // Fallback calculation
    const base: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      client_cancellation_requested: 0,
      provider_cancellation_requested: 0,
    };
    for (const booking of normalized) {
      const status = booking.status as BookingStatus;
      base[status] += 1;
    }
    return base;
  }, [dashboardData, normalized]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return normalized.filter((booking: Booking) => {
      const matchesStatus = activeFilter === 'all' || booking.status === activeFilter;
      if (!matchesStatus) return false;

      if (!query) return true;
      // Support both API data (projectTitle) and legacy mock data (listingTitle/service)
      const title = (booking.projectTitle ?? booking.listingTitle ?? booking.service ?? '').toLowerCase();
      const client = (booking.client ?? '').toLowerCase();
      return title.includes(query) || client.includes(query);
    });
  }, [activeFilter, normalized, searchQuery]);

  const timelineItems: TimelineItem[] = useMemo(() =>
    filtered.map((booking: Booking) => {
      // Support both API data (projectTitle, preferredDate) and legacy mock data
      const start = parseDate(booking.preferredDate ?? booking.startDate ?? booking.date ?? null);
      const end = parseDate(booking.endDate ?? null);
      return {
        id: booking.id,
        title: booking.projectTitle ?? booking.listingTitle ?? booking.service ?? 'Untitled booking',
        windowLabel: formatRange(start, end),
        status: booking.status,
        client: booking.client ?? 'Anonymous client',
        location: booking.location ?? booking.loaction ?? booking.time ?? null,
        start,
        end,
        amount: typeof booking.amount === 'number' ? booking.amount : undefined,
      };
    })
      .sort((a: TimelineItem, b: TimelineItem) => {
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
      }),
  [filtered]);

  const nextBooking = useMemo(() => timelineItems.find((item) => item.status === 'confirmed' || item.status === 'pending'), [timelineItems]);

  const heroMetrics = useMemo(() => buildHeroMetrics(counts), [counts]);

  // Use API nextBooking if available, otherwise calculate from timeline
  const nextBookingSummary = useMemo<NextBookingSummary | null>(() => {
    if (dashboardData?.metrics?.nextBooking) {
      return dashboardData.metrics.nextBooking;
    }
    
    if (!nextBooking) {
      return null;
    }

    return {
      title: nextBooking.title,
      status: nextBooking.status,
      windowLabel: nextBooking.windowLabel,
      client: nextBooking.client,
      location: nextBooking.location,
      amount: nextBooking.amount,
    };
  }, [dashboardData, nextBooking]);

  const conversionSnapshot = [
    {
      label: 'Lead-to-booking',
      value: '37%',
      note: '+4 pts vs last month',
    },
    {
      label: 'Response time',
      value: '2h 18m',
      note: 'Target &lt; 3h',
    },
    {
      label: 'No-show rate',
      value: '4%',
      note: '-1.2 pts w/w',
    },
  ];

  // Use API alerts if available
  const alertHighlights = dashboardData?.alerts || [
    'Payment verification pending for booking #1245 — follow up today.',
    'Client Laura booked twice this month — send loyalty upgrade.',
    'Workshop cancellations trending up — refresh messaging before Friday.',
  ];

  // Use API team tasks if available
  const teamTasks = dashboardData?.teamTasks || [
    'Share Friday masterclass prep checklist with studio crew.',
    'Confirm hybrid session equipment rental for 18 Oct.',
    'Sync with support to queue the post-session survey template.',
  ];

  // Pipeline data structures (must be before early returns)
  const pipelineGroups = useMemo(() => {
    const grouping: Record<BookingStatus, TimelineItem[]> = {
      pending: [],
      confirmed: [],
      completed: [],
      cancelled: [],
      client_cancellation_requested: [],
      provider_cancellation_requested: [],
    };

    for (const item of timelineItems) {
      grouping[item.status].push(item);
    }
    return grouping;
  }, [timelineItems]);

  const pipelineRows: PipelineRow[] = useMemo(() => {
    const order: BookingStatus[] = [
      'pending',
      'confirmed',
      'client_cancellation_requested',
      'provider_cancellation_requested',
      'completed',
      'cancelled',
    ];
    const laneOrder = activeFilter === 'all' ? order : order.filter((status) => status === activeFilter);
    return laneOrder.flatMap((status) => {
      const rows = pipelineGroups[status];
      if (!rows.length) {
        return [
          {
            id: `${status}-empty`,
            status,
            title: 'No bookings in lane',
            client: '',
            windowLabel: '—',
            amountLabel: '—',
            isPlaceholder: true,
          },
        ];
      }

      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        title: row.title,
        client: row.client,
        windowLabel: row.windowLabel,
        amountLabel: row.amount ? `${row.amount.toFixed(2)} ZAR` : '—',
      }));
    });
  }, [activeFilter, pipelineGroups]);

  const timelineRows: TimelineRow[] = useMemo(
    () =>
      timelineItems.map((item) => ({
        id: item.id,
        status: item.status,
        title: item.title,
        client: item.client,
        windowLabel: item.windowLabel,
        location: item.location,
        amountLabel: item.amount ? `${item.amount.toFixed(2)} ZAR` : '—',
      })),
    [timelineItems]
  );

  // Event handlers (must be after all other hooks)
  const handleBookingClick = useCallback((bookingId: string | number) => {
    const booking = normalized.find((b: Booking) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
    }
  }, [normalized]);
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  }, []);
  
  const handleBookingUpdated = useCallback(() => {
    // Trigger parent refresh - dashboard should refetch bookings
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Show loading state
  if (isLoading && !dashboardData) {
    return (
      <div className={frameClasses}>
        <div className={frameOverlayClasses} aria-hidden />
        <div className="relative flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="mt-4 text-sm text-white/60">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className={frameClasses}>
        <div className={frameOverlayClasses} aria-hidden />
        <div className="relative flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="mt-4 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All pipeline and timeline data is already computed above (before early returns)
  // No duplicate declarations needed here

  const sectionConfigs = [
    {
      id: 'pipeline',
      title: 'Pipeline Board',
      subtitle: 'Status lanes snapshot.',
      content: (
        <PipelineBoard
          rows={pipelineRows}
          activeFilter={activeFilter}
          onFilterChange={(status) => setActiveFilter((prev) => (prev === status ? 'all' : status))}
          onRowSelect={handleBookingClick}
        />
      ),
    },
    {
      id: 'timeline',
      title: 'Schedule Timeline',
      subtitle: 'Chronological view without overflow.',
      content: (
        <TimelineSection
          rows={timelineRows}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRowSelect={handleBookingClick}
        />
      ),
    },
    {
      id: 'insights',
      title: 'Conversion Insights',
      subtitle: 'Funnel signals this month.',
      content: <InsightsPanel metrics={conversionSnapshot} />,
    },
    {
      id: 'alerts',
      title: 'Alerts & Actions',
      subtitle: 'Resolve blockers early.',
      content: <AlertsPanel alerts={alertHighlights} />,
    },
    {
      id: 'team',
      title: 'Team Coordination',
      subtitle: 'Quick sync items.',
      content: <TeamPanel tasks={teamTasks} />,
    },
  ];

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
          <BookingsHero metrics={heroMetrics} nextBooking={nextBookingSummary} />

          <aside className="flex flex-col justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_50px_150px_-110px_rgba(56,189,248,0.6)]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Throughput targets</p>
              <div className="grid gap-2 text-sm text-white/70">
                <span className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Weekly capacity used</span>
                  <span className="font-semibold text-white">68%</span>
                </span>
                <span className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Average turnaround</span>
                  <span className="font-semibold text-white">6h</span>
                </span>
                <span className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                  <span>Upcoming demand</span>
                  <span className="font-semibold text-white">+9 requests</span>
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-3 text-xs text-emerald-950">
              <p className="font-semibold">Automation tip</p>
              <p className="mt-1 text-emerald-900/80">Enable instant reminders 24 hours before confirmed sessions to cut no-shows by 18%.</p>
            </div>
          </aside>
        </header>

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {sectionConfigs.map((section) => (
            <section
              key={section.id}
              className="rounded-[26px] border border-white/10 bg-white/5 p-4 shadow-[0_45px_140px_-120px_rgba(79,70,229,0.65)] backdrop-blur-2xl"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={openSections[section.id]}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{section.title}</p>
                  <p className="text-[11px] text-white/55">{section.subtitle}</p>
                </div>
                {openSections[section.id] ? (
                  <ChevronDownIcon className="h-4 w-4 text-white/60" aria-hidden />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-white/60" aria-hidden />
                )}
              </button>
              {openSections[section.id] ? (
                <div className="mt-3 space-y-3">{section.content}</div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        booking={selectedBooking ? {
          booking_reference: selectedBooking.reference ?? '',
          project_title: selectedBooking.listingTitle ?? selectedBooking.service ?? 'Untitled',
          client_name: selectedBooking.client ?? 'Anonymous',
          client_email: selectedBooking.clientEmail ?? '',
          client_phone: selectedBooking.clientPhone ?? null,
          status: selectedBooking.status,
          amount: typeof selectedBooking.amount === 'number' ? selectedBooking.amount : 0,
          currency: selectedBooking.currency ?? 'USD',
          preferred_date: selectedBooking.startDate ?? selectedBooking.date ?? null,
          location: selectedBooking.location ?? selectedBooking.loaction ?? null,
          additional_notes: selectedBooking.notes ?? null,
          listing_title: selectedBooking.listingTitle ?? selectedBooking.service ?? undefined,
          provider_response: selectedBooking.providerResponse ?? null,
        } : null}
        onUpdated={handleBookingUpdated}
      />
    </div>
  );
}
