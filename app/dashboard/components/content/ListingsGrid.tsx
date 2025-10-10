import { PlusCircleIcon, FunnelIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import type { Listing } from '@/app/dashboard/types';
import { ListingCard } from './ListingCard';
import { ListingListItem } from './ListingListItem';

interface ListingsGridProps {
  listings?: Listing[];
}

export const ListingsGrid = ({ listings = [] }: ListingsGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const normalizedListings = useMemo(() => listings ?? [], [listings]);

  // Filter listings based on search and status
  const filteredListings = normalizedListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: normalizedListings.length,
    active: normalizedListings.filter(l => l.status === 'active').length,
    paused: normalizedListings.filter(l => l.status === 'paused').length,
    draft: normalizedListings.filter(l => l.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">My Listings</h2>
            <p className="mt-1 text-sm text-white/60">Manage your services and content</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-gradient-to-r from-[#BD24DF] to-[#2D6ADE] px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:from-[#d040f5] hover:to-[#4080ff] hover:shadow-xl">
            <PlusCircleIcon className="h-5 w-5" />
            Create New Listing
          </button>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Total Listings</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-emerald-400/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">Active</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-3 backdrop-blur-xl transition hover:border-yellow-400/30 hover:bg-yellow-400/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-300">Paused</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.paused}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Draft</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.draft}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search listings by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-xl transition focus:border-white/30 focus:bg-white/10 focus:outline-none"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-3 py-2 transition ${
              viewMode === 'grid'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white'
            }`}
            title="Grid View"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md px-3 py-2 transition ${
              viewMode === 'list'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white'
            }`}
            title="List View"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-white/60" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold backdrop-blur-sm transition ${
                filterStatus === 'all'
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold backdrop-blur-sm transition ${
                filterStatus === 'active'
                  ? 'border-emerald-400/30 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-emerald-400/20 hover:bg-emerald-400/10'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('paused')}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold backdrop-blur-sm transition ${
                filterStatus === 'paused'
                  ? 'border-yellow-400/30 bg-yellow-400/20 text-yellow-300'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-yellow-400/20 hover:bg-yellow-400/10'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold backdrop-blur-sm transition ${
                filterStatus === 'draft'
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-sm text-white/60">
          Showing <span className="font-semibold text-white">{filteredListings.length}</span> of{' '}
          <span className="font-semibold text-white">{normalizedListings.length}</span> listings
        </p>
      </div>

      {/* Listings Display */}
      {filteredListings.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredListings.map((listing) => (
              <ListingListItem key={listing.id} listing={listing} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <MagnifyingGlassIcon className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="text-lg font-bold text-white">No listings found</h3>
          <p className="mt-2 text-sm text-white/60">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first listing to get started'}
          </p>
        </div>
      )}
    </div>
  );
};
