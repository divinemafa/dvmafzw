/**
 * PipelineBookingsCard - Full booking pipeline with revenue metrics
 * Shows all bookings sorted by status with projected revenue
 */

'use client';

import { TicketIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import { formatCurrency } from './shared/utils';
import type { Booking } from '../../../types';

type BookingStatus = Booking['status'];

const bookingStatusOrder: Record<BookingStatus, number> = {
  pending: 1,
  client_cancellation_requested: 2,
  provider_cancellation_requested: 3,
  confirmed: 4,
  completed: 5,
  cancelled: 6,
};

interface StatusCounts {
  total: number;
  revenue: number;
  byStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    client_cancellation_requested: number;
    provider_cancellation_requested: number;
  };
}

interface PipelineBookingsCardProps {
  compact: boolean;
  bookings: Booking[];
  statusCounts: StatusCounts;
  averageTicketValue: number;
  bookingCurrency: string;
  formatDate: (value?: string | null) => string | null;
  bookingListSpacing: string;
}

export const PipelineBookingsCard = ({
  compact,
  bookings,
  statusCounts,
  averageTicketValue,
  bookingCurrency,
  formatDate,
  bookingListSpacing,
}: PipelineBookingsCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Pipeline"
      subtitle="Bookings and projected revenue"
      icon={TicketIcon}
      actionLabel="Manage bookings"
    >
      <div className={`text-sm ${bookingListSpacing}`}>
        {bookings.length ? (
          bookings
            .slice()
            .sort((a, b) => bookingStatusOrder[a.status] - bookingStatusOrder[b.status])
            .slice(0, 6)
            .map((booking) => {
              const scheduledFor = formatDate(booking.startDate ?? booking.date);

              return (
                <div
                  key={booking.id}
                  className={`flex items-start justify-between rounded-xl bg-white/5 ${compact ? 'px-3 py-2.5' : 'px-3 py-3'} text-sm text-white`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{booking.listingTitle ?? booking.service ?? 'Untitled booking'}</p>
                    <p className="text-xs text-white/60">{booking.client ?? 'Anonymous client'}</p>
                  </div>
                  <div className="text-right text-xs text-white/70">
                    <p className="font-semibold capitalize text-white/80">{booking.status}</p>
                    <p>{scheduledFor ?? 'Date TBA'}</p>
                    {typeof booking.amount === 'number' ? (
                      <p className="mt-1 font-semibold text-white">{formatCurrency(booking.amount, bookingCurrency)}</p>
                    ) : null}
                  </div>
                </div>
              );
            })
        ) : (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-sm text-white/70">
            No bookings yet. Promote your top listing to fill your calendar.
          </p>
        )}
      </div>
      <div className={`mt-4 grid md:grid-cols-3 ${compact ? 'gap-2.5' : 'gap-3'}`}>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Average ticket</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(averageTicketValue || 0, bookingCurrency)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Pending approvals</p>
          <p className="mt-1 text-lg font-semibold text-white">{statusCounts.byStatus.pending}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-wide text-white/50">Expected revenue</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(statusCounts.revenue, bookingCurrency)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
};
