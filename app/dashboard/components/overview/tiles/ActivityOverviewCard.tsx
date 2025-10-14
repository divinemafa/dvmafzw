/**
 * ActivityOverviewCard - 7-day performance chart with completed/cancelled metrics
 * Shows activity trends over the past week with visual chart
 */

'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect } from 'react';
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
  selectedRange?: 'day' | 'week' | '30d';
  onRangeChange?: (range: 'day' | 'week' | '30d') => void;
}

export const ActivityOverviewCard = ({
  compact,
  activitySeries,
  activityPaths,
  periodComparison,
  completedTrend,
  totalTrend,
  cancelledTrend,
  selectedRange,
  onRangeChange,
}: ActivityOverviewCardProps) => {
  const chartHeightClass = compact ? 'h-40' : 'h-48';
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [range, setRange] = useState<'day' | 'week' | '30d'>(selectedRange ?? 'week');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // sync internal range when parent prop changes
  useEffect(() => {
    if (selectedRange && selectedRange !== range) {
      setRange(selectedRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  const handleRange = (r: 'day' | 'week' | '30d') => {
    if (range !== r) {
      setRange(r);
      onRangeChange?.(r);
    }
  };

  const rightControls = (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5 text-white/70">
        <button
          type="button"
          onClick={() => handleRange('day')}
          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full ${
            range === 'day' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
          }`}
          aria-pressed={range === 'day'}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => handleRange('week')}
          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full ${
            range === 'week' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
          }`}
          aria-pressed={range === 'week'}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => handleRange('30d')}
          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full ${
            range === '30d' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
          }`}
          aria-pressed={range === '30d'}
        >
          30d
        </button>
      </div>
      <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5 text-white/70">
        <button
          type="button"
          onClick={() => setChartType('line')}
          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full ${
            chartType === 'line' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
          }`}
          aria-pressed={chartType === 'line'}
        >
          Line
        </button>
        <button
          type="button"
          onClick={() => setChartType('bar')}
          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full ${
            chartType === 'bar' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
          }`}
          aria-pressed={chartType === 'bar'}
        >
          Bar
        </button>
      </div>
    </div>
  );

  return (
    <SectionCard
      compact={compact}
      title="Activity Overview"
      subtitle={
        range === 'day'
          ? 'Last 24 hours'
          : range === '30d'
          ? 'Last 30 days'
          : 'Trailing 7 days'
      }
      icon={ChartBarIcon}
      actionLabel="View analytics"
      rightSlot={rightControls}
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-4'}`}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`${chartHeightClass} w-full`}
          role="presentation"
          aria-hidden
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, x / rect.width));
            const n = activitySeries.length;
            const idx = Math.round(pct * (n - 1));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
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

          <rect x="0" y="0" width="100" height="100" fill="url(#activityFill)" opacity={0.05} />

          {chartType === 'line' && activityPaths.totalArea ? (
            <path d={activityPaths.totalArea} fill="url(#activityFill)" opacity={0.25} />
          ) : null}

          {chartType === 'line' && activityPaths.completedLine ? (
            <>
              {/* subtle halo behind completed line */}
              <path
                d={activityPaths.completedLine}
                fill="none"
                stroke="url(#activityStroke)"
                strokeOpacity={0.18}
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* crisp completed line */}
              <path
                d={activityPaths.completedLine}
                fill="none"
                stroke="url(#activityStroke)"
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}

          {chartType === 'line' && activityPaths.cancelledLine ? (
            <>
              {/* subtle halo behind cancelled dashed line */}
              <path
                d={activityPaths.cancelledLine}
                fill="none"
                stroke="rgba(248,113,113,0.4)"
                strokeWidth={2.2}
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* crisp cancelled dashed line */}
              <path
                d={activityPaths.cancelledLine}
                fill="none"
                stroke="rgba(248,113,113,0.75)"
                strokeWidth={1}
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}

          {chartType === 'line' && activityPaths.completedPoints.map(({ x, y }, idx) => (
            <circle key={`completed-${idx}`} cx={x} cy={y} r={1} fill="#fdf4ff" stroke="#a855f7" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
          ))}

          {chartType === 'line' && activityPaths.cancelledPoints.map(({ x, y }, idx) => (
            <circle key={`cancelled-${idx}`} cx={x} cy={y} r={0.9} fill="#fee2e2" stroke="#f87171" strokeWidth={0.45} vectorEffect="non-scaling-stroke" />
          ))}

          {chartType === 'bar'
            ? (() => {
                // Grouped bars that fit within 100x100 viewBox for any n (e.g., 30d)
                const n = activitySeries.length;
                const padding = 3; // left/right padding in viewBox units
                const avail = Math.max(0, 100 - padding * 2);
                const step = n > 0 ? avail / n : 0; // width per group
                const intraGap = Math.min(1.6, step * 0.2); // gap between the two bars in a group
                const barW = Math.max(0.6, (step - intraGap) / 2); // width of each bar
                const maxVal = Math.max(
                  1,
                  ...activitySeries.map((p) => Math.max(p.total, p.completed + p.inProgress))
                );
                const baseY = 95; // leave padding for axis labels
                const scaleH = 80; // 80% vertical space for bars

                return (
                  <>
                    {activitySeries.map((p, i) => {
                      const groupX = padding + i * step;
                      const completedH = (p.completed / maxVal) * scaleH;
                      const cancelledH = (p.cancelled / maxVal) * scaleH;
                      const completedY = baseY - completedH;
                      const cancelledY = baseY - cancelledH;

                      return (
                        <g key={`bar-${i}`}>
                          {/* completed bar */}
                          <rect
                            x={groupX}
                            y={completedY}
                            width={barW}
                            height={completedH}
                            fill="url(#activityStroke)"
                            opacity={0.9}
                            rx={1.2}
                          />
                          {/* cancelled bar */}
                          <rect
                            x={groupX + barW + intraGap}
                            y={cancelledY}
                            width={barW}
                            height={cancelledH}
                            fill="rgba(248,113,113,0.8)"
                            rx={1.2}
                          />
                          {/* baseline tick for this group */}
                          <line
                            x1={groupX - 0.5}
                            x2={groupX + Math.max(0, 2 * barW + intraGap) + 0.5}
                            y1={95.5}
                            y2={95.5}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth={0.6}
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()
            : null}
        </svg>

        {/* Tooltip */}
        {hoverIndex != null && activitySeries[hoverIndex] ? (
          <div
            className="pointer-events-none absolute rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[11px] text-white shadow-lg backdrop-blur"
            style={{
              left: `${activityPaths.completedPoints[hoverIndex]?.x ?? activityPaths.cancelledPoints[hoverIndex]?.x ?? (hoverIndex * (100 / Math.max(1, activitySeries.length - 1)))}%`,
              top: `${Math.min(
                activityPaths.completedPoints[hoverIndex]?.y ?? 60,
                activityPaths.cancelledPoints[hoverIndex]?.y ?? 60,
              )}%`,
              transform: 'translate(-50%, -120%)',
            }}
            role="status"
          >
            <div className="font-semibold">{activitySeries[hoverIndex].label}</div>
            <div className="opacity-90">Completed: {activitySeries[hoverIndex].completed}</div>
            <div className="opacity-90">In progress: {activitySeries[hoverIndex].inProgress}</div>
            <div className="opacity-90">Cancelled: {activitySeries[hoverIndex].cancelled}</div>
            <div className="opacity-90">Total: {activitySeries[hoverIndex].total}</div>
          </div>
        ) : null}

        <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {activitySeries.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>

      <div className={`grid text-sm text-white/70 md:grid-cols-3 ${compact ? 'mt-4 gap-2' : 'mt-6 gap-3'}`}>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Completed ({range === 'day' ? '24h' : range === 'week' ? '7d' : '30d'})</p>
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
