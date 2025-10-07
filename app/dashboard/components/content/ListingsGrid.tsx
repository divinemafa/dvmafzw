import { PlusCircleIcon } from '@heroicons/react/24/outline';
import type { Listing } from '../../types';
import { ListingCard } from './ListingCard';

interface ListingsGridProps {
  listings: Listing[];
}

export const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Listings</h2>
          <p className="text-sm text-white/60">Manage your services and content</p>
        </div>
        <button className="rounded-lg border border-white/15 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600">
          <PlusCircleIcon className="mr-2 inline-block h-5 w-5" />
          Create New Listing
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};
