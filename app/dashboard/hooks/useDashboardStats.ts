/**
 * useDashboardStats Hook
 * Fetches real-time dashboard statistics from the API
 */

import { useState, useEffect } from 'react';
import type { MarketplaceStats } from '../types';

export function useDashboardStats() {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
