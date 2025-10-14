/**
 * CreateListingCard - Call-to-action for creating new listings
 * Simple card with gradient styling that triggers listing creation modal
 */

'use client';

import { SparklesIcon, ChevronRightIcon, ChevronLeftIcon, EyeIcon, CheckCircleIcon, PauseCircleIcon, PencilIcon, Squares2X2Icon, TagIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getCardBaseClasses, accentRing } from './shared/utils';
import type { Listing } from '../../../types';
import { useEffect, useMemo, useRef, useState } from 'react';

interface CreateListingCardProps {
  compact: boolean;
  onCreateClick: () => void;
  listings?: Listing[];
  loading?: boolean;
}

// MetricValue – renders a metric number with a subtle one-time bump animation when the value changes
const MetricValue = ({ value }: { value: number }) => {
  const [bump, setBump] = useState(false);
  const prev = useRef<number>(value);

  useEffect(() => {
    if (prev.current !== value) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 300);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={
        `text-base font-bold tabular-nums text-white/95 transition-transform duration-300 ${bump ? 'scale-110' : ''}`
      }
    >
      {value}
    </span>
  );
};

export const CreateListingCard = ({ compact, onCreateClick, listings = [], loading = false }: CreateListingCardProps) => {
  const router = useRouter();
  const hasListings = listings.length > 0;
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const metrics = useMemo(() => {
    const total = listings.length;
    let active = 0, paused = 0, draft = 0, views = 0;
    const categories = new Set<string>();
    for (const l of listings) {
      if (l.status === 'active') active++;
      else if (l.status === 'paused') paused++;
      else if (l.status === 'draft') draft++;
      views += Number(l.views || 0);
      if (l.category) categories.add(l.category);
    }
    return { total, active, paused, draft, views, categories: categories.size };
  }, [listings]);

  // Initialize scroll arrow state on mount/when listings change
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, [listings]);
  return (
  <div className={`${getCardBaseClasses(compact)} relative overflow-hidden pt-4 pb-3 self-start ${accentRing}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#6366f1]/35 via-[#22d3ee]/20 to-transparent opacity-70" aria-hidden />
  <div className="relative flex min-h-0 flex-col gap-2.5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Create a new listing</p>
            <p className="text-sm text-white/80">Launch a polished service in minutes with AI-assisted copy and pricing suggestions.</p>
          </div>
          <SparklesIcon className="h-6 w-6 text-cyan-200" aria-hidden />
        </div>

        {/* Top text-only CTA with subtle animated outline */}
        <div className="mt-1">
          <button
            type="button"
            onClick={onCreateClick}
            className="group relative inline-flex items-center text-[12px] font-semibold uppercase tracking-wide text-white/90 hover:text-white"
          >
            <span className="relative z-10 text-[35px] leading-tight text-white animate-pulse">Create new listing</span>
          </button>
        </div>

  {/* Removed flexible filler to tighten vertical spacing */}

        {/* Bottom chips strip with gradient edge mask */}
        <div className="relative">
          {loading ? (
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 w-40 animate-pulse rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : hasListings ? (
            <div
              className="relative overflow-hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
              }}
            >
              {/* Horizontal chips with scroll */}
              <div
                ref={chipsRef}
                className="flex items-center gap-2 py-0.5 overflow-x-auto scroll-smooth"
                onScroll={() => {
                  const el = chipsRef.current;
                  if (!el) return;
                  setCanScrollLeft(el.scrollLeft > 2);
                  setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
                }}
              >
                {listings.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/dashboard?tab=content&listingId=${item.id}`)}
                    className="group flex h-11 w-40 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-left transition hover:border-white/25 hover:bg-white/10"
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
              {/* Scroll arrows (subtle) */}
              {canScrollLeft && (
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => chipsRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
                  className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-1 text-white/40 shadow-sm ring-1 ring-white/10 transition hover:text-white/70"
                  style={{ backdropFilter: 'blur(6px)' }}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => chipsRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
                  className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-1 text-white/40 shadow-sm ring-1 ring-white/10 transition hover:text-white/70"
                  style={{ backdropFilter: 'blur(6px)' }}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex min-h-[120px] items-center justify-center">
              <div className="text-center">
                <p className="mb-3 text-xs text-white/60">No listings yet</p>
                <button
                  type="button"
                  onClick={onCreateClick}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-slate-900 transition hover:border-white/40 hover:bg-white/80"
                >
                  <span>Start building</span>
                  <ChevronRightIcon className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metrics summary under chips */}
        {hasListings && (
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {/* Total */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <Squares2X2Icon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Total</p>
                <MetricValue value={metrics.total} />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <CheckCircleIcon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Active</p>
                <MetricValue value={metrics.active} />
              </div>
            </div>

            {/* Drafts */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <PencilIcon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Drafts</p>
                <MetricValue value={metrics.draft} />
              </div>
            </div>

            {/* Paused */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <PauseCircleIcon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Paused</p>
                <MetricValue value={metrics.paused} />
              </div>
            </div>

            {/* Views */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <EyeIcon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Views</p>
                <MetricValue value={metrics.views} />
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-3 py-1.5 backdrop-blur-md">
              <TagIcon className="h-4 w-4 text-white/70" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Categories</p>
                <MetricValue value={metrics.categories} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
