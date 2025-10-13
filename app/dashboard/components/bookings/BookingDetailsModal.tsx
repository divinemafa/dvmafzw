'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import type { Booking as DashboardBooking } from '../../types';
import { statusAccent, statusChipBaseClass, statusLabels } from './statusConfig';

type BookingStatus = DashboardBooking['status'];

interface ModalBooking {
  id?: string | number;
  reference?: string;
  booking_reference?: string;
  projectTitle?: string;
  project_title?: string;
  client?: string;
  client_name?: string;
  clientEmail?: string;
  client_email?: string;
  clientPhone?: string | null;
  client_phone?: string | null;
  status: BookingStatus;
  amount?: number | null;
  currency?: string | null;
  preferredDate?: string | null;
  preferred_date?: string | null;
  location?: string | null;
  notes?: string | null;
  additional_notes?: string | null;
  listing?: {
    id: string;
    title: string;
    slug: string;
    category?: string | null;
    short_description?: string | null;
    long_description?: string | null;
    price?: number | null;
    currency?: string | null;
    image_url?: string | null;
    features?: string[] | null;
    tags?: string[] | null;
    listing_type?: string | null;
    availability?: string | null;
    location?: string | null;
    rating?: number | null;
    reviews_count?: number | null;
  } | null;
  listing_title?: string;
  listing_category?: string | null;
  listing_short_description?: string | null;
  listing_long_description?: string | null;
  listing_image_url?: string | null;
  listing_features?: string[] | null;
  listing_tags?: string[] | null;
  providerResponse?: string | null;
  provider_response?: string | null;
  createdAt?: string;
  confirmedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ModalBooking | null;
  onUpdated: () => void; // Callback after successful update
}

