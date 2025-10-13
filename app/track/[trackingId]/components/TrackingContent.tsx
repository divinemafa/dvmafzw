'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentIcon, 
  CheckIcon, 
  TruckIcon, 
  ShoppingBagIcon,
  CreditCardIcon,
  CogIcon,
  MapPinIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TimelineStep {
  status: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
}

interface Purchase {
  id: string;
  trackingId: string;
  status: string;
  paymentStatus: string;
  listing: {
    title: string;
    price: number;
    currency: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  deliveryAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  deliveryNotes?: string;
  courierTrackingNumber?: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  timeline: TimelineStep[];
  currentStep: number;
}

interface TrackingContentProps {
  trackingId: string;
}

/**
 * TrackingContent Component
 * 
 * Client component that fetches and displays order tracking information.
 * Separated from page.tsx to allow client-side data fetching while keeping
 * the page component as a server component for better SEO.
 * 
 * Features:
 * - Real-time status fetching
 * - Timeline visualization with progress indicator
 * - Copy tracking ID to clipboard
 * - Display delivery address and order details
 * - Error handling for invalid tracking IDs
 * - Refresh button for status updates
 */
export default function TrackingContent({ trackingId }: TrackingContentProps) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ============================================================================
  // FETCH PURCHASE DATA
  // ============================================================================

  const fetchPurchase = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/purchase/${trackingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order details');
      }

