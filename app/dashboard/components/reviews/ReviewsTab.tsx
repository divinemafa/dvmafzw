/**
 * Reviews Tab - Customer reviews and ratings
 */

'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import type { Review } from '../../types';

interface ReviewsTabProps {
  reviews?: Review[];
}

export function ReviewsTab({ reviews = [] }: ReviewsTabProps) {
  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Avg Rating</p>
              <p className="mt-2 text-2xl font-bold text-white">{avgRating.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-yellow-500/20 p-3 text-yellow-400">
              <StarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Reviews</p>
              <p className="mt-2 text-2xl font-bold text-white">{reviews.length}</p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
              <StarOutlineIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">5 Star Reviews</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
              <StarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
          <p className="mt-1 text-sm text-white/60">See what clients are saying</p>
        </div>

        <div className="p-6">
          {reviews.length === 0 ? (
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <StarOutlineIcon className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-4 text-lg font-semibold text-white">No reviews yet</h3>
              <p className="mt-2 text-sm text-white/60">
                Customer reviews will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{review.reviewerName}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-white/80">{review.comment}</p>
                      <p className="mt-2 text-xs text-white/40">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : review.date || 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
