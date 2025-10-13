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

interface Booking {
  booking_reference: string;
  project_title: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  preferred_date: string | null;
  location: string | null;
  additional_notes: string | null;
  listing_title?: string;
  provider_response?: string | null;
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
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
      
      const response = await fetch(`/api/bookings/${booking.booking_reference}`, {
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
        alert(data.message || `Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
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

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

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
                <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-white">
                        Booking Details
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-white/60">
                        {booking.booking_reference}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20'
                          : booking.status === 'confirmed'
                          ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                          : booking.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20'
                          : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[600px] overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {/* Project Details */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h3 className="mb-4 text-sm font-medium text-white/80">Project Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-white/60">Project Title</p>
                          <p className="mt-1 text-base font-medium text-white">{booking.project_title}</p>
                        </div>

                        {booking.listing_title && (
                          <div>
                            <p className="text-sm text-white/60">Service/Product</p>
                            <p className="mt-1 text-base text-white">{booking.listing_title}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-white">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                          <span className="text-lg font-semibold">
                            {booking.currency} {booking.amount.toFixed(2)}
                          </span>
                        </div>

                        {booking.preferred_date && (
                          <div className="flex items-start gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm text-white/60">Preferred Date</p>
                              <p className="text-white">
                                {new Date(booking.preferred_date).toLocaleString('en-US', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.location && (
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-sm text-white/60">Location</p>
                              <p className="text-white">{booking.location}</p>
                            </div>
                          </div>
                        )}

                        {booking.additional_notes && (
                          <div className="flex items-start gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-yellow-400" />
                            <div className="flex-1">
                              <p className="text-sm text-white/60">Additional Notes</p>
                              <p className="mt-1 text-white">{booking.additional_notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h3 className="mb-4 text-sm font-medium text-white/80">Client Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="h-5 w-5 text-white/60" />
                          <span className="text-white">{booking.client_name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-5 w-5 text-white/60" />
                          <a
                            href={`mailto:${booking.client_email}`}
                            className="text-blue-400 hover:underline"
                          >
                            {booking.client_email}
                          </a>
                        </div>

                        {booking.client_phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-5 w-5 text-white/60" />
                            <a
                              href={`tel:${booking.client_phone}`}
                              className="text-blue-400 hover:underline"
                            >
                              {booking.client_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Provider Response Section (Show if confirmed/cancelled or for pending) */}
                    {(isPending || booking.provider_response) && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <h3 className="mb-3 text-sm font-medium text-white/80">
                          {isPending ? 'Your Response' : 'Provider Response'}
                        </h3>
                        {isPending ? (
                          <textarea
                            value={providerResponse}
                            onChange={(e) => setProviderResponse(e.target.value)}
                            placeholder="Add a message to the client (optional for accepting, required for rejecting)..."
                            rows={4}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-white">
                            {booking.provider_response || 'No response provided'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Action Buttons */}
                {isPending && (
                  <div className="border-t border-white/10 bg-white/5 px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && actionType === 'reject' ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5" />
                            <span>Reject Booking</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction('accept')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 font-medium text-green-400 transition-all hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && actionType === 'accept' ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Accept Booking</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer - Info for non-pending bookings */}
                {!isPending && (
                  <div className="border-t border-white/10 bg-white/5 px-6 py-4">
                    <p className="text-center text-sm text-white/60">
                      {isConfirmed
                        ? 'This booking has been confirmed. Mark as completed when the service is finished.'
                        : booking.status === 'completed'
                        ? 'This booking has been completed.'
                        : 'This booking has been cancelled.'}
                    </p>
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
