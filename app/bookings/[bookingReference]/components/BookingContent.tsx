'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentIcon, 
  CheckIcon, 
  CalendarDaysIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface TimelineStep {
  status: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
}

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  listing: {
    title: string;
    price: number;
    currency: string;
    slug: string;
    imageUrl: string | null;
  };
  provider: {
    name: string;
    email: string;
    phone: string | null;
    businessName: string | null;
  } | null;
  projectTitle: string;
  preferredDate: string;
  location: string;
  additionalNotes: string | null;
  clientName: string | null;
  clientEmail: string;
  clientPhone: string | null;
  amount: number;
  currency: string;
  providerResponse: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  timeline: TimelineStep[];
  currentStep: number;
}

interface BookingContentProps {
  bookingReference: string;
}

/**
 * BookingContent Component
 * 
 * Client component that fetches and displays booking information.
 * Separated from page.tsx to allow client-side data fetching while keeping
 * the page component as a server component for better SEO.
 * 
 * Features:
 * - Real-time status fetching
 * - Timeline visualization with progress indicator
 * - Copy booking reference to clipboard
 * - Display project details and provider info
 * - Action buttons (confirm/reject for providers, cancel for clients)
 * - Error handling for invalid booking references
 * - Refresh button for status updates
 */
export default function BookingContent({ bookingReference }: BookingContentProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================================
  // FETCH BOOKING DATA
  // ============================================================================

  const fetchBooking = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/bookings/${bookingReference}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load booking details');
      }

      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingReference]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // ============================================================================
  // REFRESH HANDLER
  // ============================================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  // ============================================================================
  // COPY BOOKING REFERENCE
  // ============================================================================

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy booking reference:', err);
    }
  };

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // ============================================================================
  // STATUS BADGE
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pending' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Confirmed' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Completed' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${config.bg} ${config.text} ${config.border}`}>
        {status === 'completed' && <CheckCircleIcon className="h-4 w-4" />}
        {status === 'cancelled' && <XCircleIcon className="h-4 w-4" />}
        {config.label}
      </span>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-4 text-white/60">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl">
        <XCircleIcon className="mx-auto h-16 w-16 text-red-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">Booking Not Found</h2>
        <p className="mt-2 text-red-300">
          {error || 'The booking reference you entered could not be found.'}
        </p>
        <p className="mt-2 text-sm text-white/60">
          Booking Reference: <span className="font-mono font-semibold text-white">{bookingReference}</span>
        </p>
        <button
          onClick={handleGoBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Go Back
        </button>
      </div>
    );
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="h-8 w-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Service Booking</h1>
                <p className="text-sm text-white/60">View your booking details and status</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-50"
              title="Refresh status"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleGoBack}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
            >
              <ArrowLeftIcon className="inline h-5 w-5 mr-2" />
              Back
            </button>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <ClipboardDocumentIcon className="h-6 w-6 text-cyan-400" />
            <div>
              <p className="text-sm text-white/60">Booking Reference</p>
              <p className="font-mono text-lg font-bold text-white">{booking.bookingReference}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            <button
              onClick={handleCopyReference}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-green-400" />
                  Copied!
                </span>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <ClockIcon className="h-6 w-6 text-cyan-400" />
          Booking Timeline
        </h2>
        <div className="space-y-4">
          {booking.timeline.map((step, index) => (
            <div key={step.status} className="flex items-start gap-4">
              {/* Timeline Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    step.completed
                      ? 'border-cyan-400 bg-cyan-400/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  {step.completed ? (
                    <CheckIcon className="h-5 w-5 text-cyan-400" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-white/40" />
                  )}
                </div>
                {index < booking.timeline.length - 1 && (
                  <div
                    className={`h-12 w-0.5 ${
                      step.completed ? 'bg-cyan-400/40' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>

              {/* Timeline Content */}
              <div className="flex-1 pb-8">
                <p
                  className={`font-semibold ${
                    step.completed ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="mt-1 text-sm text-white/40">
                    {new Date(step.timestamp).toLocaleString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <BriefcaseIcon className="h-6 w-6 text-cyan-400" />
          Project Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-white/60">Service</p>
            <p className="mt-1 text-lg font-semibold text-white">{booking.listing.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/60">Project Title</p>
            <p className="mt-1 text-lg font-semibold text-white">{booking.projectTitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-white/60">Preferred Date</p>
              <p className="mt-1 flex items-center gap-2 text-white">
                <CalendarDaysIcon className="h-5 w-5 text-cyan-400" />
                {new Date(booking.preferredDate).toLocaleString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Location</p>
              <p className="mt-1 flex items-center gap-2 text-white">
                <MapPinIcon className="h-5 w-5 text-cyan-400" />
                {booking.location}
              </p>
            </div>
          </div>
          {booking.additionalNotes && (
            <div>
              <p className="text-sm font-medium text-white/60">Additional Notes</p>
              <p className="mt-1 rounded-lg border border-white/10 bg-white/5 p-3 text-white">
                {booking.additionalNotes}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-white/60">Service Fee</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">
              {booking.currency} {booking.amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Provider Info Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <UserIcon className="h-6 w-6 text-cyan-400" />
          Provider Information
        </h2>
        {booking.provider ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white/60">Provider Name</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {booking.provider.businessName || booking.provider.name}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-white/60">Email</p>
                <a
                  href={`mailto:${booking.provider.email}`}
                  className="mt-1 flex items-center gap-2 text-white hover:text-cyan-400 transition"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  {booking.provider.email}
                </a>
              </div>
              {booking.provider.phone && (
                <div>
                  <p className="text-sm font-medium text-white/60">Phone</p>
                  <a
                    href={`tel:${booking.provider.phone}`}
                    className="mt-1 flex items-center gap-2 text-white hover:text-cyan-400 transition"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    {booking.provider.phone}
                  </a>
                </div>
              )}
            </div>
            {booking.providerResponse && (
              <div>
                <p className="text-sm font-medium text-white/60">Provider Response</p>
                <p className="mt-1 rounded-lg border border-white/10 bg-white/5 p-3 text-white">
                  {booking.providerResponse}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Provider details are not available for this booking.
          </p>
        )}
      </div>

      {/* Client Contact Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-cyan-400" />
          Contact Information
        </h2>
        <div className="space-y-4">
          {booking.clientName && (
            <div>
              <p className="text-sm font-medium text-white/60">Client Name</p>
              <p className="mt-1 text-lg font-semibold text-white">{booking.clientName}</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-white/60">Email</p>
              <a
                href={`mailto:${booking.clientEmail}`}
                className="mt-1 flex items-center gap-2 text-white hover:text-cyan-400 transition"
              >
                <EnvelopeIcon className="h-5 w-5" />
                {booking.clientEmail}
              </a>
            </div>
            {booking.clientPhone && (
              <div>
                <p className="text-sm font-medium text-white/60">Phone</p>
                <a
                  href={`tel:${booking.clientPhone}`}
                  className="mt-1 flex items-center gap-2 text-white hover:text-cyan-400 transition"
                >
                  <PhoneIcon className="h-5 w-5" />
                  {booking.clientPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400">Awaiting Provider Confirmation</h3>
              <p className="mt-1 text-sm text-yellow-300/80">
                Your booking request has been sent to the provider. They will review and confirm shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-400">Booking Confirmed</h3>
              <p className="mt-1 text-sm text-blue-300/80">
                Your booking has been confirmed by the provider. Please contact them to finalize details.
              </p>
            </div>
          </div>
        </div>
      )}

      {booking.status === 'completed' && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-400">Service Completed</h3>
              <p className="mt-1 text-sm text-green-300/80">
                This service has been successfully completed. Thank you for using our platform!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
