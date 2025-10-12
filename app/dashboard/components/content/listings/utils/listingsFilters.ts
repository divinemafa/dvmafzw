import type { Listing, StatsData } from '../types';

/**
 * Calculate stats from listings array
 */
export const calculateListingStats = (listings: Listing[]): StatsData => {
  return {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    paused: listings.filter((l) => l.status === 'paused').length,
    draft: listings.filter((l) => l.status === 'draft').length,
  };
};

/**
 * Filter listings by search query
 */
export const filterBySearch = (listings: Listing[], query: string): Listing[] => {
  if (!query.trim()) return listings;

  const lowerQuery = query.toLowerCase();
  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(lowerQuery) || listing.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filter listings by categories
 */
export const filterByCategories = (listings: Listing[], categories: string[]): Listing[] => {
  if (categories.length === 0) return listings;
  return listings.filter((listing) => categories.includes(listing.category));
};

/**
 * Filter listings by price range
 */
export const filterByPriceRange = (listings: Listing[], minPrice: string, maxPrice: string): Listing[] => {
  const min = minPrice ? parseFloat(minPrice) : 0;
  const max = maxPrice ? parseFloat(maxPrice) : Infinity;

  return listings.filter((listing) => {
    const price = listing.price;
    return price >= min && price <= max;
  });
};

/**
 * Apply all filters to listings
 */
export const applyFilters = (
  listings: Listing[],
  searchQuery: string,
  selectedCategories: string[],
  minPrice: string,
  maxPrice: string
): Listing[] => {
  let filtered = listings;

  // Apply search filter
  filtered = filterBySearch(filtered, searchQuery);

  // Apply category filter
  filtered = filterByCategories(filtered, selectedCategories);

  // Apply price range filter
  filtered = filterByPriceRange(filtered, minPrice, maxPrice);

  return filtered;
};
