import { StarIcon } from '@heroicons/react/24/outline';
import type { Review } from '../../types';

interface RecentReviewsProps {
  reviews: Review[];
}

export const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Recent Reviews</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-white">{review.client}</h3>
                  <p className="text-xs text-white/60">{review.service}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mb-2 text-sm text-white/80">{review.comment}</p>
              <p className="text-xs text-white/50">{review.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
