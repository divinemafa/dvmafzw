/**
 * SectionCard - Reusable card wrapper for dashboard sections
 * Provides consistent styling and structure for all dashboard cards
 */

'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { getCardBaseClasses, accentRing } from './shared/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact: boolean;
  className?: string;
  rightSlot?: ReactNode;
}

export const SectionCard = ({ title, subtitle, icon: Icon, children, actionLabel, onAction, compact, className, rightSlot }: SectionCardProps) => {
  const cardClasses = `${getCardBaseClasses(compact)} ${className ?? ''}`;
  const headerMargin = compact ? 'mb-3' : 'mb-4';
  const actionPadding = compact ? 'px-3 py-1' : 'px-3.5 py-1.5';
  const subtitleSize = compact ? 'text-xs' : 'text-sm';

  return (
    <section className={`${cardClasses} relative ${accentRing}`}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60"
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
        <div className="flex items-center gap-2">
          {rightSlot}
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
        </div>
      </header>
      <div className="relative">{children}</div>
    </section>
  );
};
