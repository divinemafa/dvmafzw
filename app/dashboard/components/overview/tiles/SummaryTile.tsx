/**
 * SummaryTile - Reusable metric tile component
 * Used for displaying key metrics with icons, trends, and hints
 */

'use client';

import type { ComponentType, SVGProps } from 'react';
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
}

export const SummaryTile = ({ icon: Icon, label, value, hint, trend, accentClass, compact }: SummaryTileProps) => {
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
      <div className={`pointer-events-none absolute inset-0 -z-10 ${accentClass}`} aria-hidden />
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
