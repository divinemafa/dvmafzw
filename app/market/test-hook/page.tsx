'use client';

import { useMarketplaceListings } from '../hooks/useMarketplaceListings';

/**
 * Test page for useMarketplaceListings hook
 * Visit: http://localhost:3000/market/test-hook
 */
export default function TestHookPage() {
  const { 
    listings, 
    pagination, 
    isLoading, 
    isLoadingMore, 
    error, 
    loadMore, 
    refetch 
  } = useMarketplaceListings({ limit: 5 });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
          <p className="text-white/60">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="mb-4 text-red-400">Failed to load marketplace</p>
          <p className="mb-4 text-sm text-white/40">{error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="mb-2 text-lg text-white/60">No listings available yet</p>
          <p className="text-sm text-white/40">Check back soon for new services!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Hook Test Page
          </h1>
          <p className="text-white/60">Testing useMarketplaceListings hook</p>
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold text-white mb-2">Pagination Info:</h2>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
              <div>
                <p className="text-white/40">Page</p>
                <p className="font-semibold text-white">{pagination.page}</p>
              </div>
              <div>
                <p className="text-white/40">Per Page</p>
                <p className="font-semibold text-white">{pagination.limit}</p>
              </div>
              <div>
                <p className="text-white/40">Total</p>
                <p className="font-semibold text-white">{pagination.total}</p>
              </div>
              <div>
                <p className="text-white/40">Total Pages</p>
                <p className="font-semibold text-white">{pagination.totalPages}</p>
              </div>
              <div>
                <p className="text-white/40">Has More</p>
                <p className="font-semibold text-white">{pagination.hasMore ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Listings */}
        <div className="space-y-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="rounded-lg border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
            >
              <div className="flex items-start gap-4">
                {/* Index */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-lg font-bold text-blue-400">
                  {index + 1 + ((pagination?.page || 1) - 1) * (pagination?.limit || 5)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Title & Status */}
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-white">
                      {listing.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      listing.badgeTone === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                      listing.badgeTone === 'sky' ? 'bg-sky-500/20 text-sky-400' :
                      listing.badgeTone === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-violet-500/20 text-violet-400'
                    }`}>
                      {listing.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-3 text-sm text-white/60">
                    {listing.shortDescription}
                  </p>

                  {/* Provider Info */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                      {listing.provider.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {listing.provider.display_name}
                        {listing.provider.is_verified && (
                          <span className="ml-1 text-blue-400">✓</span>
                        )}
                      </p>
                      <p className="text-xs text-white/40">
                        @{listing.provider.username}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-white/40">Rating</p>
                      <p className="text-sm font-semibold text-yellow-400">
                        ⭐ {listing.provider.rating.toFixed(1)} ({listing.provider.total_reviews})
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-white/40">Price</p>
                      <p className="font-semibold text-white">{listing.price}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Location</p>
                      <p className="font-semibold text-white">{listing.location}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Category</p>
                      <p className="font-semibold text-white">{listing.category}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Views</p>
                      <p className="font-semibold text-white">{listing.views}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {pagination?.hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Loading...
                </span>
              ) : (
                `Load More (${listings.length} of ${pagination.total})`
              )}
            </button>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={refetch}
            className="text-sm text-white/60 transition hover:text-white"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
