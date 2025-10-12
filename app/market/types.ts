/**
 * Marketplace Types
 * Shared type definitions for marketplace components
 */

export type StatusTone = 'emerald' | 'sky' | 'amber' | 'violet';

/**
 * Legacy MarketplaceListing interface (from mock data)
 * @deprecated Use MarketplaceListing from hooks/useMarketplaceListings instead
 */
export interface MarketplaceListing {
  id: string;
  slug: string;
  title: string;
  creator: string;
  price: string;
  priceValue: number;
  location: string;
  verified: boolean;
  status: string;
  badgeTone: StatusTone;
  category: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  features: string[];
  availability: string;
  rating: number;
  reviews: number;
  responseTime: string;
  tags: string[];
}
