/**
 * LatestReviewsCard - Shows recent client reviews
 * Displays latest client feedback with ratings and comments
 */

'use client';

import { ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import type { Review } from '../../../types';

interface LatestReviewsCardProps {
  compact: boolean;
  latestReviews: Review[];
  formatDate: (value?: string | null) => string | null;
  reviewListSpacing: string;
}

export const LatestReviewsCard = ({
  compact,
  latestReviews,
  formatDate,
  reviewListSpacing,
}: LatestReviewsCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Latest Reviews"
      subtitle="What clients are saying"
      icon={ChatBubbleLeftRightIcon}
      actionLabel="Respond"
    >
      <div className={`text-sm ${reviewListSpacing}`}>
        {latestReviews.length ? (
          latestReviews.map((review) => {
            const reviewDate = formatDate(review.createdAt ?? review.date);

            return (
              <article key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                <header className="mb-2 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-semibold">
                      {review.reviewerName ?? review.client ?? 'Anonymous client'}
                    </p>
                    {reviewDate ? <p className="text-xs text-white/50">{reviewDate}</p> : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-amber-400" aria-hidden />
                    <span className="text-sm font-semibold text-white">{review.rating.toFixed(1)}</span>
                  </div>
                </header>
                <p className="text-sm text-white/70">{review.comment}</p>
              </article>
            );
          })
        ) : (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-sm text-white/70">
            You have no reviews yet. Encourage clients to leave feedback after each completed booking.
          </p>
        )}
      </div>
    </SectionCard>
  );
};
