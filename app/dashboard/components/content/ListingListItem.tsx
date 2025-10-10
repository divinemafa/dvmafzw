import Image from 'next/image';
import { 
  PhotoIcon,
  EyeIcon, 
  CalendarIcon, 
  PencilSquareIcon, 
  PauseCircleIcon, 
  TrashIcon,
  PlayCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Listing } from '../../types';

interface ListingListItemProps {
  listing: Listing;
}

export const ListingListItem = ({ listing }: ListingListItemProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-400/10 border-emerald-400/30',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400'
        };
      case 'paused':
        return {
          bg: 'bg-yellow-400/10 border-yellow-400/30',
          text: 'text-yellow-300',
          dot: 'bg-yellow-400'
        };
      case 'draft':
        return {
          bg: 'bg-white/5 border-white/20',
          text: 'text-white/60',
          dot: 'bg-white/40'
        };
      default:
        return {
          bg: 'bg-white/5 border-white/20',
          text: 'text-white/60',
          dot: 'bg-white/40'
        };
    }
  };

  const statusConfig = getStatusConfig(listing.status);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-white/25 hover:shadow-purple-500/15">
      {/* Gradient Glow Effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#BD24DF]/5 via-transparent to-[#2D6ADE]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Gradient Accent Line - Left Side */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#BD24DF] to-[#2D6ADE]" />

      <div className="flex items-center gap-4 p-4 pl-5">
        <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/5 sm:block">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-transparent text-white/60">
              <PhotoIcon className="h-6 w-6" />
            </div>
          )}
          {listing.featured && (
            <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-black shadow-yellow-500/30">
              <StarSolidIcon className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-white">
                  {listing.title}
                </h3>
                <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                  {listing.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
                {listing.category}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-semibold text-emerald-200">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                {listing.currency === 'ZAR' ? 'R' : listing.currency}{listing.price}
              </span>
              {listing.rating > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-1 font-semibold text-yellow-200">
                  <StarSolidIcon className="h-3.5 w-3.5" />
                  {listing.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/70">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <EyeIcon className="h-4 w-4 text-blue-300" />
              <span className="font-semibold text-white">{listing.views}</span>
              <span className="uppercase tracking-wide text-white/50">views</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <CalendarIcon className="h-4 w-4 text-emerald-300" />
              <span className="font-semibold text-white">{listing.bookings}</span>
              <span className="uppercase tracking-wide text-white/50">bookings</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="rounded-lg border border-white/15 bg-white/10 p-2 text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/20" title="Edit">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          {listing.status === 'paused' ? (
            <button className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-2 text-emerald-200 backdrop-blur-sm transition hover:border-emerald-400/35 hover:bg-emerald-400/20" title="Resume">
              <PlayCircleIcon className="h-4 w-4" />
            </button>
          ) : (
            <button className="rounded-lg border border-yellow-400/25 bg-yellow-400/10 p-2 text-yellow-200 backdrop-blur-sm transition hover:border-yellow-400/35 hover:bg-yellow-400/20" title="Pause">
              <PauseCircleIcon className="h-4 w-4" />
            </button>
          )}
          <button className="rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-200 backdrop-blur-sm transition hover:border-red-400/35 hover:bg-red-400/20" title="Delete">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
