/**
 * SavedLeadsCard - Displays pending booking requests ready to convert
 * Shows active leads that need follow-up
 */

'use client';

import Link from 'next/link';
import { BookmarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import type { Booking, MarketplaceStats } from '../../../types';
import type { TrendDescriptor } from './shared/types';

interface SavedLeadsCardProps {
  compact: boolean;
  stats: MarketplaceStats;
  topPendingBookings: Booking[];
  formatDate: (value?: string | null) => string | null;
  savedLeadTrend?: TrendDescriptor;
}

export const SavedLeadsCard = ({
  compact,
  stats,
  topPendingBookings,
  formatDate,
  savedLeadTrend,
}: SavedLeadsCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Saved Leads"
      subtitle="Pending requests ready to convert"
      icon={BookmarkIcon}
    >
      <div className="space-y-4 text-sm text-white/80">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
          <span className="text-white/60">Active leads</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
            {stats.pendingBookings} hot
          </span>
        </div>
        <div className={`${topPendingBookings.length ? 'space-y-3' : ''}`}>
          {topPendingBookings.length ? (
            topPendingBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-white/50">
                  <span>{booking.client ?? 'Anonymous client'}</span>
                  <span>{formatDate(booking.startDate ?? booking.date) ?? 'TBD'}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  {booking.listingTitle ?? booking.service ?? 'Untitled booking'}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-white/60">
              No saved leads right now. Promote a listing to capture new demand.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>Momentum</span>
          {savedLeadTrend ? <span className="text-amber-200">{savedLeadTrend.label}</span> : <span>Holding steady</span>}
        </div>
        <Link
          href="/dashboard?tab=bookings&view=pipeline"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200 transition hover:text-amber-100"
        >
          Review pipeline
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionCard>
  );
};