export const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onUpdated,
}: BookingDetailsModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [providerResponse, setProviderResponse] = useState('');
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);

  // Reset state when modal closes
  const handleClose = () => {
    setProviderResponse('');
    setActionType(null);
    onClose();
  };

  const handleAction = async (action: 'accept' | 'reject') => {
    if (!booking) return;

    // Validate response is required when rejecting
    if (action === 'reject' && !providerResponse.trim()) {
      alert('Please provide a reason for rejecting this booking');
      return;
    }

    setIsProcessing(true);
    setActionType(action);

    try {
      const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';
      const bookingReference = booking.reference || booking.booking_reference;
      
      if (!bookingReference) {
        alert('Booking reference not found');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingReference}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          providerResponse: providerResponse.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || `Booking ${action === 'accept' ? 'confirmed' : 'rejected'} successfully! ${action === 'accept' ? '💳 Payment marked as received.' : ''}`);
        onUpdated(); // Refresh parent data
        handleClose();
      } else {
        alert(data.error || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`An error occurred while ${action}ing the booking`);
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  if (!booking) return null;

  // Normalize field names (support both snake_case and camelCase)
  const formatCurrencyValue = (value: number | null | undefined, currencyCode?: string | null) => {
    if (typeof value !== 'number') return null;
    try {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currencyCode || 'ZAR',
        minimumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.warn('Currency formatting failed. Falling back to plain text.', error);
      return `${currencyCode ?? ''} ${value.toFixed(2)}`.trim();
    }
  };

  const bookingRef = booking.reference || booking.booking_reference || 'N/A';
  const listing = booking.listing || null;
  const listingTitle = listing?.title || booking.listing_title || null;
  const projectTitle = booking.projectTitle || booking.project_title || listingTitle || 'Untitled Project';
  const clientName = booking.client || booking.client_name || 'Anonymous';
  const clientEmail = booking.clientEmail || booking.client_email || '';
  const clientPhone = booking.clientPhone || booking.client_phone || null;
  const preferredDate = booking.preferredDate || booking.preferred_date || null;
  const notes = booking.notes || booking.additional_notes || null;
  const providerResponseText = booking.providerResponse || booking.provider_response || null;
  const listingCategory = listing?.category || booking.listing_category || null;
  const listingShortDescription = listing?.short_description || booking.listing_short_description || null;
  const listingLongDescription = listing?.long_description || booking.listing_long_description || null;
  const listingImage = listing?.image_url || booking.listing_image_url || null;
  const listingFeatures = listing?.features || booking.listing_features || null;
  const listingTags = listing?.tags || booking.listing_tags || null;
  const listingAvailability = listing?.availability || null;
  const listingLocation = listing?.location || booking.location || null;
  const listingRating = typeof listing?.rating === 'number' ? listing.rating : null;
  const listingReviews = typeof listing?.reviews_count === 'number' ? listing.reviews_count : null;
  const listingPrice = typeof listing?.price === 'number' ? listing.price : null;
  const listingCurrency = listing?.currency || null;
  const bookingAmount = typeof booking.amount === 'number' ? booking.amount : null;
  const bookingCurrency = booking.currency || listingCurrency || null;
  const formattedBookingAmount = formatCurrencyValue(bookingAmount, bookingCurrency);
  const formattedListingPrice = formatCurrencyValue(listingPrice, listingCurrency || bookingCurrency);
  const createdAt = booking.createdAt || (booking as any).created_at || null;
  const confirmedAt = booking.confirmedAt || (booking as any).confirmed_at || null;
  const completedAt = booking.completedAt || (booking as any).completed_at || null;
  const cancelledAt = booking.cancelledAt || (booking as any).cancelled_at || null;

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const isCompleted = booking.status === 'completed';
  const statusBadgeClass = `${statusChipBaseClass} ${statusAccent[booking.status]}`;
  const statusLabel = statusLabels[booking.status] ?? booking.status;
  const isCancellationRequested =
    booking.status === 'client_cancellation_requested' || booking.status === 'provider_cancellation_requested';

  // Payment status simulation
  const paymentStatus = isConfirmed || isCompleted ? 'Paid' : isPending ? 'Pending' : 'N/A';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all">
                {/* Header */}
                <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-6 py-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Dialog.Title className="text-xl font-semibold text-white md:text-2xl">
                          {projectTitle}
                        </Dialog.Title>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60 md:text-sm">
                          <span className="font-mono font-medium">{bookingRef}</span>
                          {createdAt && (
                            <>
                              <span>•</span>
                              <span>
                                Booked {new Date(createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                          {listingCategory && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/70">
                                {listingCategory}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Status Badge & Payment Status */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className={`${statusBadgeClass} inline-flex items-center gap-1.5`}> 
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusLabel}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                      paymentStatus === 'Paid' 
                        ? 'border-green-300/40 bg-green-400/20 text-green-100'
                        : paymentStatus === 'Pending'
                        ? 'border-yellow-300/40 bg-yellow-400/20 text-yellow-100'
                        : 'border-gray-300/40 bg-gray-400/20 text-gray-100'
                    }`}>
                      {paymentStatus === 'Paid' ? '💳 Paid' : paymentStatus === 'Pending' ? '⏳ Payment Pending' : '—'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[600px] overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 md:text-sm">
                          <DocumentTextIcon className="h-4 w-4" />
                          Service & Booking Summary
                        </h3>
                        {listingAvailability && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/60">
                            {listingAvailability}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        {listingTitle && (
                          <div className="flex flex-col gap-3 rounded-lg border border-blue-500/15 bg-blue-500/5 p-3 sm:flex-row sm:items-start sm:gap-4">
                            {listingImage && (
                              <img
                                src={listingImage}
                                alt={listingTitle}
                                className="h-20 w-full shrink-0 rounded-lg border border-blue-500/20 object-cover sm:h-20 sm:w-20"
                              />
                            )}
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-200/70">Service/Product</p>
                                <p className="mt-1 text-base font-semibold text-blue-50 md:text-lg">{listingTitle}</p>
                                {listingCategory && (
                                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-100">
                                    {listingCategory}
                                  </span>
                                )}
                              </div>
                              {(listingShortDescription || listingLongDescription) && (
                                <p className="text-xs leading-relaxed text-blue-100/70">
                                  {listingShortDescription || listingLongDescription}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                                {formattedListingPrice && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-blue-100">
                                    <CurrencyDollarIcon className="h-3 w-3" />
                                    {formattedListingPrice}
                                  </span>
                                )}
                                {listingLocation && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5">
                                    <MapPinIcon className="h-3 w-3" />
                                    {listingLocation}
                                  </span>
                                )}
                                {listingRating && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-2 py-0.5 text-yellow-100">
                                    ★
                                    {listingRating.toFixed(1)}
                                    {listingReviews ? ` (${listingReviews})` : ''}
                                  </span>
                                )}
                              </div>
                              {Array.isArray(listingFeatures) && listingFeatures.length > 0 && (
                                <div className="border-t border-blue-400/15 pt-2">
                                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-blue-200/60">Features</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {listingFeatures.map((feature, idx) => (
                                      <span
                                        key={`${feature}-${idx}`}
                                        className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] text-blue-50"
                                      >
                                        ✓ {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {Array.isArray(listingTags) && listingTags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {listingTags.map((tag, idx) => (
                                    <span
                                      key={`${tag}-${idx}`}
                                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                            <div className="flex items-center justify-between text-xs font-medium text-green-200/70">
                              <span className="inline-flex items-center gap-1">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                Total Amount
                              </span>
                              <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-green-100">
                                {bookingCurrency || 'ZAR'}
                              </span>
                            </div>
                            <p className="mt-1 text-lg font-semibold text-green-100 md:text-xl">
                              {formattedBookingAmount ?? '—'}
                            </p>
                          </div>

                          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <p className="text-xs font-medium text-white/60">Payment Status</p>
                            <p
                              className={`mt-1 text-sm font-semibold md:text-base ${
                                paymentStatus === 'Paid'
                                  ? 'text-green-400'
                                  : paymentStatus === 'Pending'
                                  ? 'text-yellow-400'
                                  : 'text-white/60'
                              }`}
                            >
                              {paymentStatus}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {preferredDate && (
                            <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                              <div className="flex items-start gap-2">
                                <CalendarIcon className="h-5 w-5 shrink-0 text-purple-300" />
                                <div className="flex-1">
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-purple-200/70">Scheduled Date</p>
                                  <p className="mt-1 text-sm font-medium text-white">
                                    {new Date(preferredDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-xs text-purple-100/80">
                                    � {new Date(preferredDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {listingLocation && (
                            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="h-5 w-5 shrink-0 text-purple-300" />
                                <div className="flex-1">
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">Location</p>
                                  <p className="mt-1 text-sm text-white/90">{listingLocation}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {notes && (
                          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                            <div className="flex items-start gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-yellow-200" />
                              <div className="flex-1">
                                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-yellow-100/70">Client Requirements</p>
                                <p className="mt-1 text-sm leading-relaxed text-yellow-50/90">{notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                        <UserCircleIcon className="h-4 w-4" />
                        Client Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                            <UserCircleIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white/60">Client Name</p>
                            <p className="text-base font-semibold text-white">{clientName}</p>
                          </div>
                        </div>

                        {clientEmail && (
                          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                              <EnvelopeIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/60">Email Address</p>
                              <a
                                href={`mailto:${clientEmail}`}
                                className="text-base font-medium text-blue-400 hover:text-blue-300 hover:underline"
                              >
                                {clientEmail}
                              </a>
                            </div>
                          </div>
                        )}

                        {clientPhone && (
                          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                              <PhoneIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white/60">Phone Number</p>
                              <a
                                href={`tel:${clientPhone}`}
                                className="text-base font-medium text-blue-400 hover:text-blue-300 hover:underline"
                              >
                                {clientPhone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Timeline */}
                    {(createdAt || confirmedAt || completedAt || cancelledAt) && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                          <CalendarIcon className="h-4 w-4" />
                          Booking Timeline
                        </h3>
                        <div className="space-y-2.5">
                          {createdAt && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                                <span className="text-xs">📝</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-white/50">Booking Created</p>
                                <p className="text-xs text-white/80">
                                  {new Date(createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                          {confirmedAt && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                <span className="text-xs">✅</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-green-300/80">Confirmed by Provider</p>
                                <p className="text-xs text-white/80">
                                  {new Date(confirmedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                          {completedAt && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                                <span className="text-xs">🎉</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-blue-300/80">Service Completed</p>
                                <p className="text-xs text-white/80">
                                  {new Date(completedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                          {cancelledAt && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                                <span className="text-xs">❌</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-300/80">Booking Cancelled</p>
                                <p className="text-xs text-white/80">
                                  {new Date(cancelledAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Provider Response Section (Show if confirmed/cancelled or for pending) */}
                    {(isPending || providerResponseText) && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                          <DocumentTextIcon className="h-4 w-4" />
                          {isPending ? 'Your Response to Client' : 'Provider Response'}
                        </h3>
                        {isPending ? (
                          <div>
                            <textarea
                              value={providerResponse}
                              onChange={(e) => setProviderResponse(e.target.value)}
                              placeholder="Add a message to the client (optional for accepting, required for rejecting)..."
                              rows={4}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="mt-2 text-xs text-white/50">
                              💡 Tip: A friendly message helps build trust with your clients
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <p className="text-sm leading-relaxed text-white/90">
                              {providerResponseText || 'No response provided'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Action Buttons */}
                {isPending && (
                  <div className="border-t border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50 px-6 py-5">
                    <div className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                      <p className="text-center text-sm text-blue-200">
                        💳 <strong>Payment Simulation:</strong> Accepting this booking will mark payment as received
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-5 py-3.5 font-semibold text-red-300 shadow-lg transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && actionType === 'reject' ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-6 w-6" />
                            <span>Reject Booking</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction('accept')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-green-500/30 bg-green-500/10 px-5 py-3.5 font-semibold text-green-300 shadow-lg transition-all hover:border-green-500/50 hover:bg-green-500/20 hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && actionType === 'accept' ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-300 border-t-transparent" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-6 w-6" />
                            <span>Accept & Confirm</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer - Info for non-pending bookings */}
                {!isPending && (
                  <div className="border-t border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50 px-6 py-5">
                    <div className={`rounded-lg border p-4 text-center ${
                      isConfirmed
                        ? 'border-green-500/20 bg-green-500/10'
                        : isCompleted
                        ? 'border-blue-500/20 bg-blue-500/10'
                        : isCancellationRequested
                        ? 'border-orange-500/20 bg-orange-500/10'
                        : 'border-red-500/20 bg-red-500/10'
                    }`}>
                      <p className={`text-sm font-medium ${
                        isConfirmed
                          ? 'text-green-200'
                          : isCompleted
                          ? 'text-blue-200'
                          : isCancellationRequested
                          ? 'text-orange-200'
                          : 'text-red-200'
                      }`}>
                        {isConfirmed ? (
                          <>
                            ✅ <strong>Booking Confirmed</strong> • Payment received • Ready to deliver service
                          </>
                        ) : isCompleted ? (
                          <>
                            🎉 <strong>Service Completed</strong> • This booking has been successfully finished
                          </>
                        ) : isCancellationRequested ? (
                          <>
                            ⚠️ <strong>Cancellation Requested</strong> • Review and respond to the cancellation request
                          </>
                        ) : (
                          <>
                            ❌ <strong>Booking Cancelled</strong> • This booking has been terminated
                          </>
                        )}
                      </p>
                      {confirmedAt && isConfirmed && (
                        <p className="mt-2 text-xs text-white/50">
                          Confirmed on {new Date(confirmedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      {completedAt && isCompleted && (
                        <p className="mt-2 text-xs text-white/50">
                          Completed on {new Date(completedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
