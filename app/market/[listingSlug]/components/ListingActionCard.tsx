'use client';

import { useState } from 'react';
import { UserIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PurchaseModal from './PurchaseModal';

interface ListingActionCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    listing_type?: 'service' | 'product';
    stock_quantity?: number | null;
  };
}

/**
 * ListingActionCard Component
 * 
 * Conditional component that displays different CTAs based on listing type:
 * - SERVICE: Booking form with date/time selection
 * - PRODUCT: "Buy Now" button that opens purchase modal
 * 
 * This implements the core products vs services differentiation.
 * 
 * Features:
 * - Automatic type detection (defaults to 'service' for backward compatibility)
 * - Stock availability check for products
 * - Modal-based purchase flow for products
 * - Form-based booking request for services
 * 
 * Usage:
 * <ListingActionCard listing={{ id, title, price, currency, listing_type, stock_quantity }} />
 */
export default function ListingActionCard({ listing }: ListingActionCardProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Service booking form state
  const [projectTitle, setProjectTitle] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // UI state for booking
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [bookingError, setBookingError] = useState('');
  
  // Determine listing type (default to 'service' for backward compatibility)
  const isProduct = listing.listing_type === 'product';
  const isService = !isProduct; // Default to service if not explicitly set
  
  // Check stock availability for products
  const isOutOfStock = isProduct && listing.stock_quantity !== null && listing.stock_quantity !== undefined && listing.stock_quantity <= 0;

  // ============================================================================
  // SERVICE BOOKING - Submit Handler
  // ============================================================================
  
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setBookingError('');
    setBookingSuccess(false);
    
    // Validation
    if (!projectTitle.trim()) {
      setBookingError('Please enter a project title');
      return;
    }
    
    if (!clientEmail.trim()) {
      setBookingError('Please enter your email for booking confirmation');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      setBookingError('Please enter a valid email address');
      return;
    }
    
    setIsSubmittingBooking(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listing.id,
          project_title: projectTitle,
          preferred_date: preferredDate || null,
          location: null, // Can add location field later
          additional_notes: additionalNotes || null,
          client_name: clientName || null,
          client_email: clientEmail,
          client_phone: clientPhone || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      // Success!
      setBookingSuccess(true);
      setBookingReference(data.booking_reference);
      
      // Reset form
      setProjectTitle('');
      setPreferredDate('');
      setAdditionalNotes('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit booking. Please try again.'
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // ============================================================================
  // PRODUCT UI - Buy Now Button
  // ============================================================================
  
  if (isProduct) {
    return (
      <>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
          <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
            Ready to purchase?
          </h3>
          
          {/* Stock Status */}
          {listing.stock_quantity !== null && listing.stock_quantity !== undefined && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/70">Stock:</span>
              <span className={`font-semibold ${
                isOutOfStock 
                  ? 'text-red-400' 
                  : (listing.stock_quantity ?? 0) < 10 
                    ? 'text-yellow-400' 
                    : 'text-green-400'
              }`}>
                {isOutOfStock 
                  ? 'Out of Stock' 
                  : `${listing.stock_quantity} available`
                }
              </span>
            </div>
          )}
          
          <p className="mt-2 text-sm text-white/70">
            {isOutOfStock 
              ? 'This product is currently out of stock. Check back soon!'
              : 'Complete your purchase with just a few details. No account required.'
            }
          </p>
          
          {/* Buy Now Button */}
          <button
            type="button"
            onClick={() => setShowPurchaseModal(true)}
            disabled={isOutOfStock}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-gradient-to-r from-orange-500/80 to-red-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          </button>
          
          <p className="mt-2 text-[11px] text-white/50">
            You&apos;ll receive a tracking ID after purchase. No account required.
          </p>
        </div>
        
        {/* Purchase Modal */}
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            price: listing.price,
            currency: listing.currency,
            stock_quantity: listing.stock_quantity,
          }}
        />
      </>
    );
  }

  // ============================================================================
  // SERVICE UI - Booking Request Form
  // ============================================================================
  
  // Show success message if booking was created
  if (bookingSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 shadow-xl backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-100">
              Booking Request Submitted!
            </h3>
            <p className="mt-2 text-sm text-emerald-200/80">
              Your booking reference is:
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-100">
              {bookingReference}
            </p>
            <p className="mt-3 text-xs text-emerald-200/70">
              The provider will review your request and confirm within a few hours. 
              We&apos;ve sent a confirmation email to <span className="font-semibold">{clientEmail}</span>.
            </p>
            <button
              type="button"
              onClick={() => setBookingSuccess(false)}
              className="mt-4 text-xs text-emerald-200/80 underline hover:text-emerald-100"
            >
              Submit another booking
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmitBooking} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
      <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
        Ready to book?
      </h3>
      <p className="mt-2 text-sm text-white/70">
        Share your preferred date and project details. The provider will confirm within a few hours.
      </p>
      
      {/* Error Message */}
      {bookingError && (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2">
          <p className="text-xs text-red-200">{bookingError}</p>
        </div>
      )}
      
      <div className="mt-4 space-y-3 text-sm text-white/70">
        {/* Project Title */}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">
            Project title <span className="text-red-400">*</span>
          </span>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Deep clean before moving"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
          />
        </label>
        
        {/* Preferred Date */}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Preferred date</span>
          <input
            type="datetime-local"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
          />
        </label>
        
        {/* Additional Notes */}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Additional notes</span>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
            placeholder="Tell us anything important about your project."
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none resize-none"
          />
        </label>
        
        {/* Contact Information */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Contact information</p>
          
          <div className="space-y-2">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
            />
            
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Your email *"
              required
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
            />
            
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Your phone (optional)"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmittingBooking}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserIcon className="h-4 w-4" />
        {isSubmittingBooking ? 'Submitting...' : 'Submit booking request'}
      </button>
      
      <p className="mt-2 text-[11px] text-white/50">
        No payment required yet. You&apos;ll finalize the booking once the provider confirms availability.
      </p>
    </form>
  );
}
