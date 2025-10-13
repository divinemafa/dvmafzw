/**
 * CreateListingCard - Call-to-action for creating new listings
 * Simple card with gradient styling that triggers listing creation modal
 */

'use client';

import { SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getCardBaseClasses, accentRing } from './shared/utils';
import type { Listing } from '../../../types';

interface CreateListingCardProps {
  compact: boolean;
  onCreateClick: () => void;
  listings?: Listing[];
  loading?: boolean;
}

export const CreateListingCard = ({ compact, onCreateClick, listings = [], loading = false }: CreateListingCardProps) => {
  return (
    <div className={`${getCardBaseClasses(compact)} relative overflow-hidden ${accentRing}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#6366f1]/35 via-[#22d3ee]/20 to-transparent opacity-70" aria-hidden />
      <div className="relative flex flex-col gap-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Create a new listing</p>
            <p className="text-sm text-white/80">Launch a polished service in minutes with AI-assisted copy and pricing suggestions.</p>
          </div>
          <SparklesIcon className="h-6 w-6 text-cyan-200" aria-hidden />
        </div>

        {/* Content area: either mini listing chips or a large CTA when empty */}
        <div className="mt-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {listings.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={onCreateClick}
                  className="group flex h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-left transition hover:border-white/25 hover:bg-white/10"
                  title={`Open ${item.title}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white/80">
                    <span className="text-xs font-semibold">{(item.title || 'LS').slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-white">{item.title}</p>
                    <p className="truncate text-[11px] text-white/60">{item.category}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center">
              <button
                type="button"
                onClick={onCreateClick}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-slate-900 transition hover:border-white/40 hover:bg-white/80"
              >
                <span>Start building</span>
                <ChevronRightIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
