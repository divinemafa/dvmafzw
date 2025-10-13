/**
 * Bookings Section - User's Service Bookings
 * 
 * Displays all service bookings made by the user (bookings they requested, not bookings received in their business).
 * Shows booking details, status, and allows clicking to view full booking page.
 * 
 * Features:
 * - Fetches bookings from database filtered by user's email
 * - Displays booking status with color-coded indicators
 * - Shows service details, booking reference, and scheduled date
 * - Click to navigate to full booking details page
 * - Empty state when no bookings exist
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<BookingStatus, { label: string; badgeClass: string; icon: typeof CheckCircleIcon }> = {
  pending: {
    label: 'Awaiting Confirmation',
    badgeClass: 'text-amber-200 border-amber-400/25 bg-amber-500/10 shadow-[0_0_25px_rgba(251,191,36,0.15)]',
    icon: ClockIcon,
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'text-emerald-200 border-emerald-400/25 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.15)]',
    icon: CheckCircleIcon,
  },
  completed: {
    label: 'Completed',
    badgeClass: 'text-sky-200 border-sky-400/25 bg-sky-500/10 shadow-[0_0_25px_rgba(125,211,252,0.15)]',
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'text-rose-200 border-rose-400/25 bg-rose-500/10 shadow-[0_0_25px_rgba(244,114,182,0.15)]',
    icon: XCircleIcon,
  },
};

interface Booking {
  id: string;
  bookingReference: string;
  projectTitle: string;
  listingTitle?: string;
  provider?: string;
  preferredDate?: string;
  status: BookingStatus;
  amount: number;
  currency: string;
  createdAt: string;
  location?: string;
}

interface BookingsSectionProps {
  userEmail: string;
}

export function BookingsSection({ userEmail }: BookingsSectionProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/recent?email=${encodeURIComponent(userEmail)}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Transform API response to match our interface
      const transformedBookings: Booking[] = (data.bookings || []).map((booking: any) => ({
        id: booking.id,
        bookingReference: booking.booking_reference,
        projectTitle: booking.project_title || booking.listingTitle,
        listingTitle: booking.listingTitle,
        provider: booking.provider,
        preferredDate: booking.preferredDate || booking.startDate,
  status: booking.status,
  amount: typeof booking.amount === 'number' ? booking.amount : Number(booking.amount) || 0,
  currency: booking.currency || 'USD',
  createdAt: booking.createdAt,
        location: booking.location,
      }));
      
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingClick = (bookingReference: string) => {
    router.push(`/bookings/${bookingReference}`);
  };

  const getStatusMeta = (status: BookingStatus) => STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatCreatedDate = (dateString?: string) => {
    if (!dateString) return 'Created • TBD';
    const date = new Date(dateString);
    return `Created • ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">My Bookings</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-white/60">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">My Bookings</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">My Bookings</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <CalendarDaysIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
            <p className="text-white/60 mb-6 max-w-md">
              You haven&apos;t booked any services yet. Browse our marketplace to find and book services.
            </p>
            <button
              onClick={() => router.push('/market')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bookings List
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent p-6 shadow-xl shadow-blue-500/10 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 rounded-l-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent opacity-40 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">My Bookings</h2>
            <p className="mt-1 text-sm text-white/70">
              Track requests, confirmations, and completed services
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-white">{bookings.length}</p>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Total</p>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => {
          const { badgeClass, icon: StatusIcon, label } = getStatusMeta(booking.status);

          return (
            <button
              key={booking.id}
              onClick={() => handleBookingClick(booking.bookingReference)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 text-left shadow-lg shadow-blue-500/5 backdrop-blur-2xl transition-all hover:border-blue-500/40 hover:shadow-blue-500/20"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl transition duration-500 group-hover:bg-purple-500/20" />
              <div className="relative z-[1]">
                {/* Status Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur ${badgeClass}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {formatCreatedDate(booking.createdAt)}
                  </span>
                </div>

                {/* Booking Reference */}
                <div className="relative mb-3">
                  <p className="text-xs uppercase tracking-wider text-white/40">Booking Reference</p>
                  <p className="font-mono text-base font-semibold text-white">
                    {booking.bookingReference}
                  </p>
                </div>

                {/* Project Title */}
                <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2 transition-colors group-hover:text-blue-300">
                  {booking.projectTitle}
                </h3>

                {/* Service Info */}
                {booking.listingTitle && booking.listingTitle !== booking.projectTitle && (
                  <p className="mb-3 text-xs text-white/60 line-clamp-1">
                    Service: {booking.listingTitle}
                  </p>
                )}

                {/* Provider */}
                {booking.provider && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span>{booking.provider}</span>
                  </div>
                )}

                {/* Location */}
                {booking.location && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                      <MapPinIcon className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-1">{booking.location}</span>
                  </div>
                )}

                {/* Scheduled Date */}
                <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                    <CalendarDaysIcon className="h-4 w-4" />
                  </div>
                  <span>{formatDate(booking.preferredDate)}</span>
                </div>

                {/* Amount */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs uppercase tracking-wider text-white/40">Service Fee</span>
                  <span className="text-xl font-semibold text-white">
                    {formatCurrency(booking.amount, booking.currency)}
                  </span>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
