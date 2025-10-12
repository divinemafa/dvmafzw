import {
  PlusCircleIcon,
  CheckCircleIcon,
  BookmarkIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

interface StatsData {
  total: number;
  active: number;
  paused: number;
  draft: number;
}

interface StatsHeaderProps {
  stats: StatsData;
}

const highlightCardClasses =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-[0_50px_140px_-100px_rgba(56,189,248,0.65)] backdrop-blur-2xl';

const heroSummary: Array<{
  label: string;
  getValue: (stats: StatsData) => string;
  getHint: (stats: StatsData) => string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}> = [
  {
    label: 'Total Listings',
    getValue: (stats) => stats.total.toString(),
    getHint: (stats) => `${stats.active} live right now`,
    icon: PlusCircleIcon,
    accent: 'from-blue-500/15 via-blue-500/5 to-transparent',
  },
  {
    label: 'Active',
    getValue: (stats) => stats.active.toString(),
    getHint: (stats) => `${Math.max(stats.active - stats.paused, 0)} outperform last week`,
    icon: CheckCircleIcon,
    accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
  },
  {
    label: 'Paused',
    getValue: (stats) => stats.paused.toString(),
    getHint: (stats) => (stats.paused ? `${stats.paused} need attention` : 'All listings live'),
    icon: BookmarkIcon,
    accent: 'from-amber-400/20 via-amber-400/5 to-transparent',
  },
  {
    label: 'Draft',
    getValue: (stats) => stats.draft.toString(),
    getHint: (stats) => (stats.draft ? 'Finish these to launch' : 'Nothing waiting'),
    icon: CloudArrowUpIcon,
    accent: 'from-violet-500/20 via-violet-500/5 to-transparent',
  },
];

export const ListingsStatsHeader = ({ stats }: StatsHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_50px_160px_-120px_rgba(79,70,229,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#BD24DF]/15 via-transparent to-[#2D6ADE]/25 opacity-80" aria-hidden />
      <div className="relative flex flex-col justify-between gap-6 text-white lg:flex-row">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
            Listings control center
          </p>
          <h1 className="text-3xl font-semibold leading-tight">Craft, refine, and amplify your offers</h1>
          <p className="text-sm text-white/70">
            Keep listings polished, respond to momentum, and launch new services with AI-assisted copy. This view is
            tuned to help you move fast.
          </p>
          <div className="flex flex-wrap gap-2">
            {heroSummary.map(({ label, getValue, getHint, icon: Icon, accent }) => (
              <div
                key={label}
                className={`${highlightCardClasses} w-full min-w-[160px] flex-1 border-white/10 gap-3`}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" aria-hidden />
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{getValue(stats)}</p>
                    <p className="mt-1 text-xs text-white/60">{getHint(stats)}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${accent} p-2 text-white/80`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
