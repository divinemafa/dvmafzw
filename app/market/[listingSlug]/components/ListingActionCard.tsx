'use client';

import { useState } from 'react';
import { UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
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
  
  // Determine listing type (default to 'service' for backward compatibility)
  const isProduct = listing.listing_type === 'product';
  const isService = !isProduct; // Default to service if not explicitly set
  
  // Check stock availability for products
  const isOutOfStock = isProduct && listing.stock_quantity !== null && listing.stock_quantity !== undefined && listing.stock_quantity <= 0;

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
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
      <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
        Ready to book?
      </h3>
      <p className="mt-2 text-sm text-white/70">
        Share your preferred date, location, and any project details. The provider will confirm within a few hours.
      </p>
      
      <div className="mt-4 space-y-2 text-sm text-white/70">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Project title</span>
          <input
            type="text"
            placeholder="e.g. Deep clean before moving"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Preferred date</span>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Additional notes</span>
          <textarea
            rows={3}
            placeholder="Tell us anything important about your project."
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
          />
        </label>
      </div>
      
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
      >
        <UserIcon className="h-4 w-4" />
        Submit booking request
      </button>
      
      <p className="mt-2 text-[11px] text-white/50">
        No payment required yet. You&apos;ll finalise the booking once the provider confirms availability.
      </p>
    </div>
  );
}
