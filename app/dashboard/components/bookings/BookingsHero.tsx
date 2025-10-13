import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';
import type { Booking } from '../../types';
import { statusAccent, statusChipBaseClass, statusLabels } from './statusConfig';

export interface HeroMetric {
  label: string;
  value: number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NextBookingSummary {
  title: string;
  status: Booking['status'];
  windowLabel: string;
  client: string;
  location?: string | null;
  amount?: number;
}

interface BookingsHeroProps {
  metrics: HeroMetric[];
  nextBooking: NextBookingSummary | null;
  onConfigure?: () => void;
}

export function BookingsHero({ metrics, nextBooking, onConfigure }: BookingsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_60px_160px_-120px_rgba(79,70,229,0.7)]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#BD24DF]/20 via-transparent to-[#2D6ADE]/30 opacity-70"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Scheduling cockpit</p>
            <h1 className="text-3xl font-semibold leading-tight">Bookings Pipeline</h1>
            <p className="mt-2 text-sm text-white/70">
              Live view of demand, upcoming sessions, and blockers that need action.
            </p>
          </div>
          <button
            type="button"
            onClick={onConfigure}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden />
            Configure automations
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {metrics.map(({ label, value, hint, icon: Icon }) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[0_40px_120px_-100px_rgba(59,130,246,0.65)] transition hover:border-white/25"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
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
  );
}

export function buildHeroMetrics(counts: Record<Booking['status'], number>): HeroMetric[] {
  return [
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
}

