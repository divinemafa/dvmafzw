/**
 * NextBookingCard - Displays upcoming booking details
 * Shows next scheduled booking with client info and action buttons
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import { formatCurrency } from './shared/utils';
import type { Booking } from '../../../types';

interface NextBookingCardProps {
  compact: boolean;
  upcomingBooking: Booking | null;
  formatDate: (value?: string | null) => string | null;
  bookingCurrency: string;
}

export const NextBookingCard = ({
  compact,
  upcomingBooking,
  formatDate,
  bookingCurrency,
}: NextBookingCardProps) => {
  const router = useRouter();
  const bookingRef = upcomingBooking?.reference;
  const handleOpen = () => {
    if (bookingRef) {
      router.push(`/bookings/${bookingRef}`);
    } else {
      // Fallback: go to bookings tab
      router.push('/dashboard?tab=bookings');
    }
  };
  return (
    <SectionCard
      compact={compact}
      title="Next Booking"
      subtitle={upcomingBooking ? 'Keep this touchpoint on track' : 'No upcoming bookings yet'}
      icon={CalendarIcon}
      actionLabel={upcomingBooking ? 'Open booking' : undefined}
      onAction={upcomingBooking ? handleOpen : undefined}
      className="border-white/15 bg-gradient-to-br from-indigo-500/20 via-slate-900/30 to-transparent"
    >
      {upcomingBooking ? (
        <div className="space-y-4 text-sm text-white">
          <div className="flex items-start justify-between gap-3 text-white/80">
            <div className="space-y-1">
              <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-white`}> 
                {upcomingBooking.projectTitle ?? upcomingBooking.listingTitle ?? upcomingBooking.service ?? 'Unnamed service'}
              </p>
              <p className="text-xs uppercase tracking-wide text-white/50">Client</p>
              <p className="text-sm font-medium text-white/80">{upcomingBooking.client ?? 'Anonymous client'}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              {upcomingBooking.status}
            </span>
          </div>

          <div className={`grid ${compact ? 'gap-2' : 'gap-3'} text-white/80 sm:grid-cols-2`}>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">When</p>
              <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-white`}>
                {formatDate(upcomingBooking.preferredDate ?? upcomingBooking.startDate ?? upcomingBooking.date) ?? 'Date to be scheduled'}
              </p>
            </div>
             {typeof upcomingBooking.amount === 'number' ? (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">Projected payout</p>
                <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-emerald-100`}>
                  {formatCurrency(upcomingBooking.amount, upcomingBooking.currency ?? bookingCurrency)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard?tab=messages"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Chat client
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard?tab=calendar"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/60 transition hover:border-white/25 hover:text-white"
            >
              Reschedule
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/70">
          You&apos;re all caught up. Encourage conversions by sharing a promotion or checking in with past clients.
        </p>
      )}
    </SectionCard>
  );
};