      setPurchase(data.purchase);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trackingId]);

  useEffect(() => {
    fetchPurchase();
  }, [fetchPurchase]);

  // ============================================================================
  // REFRESH HANDLER
  // ============================================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPurchase();
  };

  // ============================================================================
  // COPY TRACKING ID
  // ============================================================================

  const handleCopyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tracking ID:', err);
    }
  };

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleGoBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to profile tracking page
      router.push('/profile?section=tracking');
    }
  };

  // ============================================================================
  // ORDER ACTIONS
  // ============================================================================

  const handleCancelOrder = async () => {
    if (!purchase) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/purchase/${trackingId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel order');
      }

      // Refresh purchase data
      await fetchPurchase();
      setShowCancelConfirm(false);
      alert('Order cancelled successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactSeller = () => {
    const subject = encodeURIComponent(`Inquiry about Order ${trackingId}`);
    const body = encodeURIComponent(`Hi,\n\nI have a question about my order:\n\nTracking ID: ${trackingId}\nProduct: ${purchase?.listing.title}\n\nMy question:\n\n`);
    window.location.href = `mailto:support@bitcoinmascot.com?subject=${subject}&body=${body}`;
  };

  const handleReorder = () => {
    if (!purchase) return;
    // Navigate to the product page
    router.push(`/market?search=${encodeURIComponent(purchase.listing.title)}`);
  };

  // ============================================================================
  // STATUS ICON MAPPING
  // ============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ShoppingBagIcon className="h-6 w-6" />;
      case 'PAID':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'PROCESSING':
        return <CogIcon className="h-6 w-6" />;
      case 'SHIPPED':
        return <TruckIcon className="h-6 w-6" />;
      case 'DELIVERED':
        return <MapPinIcon className="h-6 w-6" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-6 w-6" />;
      default:
        return <ShoppingBagIcon className="h-6 w-6" />;
    }
  };

  // ============================================================================
  // FORMAT DATE
  // ============================================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pending';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !purchase) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mb-4">
          <XCircleIcon className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Order Not Found
        </h2>
        <p className="text-white/70 mb-6">
          {error || 'We could not find an order with this tracking ID.'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-colors shadow-lg"
        >
          Return to Marketplace
        </a>
      </div>
    );
  }

  // ============================================================================
  // SUCCESS STATE
  // ============================================================================

  return (
    <div className="space-y-6">
      
      {/* Tracking ID Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">
              Tracking ID
            </p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-mono font-bold text-orange-400">
                {trackingId}
              </p>
              <button
                onClick={handleCopyTrackingId}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Copy tracking ID"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="h-5 w-5 text-white/60 hover:text-white/90" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-white/10"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Order Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors border border-white/10"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go Back
          </button>

          {/* Contact Seller */}
          <button
            onClick={handleContactSeller}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Contact Seller
          </button>

          {/* Cancel Order (Only for PENDING/PAID status) */}
          {(purchase.status === 'PENDING' || purchase.status === 'PAID') && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
              Cancel Order
            </button>
          )}

          {/* Reorder (Only for DELIVERED status) */}
          {purchase.status === 'DELIVERED' && (
            <button
              onClick={handleReorder}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Reorder
            </button>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="mt-4 p-4 border border-red-500/30 bg-red-500/10 rounded-xl">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Cancel Order?</h3>
                <p className="text-sm text-white/70 mb-4">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelling}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Status Timeline */}
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Order Status</h2>
        
        <div className="space-y-6">
          {purchase.timeline.map((step, index) => (
            <div key={step.status} className="relative">
              {/* Vertical Line */}
              {index < purchase.timeline.length - 1 && (
                <div
                  className={`absolute left-6 top-14 w-0.5 h-14 ${
                    step.completed
                      ? 'bg-orange-400'
                      : 'bg-white/20'
                  }`}
                />
              )}
              
              {/* Timeline Item */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                    step.completed
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {getStatusIcon(step.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold ${
                        step.completed
                          ? 'text-white'
                          : 'text-white/40'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.completed && step.timestamp && (
                      <span className="text-sm text-white/60">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  {/* Current Status Indicator */}
                  {index === purchase.currentStep && (
                    <p className="text-sm text-orange-400 font-medium mt-1">
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Courier Tracking */}
        {purchase.courierTrackingNumber && (
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
            <p className="text-sm font-medium text-blue-300 mb-2 uppercase tracking-wider">
              Courier Tracking Number
            </p>
            <p className="text-lg font-mono font-bold text-blue-400">
              {purchase.courierTrackingNumber}
            </p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Order Details</h2>
        
        <div className="space-y-4">
          {/* Product */}
          <div>
            <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Product</p>
            <p className="text-lg font-semibold text-white">
              {purchase.listing.title}
            </p>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Quantity</p>
              <p className="text-lg font-semibold text-white">
                {purchase.quantity}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Unit Price</p>
              <p className="text-lg font-semibold text-white">
                {purchase.currency} ${purchase.unitPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-white">Total Amount</p>
              <p className="text-2xl font-bold text-orange-400">
                {purchase.currency} ${purchase.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Delivery Information</h2>
        
        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Recipient</p>
            <p className="text-lg font-semibold text-white">
              {purchase.buyerName}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Email</p>
            <p className="text-lg font-semibold text-white">
              {purchase.buyerEmail}
            </p>
          </div>

          {/* Delivery Address */}
          <div>
            <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">
              Delivery Address
            </p>
            <div className="text-white">
              <p>{purchase.deliveryAddress.street}</p>
              <p>
                {purchase.deliveryAddress.city}, {purchase.deliveryAddress.province}{' '}
                {purchase.deliveryAddress.postalCode}
              </p>
              <p>{purchase.deliveryAddress.country}</p>
            </div>
          </div>

          {/* Delivery Notes */}
          {purchase.deliveryNotes && (
            <div>
              <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">
                Delivery Notes
              </p>
              <p className="text-white">
                {purchase.deliveryNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Need Help */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 text-center">
        <p className="text-white/70 mb-4">
          Need help with your order? Contact us at{' '}
          <a
            href="mailto:support@bitcoinmascot.com"
            className="text-orange-400 hover:text-orange-300 hover:underline font-medium transition-colors"
          >
            support@bitcoinmascot.com
          </a>
        </p>
        <p className="text-sm text-white/50">
          Include your tracking ID: <span className="font-mono font-bold text-orange-400">{trackingId}</span>
        </p>
      </div>
    </div>
  );
}
