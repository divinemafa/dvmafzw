'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TrackingModal Component
 * 
 * Modal for entering tracking ID to view order status.
 * Validates tracking ID format (BMC-XXXXXX) before navigation.
 */
export default function TrackingModal({ isOpen, onClose }: TrackingModalProps) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateTrackingId = (id: string): boolean => {
    // BMC-XXXXXX format (6 alphanumeric characters)
    const regex = /^BMC-[A-Z0-9]{6}$/;
    return regex.test(id.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedId = trackingId.trim().toUpperCase();

    if (!normalizedId) {
      setError('Please enter a tracking ID');
      return;
    }

    if (!validateTrackingId(normalizedId)) {
      setError('Invalid tracking ID format. Should be BMC-XXXXXX');
      return;
    }

    setIsLoading(true);

    try {
      // Verify tracking ID exists before navigating
      const response = await fetch(`/api/purchase/${normalizedId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Tracking ID not found. Please check and try again.');
        } else {
          setError('Failed to verify tracking ID. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Navigate to tracking page
      router.push(`/track/${normalizedId}`);
      onClose();
      setTrackingId('');
    } catch (err) {
      console.error('Tracking ID verification error:', err);
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTrackingId('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0a1532] border border-white/10 backdrop-blur-2xl shadow-2xl transition-all">
                {/* Header */}
                <div className="relative border-b border-white/10 p-6">
                  <Dialog.Title className="text-xl font-bold text-white">
                    Track Your Order
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <p className="mt-2 text-sm text-white/60">
                    Enter your tracking ID to view order status
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Tracking ID Input */}
                  <div>
                    <label htmlFor="trackingId" className="block text-sm font-medium text-white/80 mb-2">
                      Tracking ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-white/40" />
                      </div>
                      <input
                        type="text"
                        id="trackingId"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="BMC-XXXXXX"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-white/50">
                      Format: BMC-XXXXXX (e.g., BMC-A1B2C3)
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-orange-500/50 disabled:to-red-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Track Order'
                    )}
                  </button>

                  {/* Help Text */}
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-white/50 text-center">
                      Your tracking ID was sent to your email after purchase.
                      <br />
                      Can't find it? Check your spam folder.
                    </p>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
