'use client';

import { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { getStoredOrders, getActiveOrderCount } from '@/lib/trackingStorage';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface OrdersBadgeProps {
  onTrackOrder?: () => void;
}

interface Order {
  trackingId: string;
  productTitle: string;
  totalAmount: number;
  currency: string;
  purchaseDate: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

/**
 * OrdersBadge Component
 * 
 * Displays notification badge for active orders with dropdown menu.
 * Shows recent orders based on authentication status:
 * - AUTHENTICATED: Fetch orders from database (user's email)
 * - ANONYMOUS: Show orders from localStorage only
 * 
 * This ensures users only see their own orders when logged in.
 */
export default function OrdersBadge({ onTrackOrder }: OrdersBadgeProps) {
  const router = useRouter();
  const [activeCount, setActiveCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    // Fetch orders based on authentication status
    const updateCounts = async () => {
      setIsLoading(true);
      
      try {
        if (userEmail) {
          // AUTHENTICATED USER: Fetch from database by email
          const response = await fetch(`/api/purchase/recent?email=${encodeURIComponent(userEmail)}&limit=10`);
          
          if (response.ok) {
            const data = await response.json();
            const dbOrders: Order[] = data.orders || [];
            
            // Calculate active count (not delivered/cancelled)
            const activeOrders = dbOrders.filter(order => 
              order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
            );
            
            setRecentOrders(dbOrders);
            setActiveCount(activeOrders.length);
          } else {
            // Fallback to empty
            setRecentOrders([]);
            setActiveCount(0);
          }
        } else {
          // ANONYMOUS USER: Use localStorage only
          const localOrders = getStoredOrders();
          const activeOrders = localOrders.filter(order => 
            order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
          );
          
          setRecentOrders(localOrders);
          setActiveCount(activeOrders.length);
        }
        
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Fallback to localStorage only
        const localOrders = getStoredOrders();
        setRecentOrders(localOrders);
        setActiveCount(getActiveOrderCount());
      } finally {
        setIsLoading(false);
      }
    };

    // Only run if we've checked auth status
    if (userEmail !== null || typeof window !== 'undefined') {
      updateCounts();
    }

    // Listen for storage changes (for anonymous users)
    window.addEventListener('storage', updateCounts);
    
    // Listen for custom event when order is added
    window.addEventListener('orderAdded', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('orderAdded', updateCounts);
    };
  }, [userEmail]);

  const handleOrderClick = (trackingId: string) => {
    router.push(`/track/${trackingId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-400';
      case 'SHIPPED':
        return 'text-blue-400';
      case 'PROCESSING':
        return 'text-yellow-400';
      case 'CANCELLED':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
        <ShoppingBagIcon className="h-6 w-6 text-white" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[10px] font-bold text-white shadow-lg">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right rounded-2xl bg-[#0a1532] border border-white/10 backdrop-blur-2xl shadow-2xl focus:outline-none overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            {activeCount > 0 && (
              <p className="text-xs text-white/60 mt-0.5">
                {activeCount} active {activeCount === 1 ? 'order' : 'orders'}
              </p>
            )}
          </div>

          {/* Orders List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-white/60">Loading orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ShoppingBagIcon className="h-12 w-12 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/60">No recent orders</p>
                <p className="text-xs text-white/40 mt-1">
                  Your order history will appear here
                </p>
              </div>
            ) : (
              <div className="py-2">
                {recentOrders.map((order) => (
                  <Menu.Item key={order.trackingId}>
                    {({ active }) => (
                      <button
                        onClick={() => handleOrderClick(order.trackingId)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          active ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {order.productTitle}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5 font-mono">
                              {order.trackingId}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-white/40">
                                {formatDate(order.purchaseDate)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">
                              {formatCurrency(order.totalAmount, order.currency)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/5">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onTrackOrder}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium text-white transition-colors ${
                    active ? 'bg-white/10' : 'bg-white/5'
                  }`}
                >
                  Track Another Order
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
