import Image from 'next/image';
import { 
  PhotoIcon,
  EyeIcon, 
  CalendarIcon, 
  PencilSquareIcon, 
  PauseCircleIcon, 
  TrashIcon,
  PlayCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-purple-500/20">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#BD24DF]/8 via-transparent to-[#2D6ADE]/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#BD24DF] to-[#2D6ADE] opacity-70" />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent text-white/60">
                <PhotoIcon className="h-6 w-6" />
                <span className="text-[10px] font-medium uppercase tracking-widest">No Image</span>
              </div>
            )}

            {listing.featured && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-[10px] font-semibold text-black shadow-lg shadow-yellow-500/40">
                <StarSolidIcon className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white">
                  {listing.title}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">
                  {listing.category}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize backdrop-blur-sm ${statusConfig.bg} ${statusConfig.text}`}>
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${statusConfig.dot}`} />
                {listing.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-semibold text-emerald-200">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                {listing.currency === 'ZAR' ? 'R' : listing.currency}{listing.price}
              </span>
              {listing.rating > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 font-semibold text-yellow-200">
                  <StarSolidIcon className="h-3.5 w-3.5" />
                  {listing.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-white/70">
          <div className="flex flex-wrap gap-2">
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
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <ChartBarIcon className="h-4 w-4 text-purple-300" />
              <span className="font-semibold text-white">{listing.rating > 0 ? listing.rating.toFixed(1) : '—'}</span>
              <span className="uppercase tracking-wide text-white/50">score</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="group relative flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white transition hover:border-white/25 hover:bg-white/20">
              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-white/15 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </button>
            {listing.status === 'paused' ? (
              <button className="group relative flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/20">
                <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <PlayCircleIcon className="h-4 w-4" />
                Resume
              </button>
            ) : (
              <button className="group relative flex items-center gap-1.5 rounded-lg border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-[11px] font-semibold text-yellow-200 transition hover:border-yellow-400/40 hover:bg-yellow-400/20">
                <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <PauseCircleIcon className="h-4 w-4" />
                Pause
              </button>
            )}
            <button className="group relative flex items-center gap-1.5 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[11px] font-semibold text-red-200 transition hover:border-red-400/40 hover:bg-red-400/20">
              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-red-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
