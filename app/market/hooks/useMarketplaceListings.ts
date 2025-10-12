'use client';

import { useCallback, useEffect, useState } from 'react';
import { resolveImageUrl } from '@/lib/utils/ipfs';

/**
 * Provider info structure (from database join)
 */
export interface Provider {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  verification_level: number;
}

/**
 * Marketplace listing structure (UI format)
 * This is what components will consume
 */
export interface MarketplaceListing {
  id: string;
  slug: string;
  title: string;
  
  // Provider data (clickable to profile)
  provider: Provider;
  
  // Pricing
  price: string;           // Formatted display: "500 ZAR"
  priceValue: number;      // Raw number for sorting
  
  // Location & availability
  location: string;
  availability: string;
  
  // Status & badges
  verified: boolean;
  status: string;          // Display status: "Verified", "Premium", etc.
  badgeTone: 'emerald' | 'sky' | 'amber' | 'violet';
  
  // Content
  category: string;
  shortDescription: string;
  longDescription: string;
  
  // Media (IPFS-ready)
  image: string;           // Resolved to HTTP gateway URL
  features: string[];
  
  // Metrics
  rating: number;
  reviews: number;
  responseTime: string;
  tags: string[];
  views: number;
  
  // Timestamps
  createdAt: string;
}

/**
 * Pagination metadata from API
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Hook options
 */
interface UseMarketplaceListingsOptions {
  initialPage?: number;
  limit?: number;
  category?: string;
  sort?: 'newest' | 'popular' | 'price_low' | 'price_high';
  search?: string;
}

/**
 * useMarketplaceListings Hook
 * 
 * Fetches marketplace listings with pagination, search, and sorting.
 * Supports infinite scroll with "Load More" functionality.
 * 
 * Features:
 * - Initial fetch with loading state
 * - Infinite scroll / "Load More"
 * - Search and filter support
 * - IPFS image URL resolution
 * - Provider data for clickable links
 * 
 * Usage:
 * ```tsx
 * const { listings, isLoading, loadMore, pagination } = useMarketplaceListings();
 * ```
 */
export function useMarketplaceListings(options: UseMarketplaceListingsOptions = {}) {
  const {
    initialPage = 1,
    limit = 20,
    category,
    sort = 'newest',
    search,
  } = options;

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch listings from API
   * @param page - Page number to fetch
   * @param append - Whether to append to existing listings or replace
   */
  const fetchListings = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        status: 'active',
        page: page.toString(),
        limit: limit.toString(),
        sort: sort,
      });
      
      if (category) {
        params.append('category', category);
      }
      
      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch listings');
      }
      
      // Transform database listings to UI format
      const transformed: MarketplaceListing[] = data.listings.map((listing: any) => ({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        
        // Provider data (from JOIN)
        provider: {
          id: listing.provider?.id || '',
          username: listing.provider?.username || `user-${listing.provider?.id?.slice(0, 8) || 'unknown'}`,
          display_name: listing.provider?.display_name || 'Anonymous Provider',
          avatar_url: listing.provider?.avatar_url || null,
          rating: parseFloat(listing.provider?.rating) || 0,
          total_reviews: listing.provider?.total_reviews || 0,
          is_verified: listing.provider?.is_verified || false,
          verification_level: listing.provider?.verification_level || 0,
        },
        
        // Pricing
        price: listing.price_display || `${listing.price} ${listing.currency || 'ZAR'}`,
        priceValue: parseFloat(listing.price) || 0,
        
        // Location & availability
        location: listing.location || 'Location not specified',
        availability: listing.availability || 'Contact for availability',
        
        // Status & badges
        verified: listing.verified || false,
        status: getStatusLabel(listing.verified, listing.badge_tone),
        badgeTone: (listing.badge_tone as 'emerald' | 'sky' | 'amber' | 'violet') || 'emerald',
        
        // Content
        category: listing.category || 'General Services',
        shortDescription: listing.short_description || '',
        longDescription: listing.long_description || '',
        
        // Media (IPFS-ready: resolve URLs to HTTP gateways)
        image: resolveImageUrl(listing.image_url),
        features: Array.isArray(listing.features) ? listing.features : [],
        
        // Metrics
        rating: parseFloat(listing.rating) || 0,
        reviews: listing.reviews_count || 0,
        responseTime: listing.response_time || '24 hours',
        tags: Array.isArray(listing.tags) ? listing.tags : [],
        views: listing.views || 0,
        
        // Timestamps
        createdAt: listing.created_at,
      }));

      // Update listings (append or replace)
      if (append) {
        setListings(prev => [...prev, ...transformed]);
      } else {
        setListings(transformed);
      }
      
      // Update pagination metadata
      setPagination(data.pagination);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Don't clear listings if appending (preserve existing data)
      if (!append) {
        setListings([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [limit, category, sort, search]);

  /**
   * Initial fetch on mount or when dependencies change
   */
  useEffect(() => {
    fetchListings(initialPage, false);
  }, [fetchListings, initialPage]);

  /**
   * Load next page (for "Load More" button or infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (!pagination || !pagination.hasMore || isLoadingMore) {
      return;
    }
    
    fetchListings(pagination.page + 1, true);
  }, [pagination, isLoadingMore, fetchListings]);

  /**
   * Refetch from beginning (for refresh or filter changes)
   */
  const refetch = useCallback(() => {
    fetchListings(1, false);
  }, [fetchListings]);

  return { 
    listings, 
    pagination,
    isLoading, 
    isLoadingMore,
    error, 
    loadMore,
    refetch,
  };
}

/**
 * Helper: Convert badge_tone + verified to human-readable status
 */
function getStatusLabel(verified: boolean, badgeTone: string): string {
  if (verified && badgeTone === 'emerald') return 'Verified';
  if (badgeTone === 'sky') return 'Premium';
  if (badgeTone === 'violet') return 'Trending';
  if (badgeTone === 'amber') return 'New';
  return 'Active';
}
