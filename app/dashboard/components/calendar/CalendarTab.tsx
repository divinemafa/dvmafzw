/**
 * Calendar Tab - Multi-view scheduling, resource visibility, and automation controls
 */

'use client';

import { useMemo, useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { CalendarEvent, TimeSlot } from '../../types';

interface CalendarTabProps {
  events?: CalendarEvent[];
  timeSlots?: TimeSlot[];
}

type CalendarViewKey = 'week' | 'agenda' | 'month' | 'timeline';

interface AutomationRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ResourceSummary {
  id: string;
  label: string;
  status: 'available' | 'busy' | 'offline';
  allocation: string;
  utilization: number;
}

const fallbackEvents: CalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Premium Training Session',
    description: 'High-intent lead confirmed via WhatsApp campaign.',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    type: 'booking',
  } as CalendarEvent,
  {
    id: 'evt-002',
    title: 'Campaign Strategy Sprint',
    description: 'Align messaging for upcoming winter promo.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    type: 'meeting',
  } as CalendarEvent,
  {
    id: 'evt-003',
    title: 'Automation Health Check',
    description: 'Review AI triggers, fallback messaging, and flows.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 27).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    type: 'automation',
  } as CalendarEvent,
];

const metrics = [
  {
    id: 'utilization',
    label: 'Utilisation',
    value: '82%',
    delta: '+5% vs last week',
    icon: CalendarIcon,
    accent: 'bg-indigo-400/15 text-indigo-200 border-indigo-300/30',
  },
  {
    id: 'revenue',
    label: 'Locked Revenue',
    value: 'R42k',
    delta: '7 bookings confirmed',
    icon: CreditCardIcon,
    accent: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
  },
  {
    id: 'pipeline',
    label: 'Waitlist Demand',
    value: '12 leads',
    delta: '3 require manual triage',
    icon: BellAlertIcon,
    accent: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
  },
];

const viewOptions: Array<{ key: CalendarViewKey; label: string; hint: string }> = [
  { key: 'week', label: 'Week Grid', hint: '7-day operations view' },
  { key: 'agenda', label: 'Agenda', hint: 'Prioritised next steps' },
  { key: 'month', label: 'Month', hint: 'Capacity snapshot' },
  { key: 'timeline', label: 'Timeline', hint: 'Service runway' },
];

const filterTags = [
  { id: 'booking', label: 'Bookings', accent: 'bg-blue-400/10 border-blue-300/30 text-blue-200' },
  { id: 'campaign', label: 'Campaigns', accent: 'bg-fuchsia-400/10 border-fuchsia-300/30 text-fuchsia-200' },
  { id: 'automation', label: 'Automations', accent: 'bg-cyan-400/10 border-cyan-300/30 text-cyan-200' },
  { id: 'partner', label: 'Partner', accent: 'bg-emerald-400/10 border-emerald-300/30 text-emerald-200' },
];

const automationDefaults: AutomationRule[] = [
  {
    id: 'auto-reminders',
    label: 'SMS reminders',
    description: 'Send a reminder 12h and 2h before the session.',
    enabled: true,
  },
  {
    id: 'auto-waitlist',
    label: 'Waitlist fill',
    description: 'Offer open spots automatically to queued leads.',
    enabled: true,
  },
  {
    id: 'auto-collections',
    label: 'Auto-collections',
    description: 'Post-session follow-up for outstanding balances.',
    enabled: false,
  },
];

const resourceDeck: ResourceSummary[] = [
  {
    id: 'studio-a',
    label: 'Studio A — Heat Sessions',
    status: 'busy',
    allocation: 'Booked until 18:00',
    utilization: 94,
  },
  {
    id: 'studio-b',
    label: 'Studio B — Collab Space',
    status: 'available',
    allocation: 'Next session 15:00',
    utilization: 68,
  },
  {
    id: 'automation-suite',
    label: 'Automation Suite',
    status: 'available',
    allocation: 'Flows synced, 2 drafts pending review',
    utilization: 72,
  },
];

const quickTemplates = [
  {
    id: 'qt-01',
    title: 'Launch 7-day challenge',
    duration: '45 min',
    price: 'R480',
    slot: 'Tomorrow • 10:00',
  },
  {
    id: 'qt-02',
    title: 'Consult: retention roadmap',
    duration: '30 min',
    price: 'R350',
    slot: 'Thursday • 14:30',
  },
];

