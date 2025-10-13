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
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  bookingReference: string;
  projectTitle: string;
  listingTitle?: string;
  provider?: string;
  preferredDate?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
        amount: booking.amount,
        currency: booking.currency,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-400" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'confirmed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            <p className="mt-1 text-sm text-white/60">
              View and manage your service bookings
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{bookings.length}</p>
            <p className="text-xs uppercase tracking-wider text-white/40">Total Bookings</p>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <button
            key={booking.id}
            onClick={() => handleBookingClick(booking.bookingReference)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-2xl transition-all hover:border-blue-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/10"
          >
            {/* Status Badge */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusIcon(booking.status)}
                {booking.status}
              </span>
            </div>

            {/* Booking Reference */}
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-white/40">Booking Reference</p>
              <p className="font-mono text-sm font-semibold text-white">{booking.bookingReference}</p>
            </div>

            {/* Project Title */}
            <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
              {booking.projectTitle}
            </h3>

            {/* Service Info */}
            {booking.listingTitle && booking.listingTitle !== booking.projectTitle && (
              <p className="mb-2 text-xs text-white/60 line-clamp-1">
                Service: {booking.listingTitle}
              </p>
            )}

            {/* Provider */}
            {booking.provider && (
              <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                <UserIcon className="h-4 w-4" />
                <span>{booking.provider}</span>
              </div>
            )}

            {/* Scheduled Date */}
            <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>{formatDate(booking.preferredDate)}</span>
            </div>

            {/* Amount */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs uppercase tracking-wider text-white/40">Amount</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(booking.amount, booking.currency)}
              </span>
            </div>

            {/* Hover Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}
