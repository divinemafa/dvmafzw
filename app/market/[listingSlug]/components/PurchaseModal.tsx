'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    stock_quantity?: number | null;
  };
}

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface PurchaseFormData {
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: DeliveryAddress;
  deliveryNotes: string;
}

/**
 * PurchaseModal Component
 * 
 * Anonymous purchase modal for product listings.
 * Collects buyer information and delivery details without requiring authentication.
 * 
 * Features:
 * - Real-time price calculation based on quantity
 * - Stock availability validation
 * - Email validation
 * - Tracking ID display with copy-to-clipboard
 * - Success state with order tracking link
 * 
 * Usage:
 * <PurchaseModal 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   listing={{ id: '...', title: 'Product Name', price: 99.99, currency: 'USD', stock_quantity: 50 }}
 * />
 */
export default function PurchaseModal({ isOpen, onClose, listing }: PurchaseModalProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [formData, setFormData] = useState<PurchaseFormData>({
    quantity: 1,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    deliveryAddress: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
    },
    deliveryNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof PurchaseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [field]: value },
    }));
    setError(null);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, formData.quantity + delta);
    const maxQuantity = listing.stock_quantity ?? 999;
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(newQuantity, maxQuantity),
    }));
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!formData.buyerName.trim()) return 'Please enter your name';
    if (!formData.buyerEmail.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) return 'Please enter a valid email';
    if (!formData.deliveryAddress.street.trim()) return 'Please enter street address';
    if (!formData.deliveryAddress.city.trim()) return 'Please enter city';
    if (!formData.deliveryAddress.postalCode.trim()) return 'Please enter postal code';
    return null;
  };

  // ============================================================================
  // PURCHASE SUBMISSION
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/purchase/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: formData.quantity,
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
          buyerPhone: formData.buyerPhone || null,
          deliveryAddress: formData.deliveryAddress,
          deliveryNotes: formData.deliveryNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase order');
      }

      // Success - show tracking ID
      setTrackingId(data.trackingId);

      // Save to localStorage for quick access
      if (typeof window !== 'undefined') {
        const { saveTrackingId } = await import('@/lib/trackingStorage');
        saveTrackingId({
          trackingId: data.trackingId,
          productTitle: listing.title,
          totalAmount: totalAmount,
          currency: listing.currency,
        });

        // Dispatch custom event to update badge
        window.dispatchEvent(new Event('orderAdded'));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // COPY TRACKING ID
  // ============================================================================

  const handleCopyTrackingId = async () => {
    if (!trackingId) return;
    
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tracking ID:', err);
    }
  };

  // ============================================================================
  // RESET & CLOSE
  // ============================================================================

  const handleClose = () => {
    setFormData({
      quantity: 1,
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      deliveryAddress: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada',
      },
      deliveryNotes: '',
    });
    setError(null);
    setTrackingId(null);
    setCopied(false);
    onClose();
  };

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const totalAmount = listing.price * formData.quantity;

  // ============================================================================
  // RENDER
  // ============================================================================

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#0a1532] border border-white/10 shadow-2xl backdrop-blur-2xl transition-all">
                
                {/* SUCCESS STATE - Tracking ID Display */}
                {trackingId ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-6">
                      <CheckIcon className="h-8 w-8 text-green-400" />
                    </div>
                    
                    <Dialog.Title className="text-2xl font-bold text-white mb-2">
                      Order Placed Successfully!
                    </Dialog.Title>
                    
                    <p className="text-white/70 mb-6">
                      Your order has been created. Save your tracking ID to check order status.
                    </p>

                    {/* Tracking ID Display */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <p className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">
                        Your Tracking ID
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-3xl font-mono font-bold text-orange-400">
                          {trackingId}
                        </p>
                        <button
                          onClick={handleCopyTrackingId}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Copy tracking ID"
                        >
                          {copied ? (
                            <CheckIcon className="h-6 w-6 text-green-400" />
                          ) : (
                            <ClipboardDocumentIcon className="h-6 w-6 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={`/track/${trackingId}`}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-colors shadow-lg"
                      >
                        Track Order
                      </a>
                      <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
                      >
                        Close
                      </button>
                    </div>

                    <p className="text-xs text-white/50 mt-6">
                      A confirmation email has been sent to {formData.buyerEmail}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* FORM STATE - Purchase Form */}
                    
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <ShoppingCartIcon className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <Dialog.Title className="text-xl font-bold text-white">
                            Complete Purchase
                          </Dialog.Title>
                          <p className="text-sm text-white/60">
                            {listing.title}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5 text-white/60" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      
                      {/* Error Message */}
                      {error && (
                        <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                          <p className="text-sm text-red-300">{error}</p>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                          Quantity
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={formData.quantity <= 1}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-white/10"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={listing.stock_quantity ?? 999}
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-4 py-2 text-center bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            disabled={listing.stock_quantity ? formData.quantity >= listing.stock_quantity : false}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-white/10"
                          >
                            +
                          </button>
                          {listing.stock_quantity && (
                            <span className="text-sm text-white/50">
                              {listing.stock_quantity} available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.buyerName}
                            onChange={(e) => handleInputChange('buyerName', e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.buyerEmail}
                            onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={formData.buyerPhone}
                            onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Delivery Address</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="123 Main St, Apt 4B"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.deliveryAddress.city}
                              onChange={(e) => handleAddressChange('city', e.target.value)}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Toronto"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                              Province *
                            </label>
                            <input
                              type="text"
                              value={formData.deliveryAddress.province}
                              onChange={(e) => handleAddressChange('province', e.target.value)}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="ON"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              value={formData.deliveryAddress.postalCode}
                              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="M5H 2N2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                              Country *
                            </label>
                            <input
                              type="text"
                              value={formData.deliveryAddress.country}
                              onChange={(e) => handleAddressChange('country', e.target.value)}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Canada"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
                            Delivery Notes (Optional)
                          </label>
                          <textarea
                            value={formData.deliveryNotes}
                            onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            placeholder="Special instructions for delivery..."
                          />
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Unit Price</span>
                            <span className="text-white font-medium">
                              {listing.currency} ${listing.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Quantity</span>
                            <span className="text-white font-medium">
                              {formData.quantity}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-lg font-bold text-white">Total</span>
                              <span className="text-lg font-bold text-orange-400">
                                {listing.currency} ${totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors border border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg"
                        >
                          {isSubmitting ? 'Processing...' : `Place Order - ${listing.currency} $${totalAmount.toFixed(2)}`}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
