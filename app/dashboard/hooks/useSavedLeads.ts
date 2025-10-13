/**
 * useSavedLeads Hook
 * 
 * Fetches pending booking requests (saved leads) for the current provider
 * Returns: top 3 bookings, total count, trend data, loading/error states
 */

import { useEffect, useState, useCallback } from 'react';
import type { Booking } from '../types';
import type { TrendDescriptor } from '../components/overview/tiles/shared/types';

interface SavedLeadsData {
  topBookings: Booking[];
  totalCount: number;
  trend: TrendDescriptor | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiTrend {
  currentWeek: number;
  previousWeek: number;
  direction: 'up' | 'down' | 'steady';
  label: string;
}

interface ApiResponse {
  topBookings: Array<{
    id: string;
    client: string;
    startDate: string | null;
    date: string | null;
    listingTitle: string;
    service: string;
    amount: number | null;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  totalCount: number;
  trend: ApiTrend | null;
}

export const useSavedLeads = (): SavedLeadsData => {
  const [topBookings, setTopBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [trend, setTrend] = useState<TrendDescriptor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/saved-leads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch saved leads: ${response.status}`
        );
      }

      const data: ApiResponse = await response.json();

      // Transform API response to component-friendly format
      const transformedBookings: Booking[] = data.topBookings.map((booking) => ({
        id: booking.id,
        client: booking.client,
        startDate: booking.startDate ?? undefined,
        date: booking.date ?? undefined,
        listingTitle: booking.listingTitle,
        service: booking.service,
        amount: booking.amount ?? undefined,
        currency: booking.currency,
        status: booking.status as Booking['status'],
        createdAt: booking.createdAt,
      }));

      // Transform trend data
      const transformedTrend: TrendDescriptor | null = data.trend
        ? {
            direction: data.trend.direction,
            label: data.trend.label,
          }
        : null;

      setTopBookings(transformedBookings);
      setTotalCount(data.totalCount);
      setTrend(transformedTrend);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching saved leads:', errorMessage);
      setError(errorMessage);
      
      // Set empty data on error
      setTopBookings([]);
      setTotalCount(0);
      setTrend(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedLeads();
  }, [fetchSavedLeads]);

  return {
    topBookings,
    totalCount,
    trend,
    loading,
    error,
    refetch: fetchSavedLeads,
  };
};
