'use client';

import { useMemo, useState } from 'react';
import type { Listing } from '@/app/dashboard/types';
import {
  CreateListingButton,
  ListingsStatsHeader,
  QuickActionsSidebar,
  ListingsSearchBar,
  ListingsFilterPanel,
  ListingsStatusSnapshot,
  ListingsDisplay,
  calculateListingStats,
  applyFilters,
  type ViewMode,
} from './listings';

const getFrameClasses = () =>
  [
    'relative isolate flex min-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[32px]',
    'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
    'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
  ].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

interface ListingsGridProps {
  listings?: Listing[];
}

/**
 * ListingsGrid - Main orchestrator component for listings management
 * 
 * Refactored from 384-line monolith into modular components:
 * - ListingsStatsHeader: Hero section with 4 stat cards
 * - CreateListingButton: Action button for creating new listings
 * - QuickActionsSidebar: Optimization and playbook cards
 * - ListingsSearchBar: Search input with view mode toggles
 * - ListingsFilterPanel: Advanced category and price filters
 * - ListingsStatusSnapshot: Simple status breakdown sidebar
 * - ListingsDisplay: Renders listings in grid/list mode with empty state
 */
export const ListingsGrid = ({ listings = [] }: ListingsGridProps) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats from listings
  const stats = useMemo(() => calculateListingStats(listings), [listings]);

  // Apply all filters to listings
  const filteredListings = useMemo(
    () => applyFilters(listings, searchQuery, selectedCategories, minPrice, maxPrice),
    [listings, searchQuery, selectedCategories, minPrice, maxPrice]
  );

  // Handlers
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  return (
    <div className={getFrameClasses()}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6">
        {/* Header: Stats + Quick Actions */}
        <header className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <ListingsStatsHeader stats={stats} />

          <aside className="flex flex-col gap-3">
            <CreateListingButton />
            <QuickActionsSidebar pausedCount={stats.paused} draftCount={stats.draft} />
          </aside>
        </header>

        {/* Search Bar */}
        <ListingsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterToggle={() => setShowFilters((prev) => !prev)}
          showFilters={showFilters}
          filteredCount={filteredListings.length}
          totalCount={listings.length}
        />

        {/* Main Content: Filter Panel + Listings */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)]">
          {showFilters ? (
            <ListingsFilterPanel
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onClearFilters={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          ) : (
            <ListingsStatusSnapshot activeCount={stats.active} pausedCount={stats.paused} draftCount={stats.draft} />
          )}

          <section className="relative flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_45px_140px_-110px_rgba(99,102,241,0.6)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-sm text-white/70">
              <p>
                Showing <span className="font-semibold text-white">{filteredListings.length}</span> of{' '}
                <span className="font-semibold text-white">{listings.length}</span> listings
              </p>
            </div>

            <ListingsDisplay listings={filteredListings} viewMode={viewMode} />
          </section>
        </div>
      </div>
    </div>
  );
};
