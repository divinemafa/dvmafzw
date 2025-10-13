/**
 * ActivityOverviewCard - 7-day performance chart with completed/cancelled metrics
 * Shows activity trends over the past week with visual chart
 */

'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import type { ActivityPoint, TrendDescriptor } from './shared/types';

interface ActivityOverviewCardProps {
  compact: boolean;
  activitySeries: ActivityPoint[];
  activityPaths: {
    totalArea: string;
    completedLine: string;
    cancelledLine: string;
    completedPoints: Array<{ x: number; y: number }>;
    cancelledPoints: Array<{ x: number; y: number }>;
  };
  periodComparison: {
    currentCompleted: number;
    currentTotal: number;
    currentCancelled: number;
  };
  completedTrend?: TrendDescriptor;
  totalTrend?: TrendDescriptor;
  cancelledTrend?: TrendDescriptor;
}

export const ActivityOverviewCard = ({
  compact,
  activitySeries,
  activityPaths,
  periodComparison,
  completedTrend,
  totalTrend,
  cancelledTrend,
}: ActivityOverviewCardProps) => {
  const chartHeightClass = compact ? 'h-40' : 'h-48';

  return (
    <SectionCard
      compact={compact}
      title="Activity Overview"
      subtitle="Trailing 7-day performance"
      icon={ChartBarIcon}
      actionLabel="View analytics"
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-4'}`}>
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

      <div className={`grid text-sm text-white/70 md:grid-cols-3 ${compact ? 'mt-4 gap-2' : 'mt-6 gap-3'}`}>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Completed (7d)</p>
          <p className={`${compact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentCompleted}</p>
          {completedTrend ? <p className="mt-1 text-[11px] font-medium text-emerald-300">{completedTrend.label}</p> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Total Volume</p>
          <p className={`${compact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentTotal}</p>
          {totalTrend ? <p className="mt-1 text-[11px] font-medium text-cyan-200">{totalTrend.label}</p> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Cancelled</p>
          <p className={`${compact ? 'text-lg' : 'text-xl'} mt-2 font-semibold text-white`}>{periodComparison.currentCancelled}</p>
          {cancelledTrend ? <p className="mt-1 text-[11px] font-medium text-rose-200">{cancelledTrend.label}</p> : null}
        </div>
      </div>
    </SectionCard>
  );
};
