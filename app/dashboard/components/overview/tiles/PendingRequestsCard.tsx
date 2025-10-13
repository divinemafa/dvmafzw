/**
 * PendingRequestsCard - Shows in-progress bookings needing follow-up
 * Displays pending and confirmed booking requests
 */

'use client';

import Link from 'next/link';
import { TicketIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import { formatCurrency } from './shared/utils';
import type { Booking } from '../../../types';
import type { TrendDescriptor } from './shared/types';

interface StatusCounts {
  byStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    client_cancellation_requested: number;
    provider_cancellation_requested: number;
  };
}

interface PendingRequestsCardProps {
  compact: boolean;
  pendingBookings: Booking[];
  pipelineInProgress: number;
  statusCounts: StatusCounts;
  formatDate: (value?: string | null) => string | null;
  bookingCurrency: string;
  pipelineInProgressTrend?: TrendDescriptor;
}

export const PendingRequestsCard = ({
  compact,
  pendingBookings,
  pipelineInProgress,
  statusCounts,
  formatDate,
  bookingCurrency,
  pipelineInProgressTrend,
}: PendingRequestsCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Pending Requests"
      subtitle="Follow up before they drift"
      icon={TicketIcon}
    >
      <div className="space-y-4 text-sm text-white/80">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>In progress</span>
          <span className="inline-flex items-center gap-2 text-white">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
              {pipelineInProgress}
            </span>
            {pipelineInProgressTrend ? (
              <span className="text-emerald-200">{pipelineInProgressTrend.label}</span>
            ) : null}
          </span>
        </div>

        <div className={`${pendingBookings.length ? 'space-y-3' : ''}`}>
          {pendingBookings.length ? (
            pendingBookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-white/50">
                  <span>{booking.client ?? 'Anonymous client'}</span>
                  <span>{formatDate(booking.startDate ?? booking.date) ?? 'TBD'}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">{booking.listingTitle ?? booking.service ?? 'Untitled booking'}</span>
                  {typeof booking.amount === 'number' ? (
                    <span className="text-xs text-white/70">{formatCurrency(booking.amount, bookingCurrency)}</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-white/60">
              No pending requests. Share a discount to re-ignite interest.
            </p>
          )}
        </div>

        <div className="flex justify-between text-[11px] uppercase tracking-wide text-white/60">
          <span>Confirmed</span>
          <span className="text-white">{statusCounts.byStatus.confirmed}</span>
        </div>

        <Link
          href="/dashboard?tab=bookings&view=pipeline"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:text-white"
        >
          Manage bookings
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionCard>
  );
};
