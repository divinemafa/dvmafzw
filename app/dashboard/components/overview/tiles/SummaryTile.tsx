/**
 * SummaryTile - Reusable metric tile component
 * Used for displaying key metrics with icons, trends, and hints
 */

'use client';

import type { ComponentType, SVGProps } from 'react';
import { useMemo } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusSmallIcon,
} from '@heroicons/react/24/outline';
import { getCardBaseClasses, accentRing } from './shared/utils';
import type { TrendDescriptor } from './shared/types';

interface SummaryTileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  hint?: string;
  trend?: TrendDescriptor;
  accentClass: string;
  compact: boolean;
  sparkSeries?: number[];
}

export const SummaryTile = ({ icon: Icon, label, value, hint, trend, accentClass, compact, sparkSeries }: SummaryTileProps) => {
  const cardClasses = getCardBaseClasses(compact);
  const iconPadding = compact ? 'p-1.5' : 'p-2';
  const valueClasses = compact ? 'text-2xl' : 'text-3xl';
  const labelClasses = compact ? 'text-[10px]' : 'text-xs';
  const hintClasses = compact ? 'text-[11px]' : 'text-xs';

  const trendClasses = trend
    ? trend.direction === 'up'
      ? 'bg-lime-500/20 text-lime-300 shadow-lime-500/10 shadow-sm'
      : trend.direction === 'down'
        ? 'bg-rose-500/20 text-rose-300 shadow-rose-500/10 shadow-sm'
        : 'bg-slate-500/15 text-slate-300'
    : '';

  // Prepare sparkline path with smooth curves
  const spark = useMemo(() => {
    const series = sparkSeries && sparkSeries.length ? sparkSeries : undefined;
    if (!series) return null;
    const maxVal = Math.max(1, ...series);
    const step = series.length > 1 ? 100 / (series.length - 1) : 100;
    const toY = (v: number) => 100 - (v / maxVal) * 85; // leave 15% padding at top
    
    // Build smooth curve path using quadratic bezier
    let path = '';
    series.forEach((v, i) => {
      const x = step * i;
      const y = toY(v);
      if (i === 0) {
        path += `M${x.toFixed(2)},${y.toFixed(2)}`;
      } else {
        const prevX = step * (i - 1);
        const prevY = toY(series[i - 1]);
        const cpX = ((prevX + x) / 2).toFixed(2);
        const cpY = ((prevY + y) / 2).toFixed(2);
        path += ` Q${cpX},${prevY.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)}`;
      }
    });
    
    // Build area path (line + bottom fill)
    const lastX = step * (series.length - 1);
    const areaPath = `${path} L${lastX.toFixed(2)},100 L0,100 Z`;
    
    return { linePath: path, areaPath };
  }, [sparkSeries]);

  return (
    <div className={`${cardClasses} relative flex flex-col overflow-hidden ${accentRing}`}>
      <div className={`pointer-events-none absolute inset-0 -z-10 ${accentClass}`} aria-hidden />
      
      {/* Compact header: icon + label left, delta top-right */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`flex items-center justify-center rounded-lg bg-white/10 ${compact ? 'p-1' : 'p-1.5'} text-white`}>
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-semibold uppercase tracking-widest text-white`}>{label}</p>
            {hint ? <p className={`text-[10px] truncate text-white/80`}>{hint}</p> : null}
          </div>
        </div>
        {trend ? (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${trendClasses}`}
          >
            {trend.direction === 'up' ? (
              <ArrowTrendingUpIcon className="h-3 w-3" aria-hidden />
            ) : trend.direction === 'down' ? (
              <ArrowTrendingDownIcon className="h-3 w-3" aria-hidden />
            ) : (
              <MinusSmallIcon className="h-3 w-3" aria-hidden />
            )}
            {trend.label}
          </span>
        ) : null}
      </div>

      {/* Sparkline with value overlaid bottom-right - extends into all card padding */}
      <div className="absolute inset-0 flex items-end justify-end">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          {spark ? (
            <>
              <defs>
                <linearGradient id={`sparkStroke-${label.replace(/\s+/g, '-')}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id={`sparkFill-${label.replace(/\s+/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
                  <stop offset="50%" stopColor="rgba(139,92,246,0.08)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
              </defs>
              {/* Gradient fill area below line */}
              <path d={spark.areaPath} fill={`url(#sparkFill-${label.replace(/\s+/g, '-')})`} />
              {/* Smooth curved line */}
              <path d={spark.linePath} fill="none" stroke={`url(#sparkStroke-${label.replace(/\s+/g, '-')})`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </>
          ) : null}
        </svg>
        {/* Exponential vignette overlay - fades from sides and bottom, full visibility at top center */}
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 100%, transparent 0%, transparent 35%, rgba(15,23,42,0.4) 70%, rgba(15,23,42,0.85) 90%, rgba(15,23,42,0.95) 100%),
              linear-gradient(to top, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.3) 15%, transparent 30%)
            `
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute bottom-1 right-2">
          <p className={`${compact ? 'text-3xl' : 'text-4xl'} font-bold leading-none text-white drop-shadow-lg`}>{value}</p>
        </div>
      </div>
    </div>
  );
};
