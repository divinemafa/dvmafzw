import { StarIcon } from '@heroicons/react/24/outline';
import type { Review } from '../../types';

interface RecentReviewsProps {
  reviews: Review[];
}

export const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  return (
    <div className="overflow-hidden bg-white/5 backdrop-blur-xl">
      <div className="bg-white/5 px-2 py-1.5">
        <h2 className="text-xs font-bold text-white">Recent Reviews</h2>
      </div>
      <div className="p-2">
        <div className="space-y-1">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="group relative overflow-hidden bg-white/5 p-2 transition hover:bg-white/10"
            >
              <div className="relative">
                {/* Header with client and stars */}
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Avatar Circle */}
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-[10px] font-bold text-white">
                      {review.client?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-semibold text-white">
                        {review.client}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-2.5 w-2.5 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-white/10 text-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <p className="mb-1 text-[10px] italic leading-tight text-white/80 line-clamp-2">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Date */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-white/40">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
