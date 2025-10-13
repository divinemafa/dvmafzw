/**
 * Bookings Tab - Immersive scheduling and pipeline console
 */

'use client';

import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TicketIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useMemo, useState } from 'react';
import type { Booking } from '../../types';
import { BookingDetailsModal } from './BookingDetailsModal';

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

interface PipelineRow {
  id: string | number;
  status: BookingStatus;
  title: string;
  client?: string;
  windowLabel: string;
  amountLabel: string;
  isPlaceholder?: boolean;
}

interface TimelineRow {
  id: string | number;
  status: BookingStatus;
  title: string;
  client: string;
  windowLabel: string;
  location?: string | null;
  amountLabel: string;
}

const frameClasses = [
  'relative isolate flex flex-col overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

const statusOrder: Record<BookingStatus, number> = {
  pending: 1,
  confirmed: 2,
  completed: 3,
  cancelled: 4,
};

const statusAccent: Record<BookingStatus, string> = {
  pending: 'border-amber-300/40 bg-amber-400/20 text-amber-100',
  confirmed: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100',
  completed: 'border-sky-300/40 bg-sky-400/20 text-sky-100',
  cancelled: 'border-rose-300/40 bg-rose-400/20 text-rose-100',
};

const statusChipBaseClass = 'whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]';

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

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
  const [, setRefreshTrigger] = useState(0);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const normalized = useMemo(() => bookings.slice().sort((a, b) => statusOrder[a.status] - statusOrder[b.status]), [bookings]);
  
  const handleBookingClick = useCallback((bookingId: string | number) => {
    const booking = normalized.find((b) => b.id === bookingId);
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

  const counts = useMemo(() => {
    const base = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 } as Record<BookingStatus, number>;
    for (const booking of normalized) {
      base[booking.status] += 1;
    }
    return base;
  }, [normalized]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return normalized.filter((booking) => {
      const matchesStatus = activeFilter === 'all' || booking.status === activeFilter;
      if (!matchesStatus) return false;

      if (!query) return true;
      const title = (booking.listingTitle ?? booking.service ?? '').toLowerCase();
      const client = (booking.client ?? '').toLowerCase();
      return title.includes(query) || client.includes(query);
    });
  }, [activeFilter, normalized, searchQuery]);

  const timelineItems: TimelineItem[] = useMemo(() =>
    filtered.map((booking) => {
      const start = parseDate(booking.startDate ?? booking.date ?? null);
      const end = parseDate(booking.endDate ?? null);
      return {
        id: booking.id,
        title: booking.listingTitle ?? booking.service ?? 'Untitled booking',
        windowLabel: formatRange(start, end),
        status: booking.status,
        client: booking.client ?? 'Anonymous client',
  location: booking.location ?? booking.loaction ?? booking.time ?? null,
        start,
        end,
        amount: typeof booking.amount === 'number' ? booking.amount : undefined,
      };
    })
      .sort((a, b) => {
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
      }),
  [filtered]);

  const nextBooking = useMemo(() => timelineItems.find((item) => item.status === 'confirmed' || item.status === 'pending'), [timelineItems]);

  const heroMetrics = [
    {
      label: 'Pending',
      value: counts.pending,
      hint: 'Waiting on you',
      icon: ClockIcon,
    },
    {
      label: 'Confirmed',
      value: counts.confirmed,
      hint: 'Locked in',
      icon: CheckCircleIcon,
    },
    {
      label: 'Completed (30d)',
      value: counts.completed,
      hint: '+18% vs last month',
      icon: TicketIcon,
    },
    {
      label: 'Cancelled',
      value: counts.cancelled,
      hint: '2 chargebacks to review',
      icon: XCircleIcon,
    },
  ];

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

  const alertHighlights = [
    'Payment verification pending for booking #1245 — follow up today.',
    'Client Laura booked twice this month — send loyalty upgrade.',
    'Workshop cancellations trending up — refresh messaging before Friday.',
  ];

  const teamTasks = [
    'Share Friday masterclass prep checklist with studio crew.',
    'Confirm hybrid session equipment rental for 18 Oct.',
    'Sync with support to queue the post-session survey template.',
  ];

  const pipelineGroups = useMemo(() => {
    const grouping: Record<BookingStatus, TimelineItem[]> = {
      pending: [],
      confirmed: [],
      completed: [],
      cancelled: [],
    };

    for (const item of timelineItems) {
      grouping[item.status].push(item);
    }
    return grouping;
  }, [timelineItems]);

  const pipelineRows: PipelineRow[] = useMemo(() => {
    const order: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
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
        amountLabel: typeof row.amount === 'number' ? `R${row.amount.toLocaleString()}` : '—',
      }));
    });
  }, [activeFilter, pipelineGroups]);

  const timelineRows: TimelineRow[] = useMemo(() =>
    timelineItems.slice(0, 8).map((item) => ({
      id: item.id,
      status: item.status,
      title: item.title,
      client: item.client,
      windowLabel: item.windowLabel,
      location: item.location ?? null,
      amountLabel: typeof item.amount === 'number' ? `R${item.amount.toLocaleString()}` : '—',
    })),
  [timelineItems]);

  const pipelineSectionContent = (
    <div className="space-y-3 text-xs text-white/70">
      <div className="flex flex-wrap gap-1.5">
        {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveFilter((prev) => (prev === status ? 'all' : status))}
            className={`${statusChipBaseClass} transition ${
              activeFilter === status
                ? `${statusAccent[status]} border-opacity-80`
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[110px,minmax(0,1.4fr),minmax(0,1fr),72px] items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
          <span>Status</span>
          <span>Booking</span>
          <span>Window</span>
          <span className="text-right">Value</span>
        </div>
        <div className="divide-y divide-white/5">
          {pipelineRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => !row.isPlaceholder && handleBookingClick(row.id)}
              disabled={row.isPlaceholder}
              className={`grid w-full grid-cols-[110px,minmax(0,1.4fr),minmax(0,1fr),72px] items-center gap-2 px-4 py-3 text-xs text-left transition ${
                row.isPlaceholder 
                  ? 'text-white/45 italic cursor-default' 
                  : 'text-white/70 hover:bg-white/5 cursor-pointer'
              }`}
            >
              <span className="flex flex-wrap gap-1">
                <span className={`${statusChipBaseClass} ${statusAccent[row.status]}`}>
                  {statusLabels[row.status]}
                </span>
              </span>
              <span className="min-w-0">
                <span className={`block truncate font-semibold text-white ${row.isPlaceholder ? 'text-white/50' : ''}`}>
                  {row.title}
                </span>
                {row.client ? <span className="block text-[11px] text-white/50">{row.client}</span> : null}
              </span>
              <span className="text-[11px] text-white/55">{row.windowLabel}</span>
              <span className="text-right text-[11px] text-white/70">{row.amountLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const timelineSectionContent = (
    <div className="space-y-3 text-xs text-white/70">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search client or booking"
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-[11px] text-white placeholder-white/35 transition focus:border-white/25 focus:bg-white/10 focus:outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[minmax(0,1.4fr),minmax(0,1fr),minmax(0,0.9fr),72px] items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
          <span>Booking</span>
          <span>Schedule</span>
          <span>Location</span>
          <span className="text-right">Value</span>
        </div>
        <div className="divide-y divide-white/5">
          {timelineRows.length ? (
            timelineRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => handleBookingClick(row.id)}
                className="grid w-full grid-cols-[minmax(0,1.4fr),minmax(0,1fr),minmax(0,0.9fr),72px] items-center gap-2 px-4 py-3 text-xs text-white/70 text-left transition hover:bg-white/5 cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-white">{row.title}</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-white/55">
                    <span className={`${statusChipBaseClass} ${statusAccent[row.status]}`}>
                      {statusLabels[row.status]}
                    </span>
                    <span className="text-white/50">{row.client}</span>
                  </span>
                </span>
                <span className="text-[11px] text-white/55">{row.windowLabel}</span>
                <span className="text-[11px] text-white/55">{row.location ?? '—'}</span>
                <span className="text-right text-[11px] text-white/70">{row.amountLabel}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-[11px] text-white/45">No bookings match your filters right now.</div>
          )}
        </div>
      </div>
    </div>
  );

  const insightsSectionContent = (
    <div className="space-y-2 text-xs text-white/70">
      {conversionSnapshot.map((metric) => (
        <div key={metric.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">{metric.label}</p>
            <p className="text-[11px] text-white/55">{metric.note}</p>
          </div>
          <p className="text-sm font-semibold text-white">{metric.value}</p>
        </div>
      ))}
    </div>
  );

  const alertsSectionContent = (
    <div className="space-y-2 text-xs text-white/70">
      {alertHighlights.map((alert) => (
        <div key={alert} className="rounded-xl border border-amber-200/30 bg-amber-400/15 px-3 py-2 text-left text-[11px] text-amber-50">
          {alert}
        </div>
      ))}
    </div>
  );

  const teamSectionContent = (
    <ul className="space-y-2 text-xs text-white/70">
      {teamTasks.map((task) => (
        <li key={task} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/65">
          {task}
        </li>
      ))}
    </ul>
  );

  const sectionConfigs = [
    {
      id: 'pipeline',
      title: 'Pipeline Board',
      subtitle: 'Status lanes snapshot.',
      content: pipelineSectionContent,
    },
    {
      id: 'timeline',
      title: 'Schedule Timeline',
      subtitle: 'Chronological view without overflow.',
      content: timelineSectionContent,
    },
    {
      id: 'insights',
      title: 'Conversion Insights',
      subtitle: 'Funnel signals this month.',
      content: insightsSectionContent,
    },
    {
      id: 'alerts',
      title: 'Alerts & Actions',
      subtitle: 'Resolve blockers early.',
      content: alertsSectionContent,
    },
    {
      id: 'team',
      title: 'Team Coordination',
      subtitle: 'Quick sync items.',
      content: teamSectionContent,
    },
  ];

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_60px_160px_-120px_rgba(79,70,229,0.7)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#BD24DF]/20 via-transparent to-[#2D6ADE]/30 opacity-70" aria-hidden />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Scheduling cockpit</p>
                  <h1 className="text-3xl font-semibold leading-tight">Bookings Pipeline</h1>
                  <p className="mt-2 text-sm text-white/70">Live view of demand, upcoming sessions, and blockers that need action.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden />
                  Configure automations
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                {heroMetrics.map(({ label, value, hint, icon: Icon }) => (
                  <article
                    key={label}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[0_40px_120px_-100px_rgba(59,130,246,0.65)] transition hover:border-white/25"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{label}</p>
                        <p className="text-2xl font-semibold text-white">{value}</p>
                        <p className="text-xs text-white/60">{hint}</p>
                      </div>
                      <span className="rounded-2xl border border-white/20 bg-white/10 p-2 text-white/70">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {nextBooking ? (
                <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4 text-sm text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CalendarDaysIcon className="h-5 w-5 text-cyan-200" aria-hidden />
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Next session</p>
                        <p className="font-semibold text-white">{nextBooking.title}</p>
                      </div>
                    </div>
                    <span className={`${statusChipBaseClass} ${statusAccent[nextBooking.status]}`}>
                      {statusLabels[nextBooking.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-emerald-200" aria-hidden />
                      {nextBooking.windowLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-purple-200" aria-hidden />
                      {nextBooking.client}
                    </span>
                    {nextBooking.location ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-amber-200" aria-hidden />
                        {nextBooking.location}
                      </span>
                    ) : null}
                    {typeof nextBooking.amount === 'number' ? (
                      <span className="inline-flex items-center gap-2 text-white/80">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-cyan-200" aria-hidden />
                        R{nextBooking.amount.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

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
