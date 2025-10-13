/**
 * Local Storage Utility for Order Tracking
 * 
 * Manages tracking IDs for anonymous users in browser localStorage.
 * Stores recent purchases to allow quick access to order tracking.
 * 
 * Features:
 * - Store tracking IDs with purchase metadata
 * - Retrieve recent orders
 * - Auto-cleanup old orders (30 days)
 * - Check for active orders
 */

interface StoredOrder {
  trackingId: string;
  productTitle: string;
  totalAmount: number;
  currency: string;
  purchaseDate: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

const STORAGE_KEY = 'bmc_tracking_orders';
const MAX_AGE_DAYS = 30;

/**
 * Save a new tracking ID to localStorage
 */
export function saveTrackingId(order: Omit<StoredOrder, 'purchaseDate' | 'status'>): void {
  try {
    const orders = getStoredOrders();
    
    // Add new order
    const newOrder: StoredOrder = {
      ...order,
      purchaseDate: new Date().toISOString(),
      status: 'PENDING',
    };
    
    // Add to beginning of array (most recent first)
    orders.unshift(newOrder);
    
    // Keep only last 10 orders
    const trimmedOrders = orders.slice(0, 10);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedOrders));
  } catch (error) {
    console.error('Failed to save tracking ID:', error);
  }
}

/**
 * Get all stored orders from localStorage
 */
export function getStoredOrders(): StoredOrder[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const orders: StoredOrder[] = JSON.parse(stored);
    
    // Filter out orders older than MAX_AGE_DAYS
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
    
    const validOrders = orders.filter(order => {
      const orderDate = new Date(order.purchaseDate);
      return orderDate > cutoffDate;
    });
    
    // Update localStorage if we filtered anything out
    if (validOrders.length !== orders.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validOrders));
    }
    
    return validOrders;
  } catch (error) {
    console.error('Failed to retrieve tracking IDs:', error);
    return [];
  }
}

/**
 * Update order status (useful when user checks tracking page)
 */
export function updateOrderStatus(trackingId: string, status: StoredOrder['status']): void {
  try {
    const orders = getStoredOrders();
    const updatedOrders = orders.map(order =>
      order.trackingId === trackingId ? { ...order, status } : order
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Failed to update order status:', error);
  }
}

/**
 * Get count of active orders (not delivered or cancelled)
 */
export function getActiveOrderCount(): number {
  try {
    const orders = getStoredOrders();
    return orders.filter(order => 
      order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
    ).length;
  } catch (error) {
    console.error('Failed to get active order count:', error);
    return 0;
  }
}

/**
 * Remove a specific tracking ID
 */
export function removeTrackingId(trackingId: string): void {
  try {
    const orders = getStoredOrders();
    const updatedOrders = orders.filter(order => order.trackingId !== trackingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Failed to remove tracking ID:', error);
  }
}

/**
 * Clear all stored tracking IDs
 */
export function clearAllTrackingIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tracking IDs:', error);
  }
}
