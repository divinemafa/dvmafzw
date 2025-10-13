/**
 * Tracking Section - User's Purchase Orders
 * 
 * Displays all orders placed by the user (purchases they made, not orders received in their business).
 * Shows tracking details, order status, and allows clicking to view full tracking page.
 * 
 * Features:
 * - Fetches orders from database filtered by user's email
 * - Displays order status with color-coded indicators
 * - Shows product details, tracking ID, and total amount
 * - Click to navigate to full tracking page
 * - Empty state when no orders exist
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Order {
  trackingId: string;
  productTitle: string;
  totalAmount: number;
  currency: string;
  purchaseDate: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  quantity?: number;
}

interface TrackingSectionProps {
  userEmail: string;
}

export function TrackingSection({ userEmail }: TrackingSectionProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/purchase/recent?email=${encodeURIComponent(userEmail)}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderClick = (trackingId: string) => {
    router.push(`/track/${trackingId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'SHIPPED':
        return <TruckIcon className="h-5 w-5 text-blue-400" />;
      case 'PROCESSING':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-400 animate-spin" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-white/60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'SHIPPED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PROCESSING':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'CANCELLED':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        <h2 className="mb-6 text-2xl font-bold text-white">My Orders</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-white/60">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">My Orders</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <h2 className="mb-6 text-2xl font-bold text-white">My Orders</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingBagIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
            <p className="text-white/60 mb-6 max-w-md">
              You haven&apos;t placed any orders yet. Browse our marketplace to find products and services.
            </p>
            <button
              onClick={() => router.push('/market')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Orders List
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">My Orders</h2>
            <p className="mt-1 text-sm text-white/60">
              Track and manage your purchase orders
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{orders.length}</p>
            <p className="text-sm text-white/60">Total Orders</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {orders.map((order) => (
          <button
            key={order.trackingId}
            onClick={() => handleOrderClick(order.trackingId)}
            className="group w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left Side: Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(order.status).split(' ')[1]} ${getStatusColor(order.status).split(' ')[2]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {order.productTitle}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-mono text-white/50">
                        {order.trackingId}
                      </p>
                      <span className="text-white/30">•</span>
                      <p className="text-sm text-white/50">
                        {formatDate(order.purchaseDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  {order.quantity && order.quantity > 1 && (
                    <span className="text-xs text-white/50">
                      Qty: {order.quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Amount & Action */}
              <div className="text-right flex flex-col items-end gap-3">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">Total Amount</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-400 font-medium group-hover:text-orange-300 transition-colors">
                  <span>View Details</span>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
