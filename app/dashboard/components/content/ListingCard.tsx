import { 
  StarIcon, 
  EyeIcon, 
  CalendarIcon, 
  PencilSquareIcon, 
  PauseCircleIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import type { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'draft':
        return 'bg-white/10 text-white/60';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">{listing.title}</h3>
              {listing.featured && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300">
                  <StarIcon className="h-3 w-3 fill-yellow-300" />
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-white/60">{listing.category}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(listing.status)}`}>
            {listing.status}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-4 text-sm">
          <span className="text-lg font-bold text-white">
            {listing.currency === 'ZAR' ? 'R' : listing.currency}{listing.price}
          </span>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <StarIcon className="h-4 w-4 fill-yellow-400" />
              <span className="text-sm font-semibold text-white">{listing.rating}</span>
            </div>
          )}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <EyeIcon className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-white">{listing.views}</p>
            <p className="text-xs text-white/60">Views</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <CalendarIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white">{listing.bookings}</p>
            <p className="text-xs text-white/60">Bookings</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <StarIcon className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm font-bold text-white">{listing.rating || '—'}</p>
            <p className="text-xs text-white/60">Rating</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
            <PencilSquareIcon className="mx-auto mb-1 h-4 w-4" />
            Edit
          </button>
          <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
            <PauseCircleIcon className="mx-auto mb-1 h-4 w-4" />
            Pause
          </button>
          <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20">
            <TrashIcon className="mx-auto mb-1 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
