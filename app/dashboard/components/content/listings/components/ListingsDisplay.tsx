import { ListingCard } from '../../ListingCard';
import { ListingListItem } from '../../ListingListItem';
import type { Listing, ViewMode } from '../types';

interface ListingsDisplayProps {
  listings: Listing[];
  viewMode: ViewMode;
}

export const ListingsDisplay = ({ listings, viewMode }: ListingsDisplayProps) => {
  // Empty state
  if (listings.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center">
          <p className="text-lg font-semibold text-white">No listings found</p>
          <p className="mt-2 text-sm text-white/60">
            Try adjusting your filters or create a new listing to get started.
          </p>
        </div>
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <ListingListItem key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