const auxPanelTabs = [
  { id: 'resources', label: 'Resources' },
  { id: 'templates', label: 'Templates' },
  { id: 'insights', label: 'Insights' },
] as const;

type AuxTabKey = typeof auxPanelTabs[number]['id'];

const orchestrationInsights = [
  '82% utilisation – add 2 floating slots to lift availability.',
  'Waitlist leads expect confirmation within 3 hours.',
  'Automation suite idle 28% of cycle – pair with new journeys.',
];

const parseCalendarDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    const numericDate = new Date(numeric);
    if (!Number.isNaN(numericDate.getTime())) {
      return numericDate;
    }
  }

  return null;
};

const getStartDate = (event: CalendarEvent) => {
  const parsed = parseCalendarDate(event.startTime ?? event.start ?? null);
  return parsed ?? new Date();
};

const getEndDate = (event: CalendarEvent) => {
  const parsed = parseCalendarDate(event.endTime ?? event.end ?? null);
  if (parsed) {
    return parsed;
  }

  const fallbackStart = getStartDate(event);
  return new Date(fallbackStart.getTime() + 60 * 60 * 1000);
};

const isSameDay = (dateA: Date, dateB: Date) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const formatRange = (event: CalendarEvent) => {
  const start = getStartDate(event);
  const end = getEndDate(event);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Schedule pending';
  }

  return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export function CalendarTab({ events = [], timeSlots = [] }: CalendarTabProps) {
  const [activeView, setActiveView] = useState<CalendarViewKey>('week');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAutomationPanel, setShowAutomationPanel] = useState(false);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(automationDefaults);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id ?? fallbackEvents[0]?.id ?? null);
  const [showQuickDraft, setShowQuickDraft] = useState(false);
  const [activeAuxTab, setActiveAuxTab] = useState<AuxTabKey>('resources');

  const safeEvents = useMemo(() => (events.length ? events : fallbackEvents), [events]);

  const orderedEvents = useMemo(() => {
    return [...safeEvents].sort((a, b) => getStartDate(a).getTime() - getStartDate(b).getTime());
  }, [safeEvents]);

  const filteredEvents = useMemo(() => {
    if (!activeFilters.length) return orderedEvents;
    return orderedEvents.filter((event) => {
      const category = (event.type as string) ?? 'booking';
      return activeFilters.includes(category);
    });
  }, [orderedEvents, activeFilters]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return filteredEvents[0] ?? null;
    return filteredEvents.find((event) => event.id === selectedEventId) ?? filteredEvents[0] ?? null;
  }, [filteredEvents, selectedEventId]);

  const upcomingEvents = filteredEvents.slice(0, 3);
  const availableSlots = timeSlots.length;

  const handleFilterToggle = (tag: string) => {
    setActiveFilters((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const monthMatrix = useMemo(() => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const offset = (firstOfMonth.getDay() + 6) % 7; // Monday as first column
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - offset);

    return Array.from({ length: 5 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex) => {
        const cellDate = new Date(start);
        cellDate.setDate(start.getDate() + weekIndex * 7 + dayIndex);
        const dayEvents = filteredEvents.filter((event) => isSameDay(cellDate, getStartDate(event)));
        return {
          date: cellDate,
          events: dayEvents,
        };
      }),
    );
  }, [filteredEvents]);

  const weekBuckets = useMemo(() => {
    const start = new Date();
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dayEvents = filteredEvents.filter((event) => isSameDay(date, getStartDate(event)));
      return { date, dayEvents };
    });
  }, [filteredEvents]);

  const timelineGroups = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      const key = (event.type as string) ?? 'booking';
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const toggleAutomationRule = (id: string) => {
    setAutomationRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
    );
  };

  const renderWeekView = () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {weekBuckets.map(({ date, dayEvents }) => (
        <div key={date.toISOString()} className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
              <p className="text-lg font-semibold">{date.getDate()}</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
              {dayEvents.length ? `${dayEvents.length} planned` : 'Free'}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-white/60">
            {dayEvents.length ? (
              dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full rounded-xl border border-white/10 px-3 py-2 text-left transition hover:bg-white/10 ${selectedEvent?.id === event.id ? 'bg-white/10 text-white' : ''}`}
                >
                  <p className="text-xs uppercase text-white/45">{formatRange(event)}</p>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-[11px] text-white/50 line-clamp-2">{event.description}</p>
                </button>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-2 text-white/45">
                No sessions booked
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAgendaView = () => (
    <div className="space-y-3">
      {filteredEvents.length ? (
        filteredEvents.slice(0, 10).map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setSelectedEventId(event.id)}
            className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 ${selectedEvent?.id === event.id ? 'ring-1 ring-white/30' : ''}`}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                {getStartDate(event).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-white/50">{event.description}</p>
              </div>
              <span className="text-xs text-white/40">{formatRange(event)}</span>
            </div>
          </button>
        ))
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
          No upcoming agenda items. Add a booking to get started.
        </p>
      )}
    </div>
  );

  const renderMonthView = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.3em] text-white/35">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid gap-2">
        {monthMatrix.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map(({ date, events: cellEvents }) => {
              const isCurrentMonth = date.getMonth() === new Date().getMonth();
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => cellEvents[0] && setSelectedEventId(cellEvents[0].id)}
                  className={`flex h-24 flex-col justify-between rounded-xl border px-2 py-1 text-left transition ${
                    isCurrentMonth ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-white/5 bg-white/5 text-white/35'
                  } ${selectedEvent && cellEvents.some((evt) => evt.id === selectedEvent.id) ? 'ring-1 ring-white/30' : ''}`}
                >
                  <span className="text-xs text-white/60">{date.getDate()}</span>
                  <div className="space-y-1 text-[11px] text-white/50">
                    {cellEvents.slice(0, 2).map((event) => (
                      <p key={event.id} className="line-clamp-1 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-white/65">
                        {event.title}
                      </p>
                    ))}
                    {cellEvents.length > 2 ? (
                      <p className="text-[10px] text-white/40">+{cellEvents.length - 2} more</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-4">
      {Object.entries(timelineGroups).map(([group, items]) => (
        <div key={group} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <header className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">{group}</p>
              <p className="text-sm text-white/70">{items.length} scheduled touchpoints</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
              {`${Math.min(items.length * 12, 100)}% capacity`}
            </span>
          </header>
          <div className="mt-3 space-y-2">
            {items.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEventId(event.id)}
                className={`flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/10 ${selectedEvent?.id === event.id ? 'ring-1 ring-white/30' : ''}`}
              >
                <div>
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-xs text-white/45">{getStartDate(event).toLocaleString()}</p>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-white/35" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'agenda':
        return renderAgendaView();
      case 'month':
        return renderMonthView();
      case 'timeline':
        return renderTimelineView();
      case 'week':
      default:
        return renderWeekView();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <div className="space-y-3">
        <section className="grid gap-2 md:grid-cols-3">
          {metrics.map(({ id, label, value, delta, icon: Icon, accent }) => (
            <div key={id} className="rounded-lg border border-white/10 bg-white/5 p-2.5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.26em] text-white/45">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
                <span className={`rounded-md border px-2 py-1 text-[11px] font-medium ${accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-1.5 text-[10px] text-white/55">{delta}</p>
            </div>
          ))}
        </section>

  <section className="rounded-[20px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl sm:p-5">
          <header className="flex flex-col gap-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Orchestration</p>
              <h2 className="text-xl font-semibold">Schedule & resource visibility</h2>
              <p className="text-[13px] text-white/55">
                Align bookings, automations, and resource load before the system goes live.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {viewOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveView(option.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                    activeView === option.key
                      ? 'border-white/60 bg-white/15 text-white shadow-lg shadow-white/10'
                      : 'border-white/15 bg-white/5 text-white/55 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAutomationPanel(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/15"
              >
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Manage automations
              </button>
            </div>
          </header>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {filterTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleFilterToggle(tag.id)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] transition ${
                  activeFilters.includes(tag.id)
                    ? `${tag.accent} ring-1 ring-white/30`
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {renderActiveView()}
          </div>
        </section>
      </div>

      <aside className="space-y-3.5 xl:sticky xl:top-6">
          <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-white">
            <header className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Session queue</p>
                <h3 className="text-base font-semibold">{upcomingEvents.length ? `${upcomingEvents.length} sessions locked in` : 'No sessions locked in'}</h3>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.28em] text-white/55">
                {availableSlots} open slots
              </span>
            </header>
            <div className="mt-2.5 space-y-2">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={`flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/10 ${selectedEvent?.id === event.id ? 'ring-1 ring-white/30' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="text-[11px] text-white/45">{formatRange(event)}</p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-white/35" />
                  </button>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-white/10 bg-white/5 px-3 py-4 text-center text-xs text-white/50">
                  Lock your next service to populate this queue.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-white">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Selected</p>
                <h3 className="text-base font-semibold">{selectedEvent?.title ?? 'No item selected'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickDraft(true)}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.24em] text-white/65 hover:border-white/30 hover:text-white"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Draft
              </button>
            </header>
            {selectedEvent ? (
              <div className="mt-2.5 space-y-2.5 text-sm text-white/65">
                <div className="flex items-center gap-2 text-white/50">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatRange(selectedEvent)}</span>
                </div>
                <div className="flex items-start gap-2 text-white/50">
                  <MapPinIcon className="mt-0.5 h-4 w-4" />
                  <span>Hybrid suite • Auto-assigned resources synced</span>
                </div>
                <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/55">
                  {selectedEvent.description ?? 'Outline details for this slot to brief your team.'}
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-white/55">
                  <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-2 py-0.5 uppercase tracking-[0.28em] text-blue-100">
                    Confirmed
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 uppercase tracking-[0.28em]">
                    2 resources
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 uppercase tracking-[0.28em]">
                    Payment pending
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/55">Select a scheduled item to preview context.</p>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-white">
            <div className="flex items-center gap-1.5">
              {auxPanelTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveAuxTab(tab.id)}
                  className={`flex-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] transition ${
                    activeAuxTab === tab.id
                      ? 'border-white/60 bg-white/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-3 text-sm text-white/65">
              {activeAuxTab === 'resources' ? (
                <div className="space-y-2.5">
                  {resourceDeck.map((resource) => (
                    <div key={resource.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <div className="flex items-center justify-between text-white">
                        <p className="text-sm font-semibold">{resource.label}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] ${
                            resource.status === 'busy'
                              ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
                              : resource.status === 'available'
                              ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100'
                              : 'border-white/15 bg-white/5 text-white/55'
                          }`}
                        >
                          {resource.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/45">{resource.allocation}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300"
                          style={{ width: `${resource.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeAuxTab === 'templates' ? (
                <div className="space-y-2">
                  {quickTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                      onClick={() => setShowQuickDraft(true)}
                    >
                      <p className="text-sm font-semibold text-white">{template.title}</p>
                      <p className="text-[11px] text-white/45">{template.slot}</p>
                      <p className="text-[11px] text-white/55">{template.duration} • {template.price}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {activeAuxTab === 'insights' ? (
                <ul className="space-y-2 text-[12px] text-white/60">
                  {orchestrationInsights.map((insight) => (
                    <li key={insight} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      {insight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      {showAutomationPanel && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-20">
          <div className="w-full max-w-xl rounded-[28px] border border-white/15 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-6 text-white shadow-2xl">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Automation suite</p>
                <h3 className="text-2xl font-semibold">Session journey safeguards</h3>
                <p className="mt-1 text-sm text-white/55">Preview how reminders, waitlists, and collections will behave when the backend arrives.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAutomationPanel(false)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60 hover:border-white/30 hover:text-white"
              >
                Close
              </button>
            </header>
            <div className="mt-5 space-y-3">
              {automationRules.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => toggleAutomationRule(rule.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    rule.enabled ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{rule.label}</p>
                      <p className="mt-1 text-xs text-white/55">{rule.description}</p>
                    </div>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                      {rule.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 uppercase tracking-[0.3em]">Reminders</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 uppercase tracking-[0.3em]">Waitlist</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 uppercase tracking-[0.3em]">Collections</span>
            </div>
          </div>
        </div>
  )}

  {showQuickDraft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-t-[28px] border border-white/10 bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-950/95 p-6 text-white shadow-xl">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Quick booking</p>
                <h3 className="text-xl font-semibold">Draft a placeholder session</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickDraft(false)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60 hover:border-white/30 hover:text-white"
              >
                Done
              </button>
            </header>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/45">Service</p>
                <p className="text-white">Transformation Heat Session</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/45">Date</p>
                  <p className="text-white">Tomorrow • 10:00</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/45">Team</p>
                  <p className="text-white">Nomsa + Theo</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/45">Notes</p>
                <p className="text-white/60">
                  Capture intent, payment preference, and campaign source when the backend arrives.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
