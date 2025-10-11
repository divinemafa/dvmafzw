import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  BookmarkIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import type { Listing } from '@/app/dashboard/types';
import { ListingCard } from './ListingCard';
import { ListingListItem } from './ListingListItem';

type ListingStatusFilter = 'all' | 'active' | 'paused' | 'draft';
type ListingViewMode = 'grid' | 'list';

const getFrameClasses = () =>
  [
    'relative isolate flex min-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[32px]',
    'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
    'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
  ].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

const commandBarClasses =
  'relative flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between';

const filterPillClasses = (active: boolean, accent?: 'emerald' | 'amber' | 'violet') => {
  const base = 'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition';
  if (!active) {
    return `${base} border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white`;
  }

  if (accent === 'emerald') {
    return `${base} border-emerald-400/40 bg-emerald-400/20 text-emerald-200 shadow-[0_12px_30px_-20px_rgba(16,185,129,0.65)]`;
  }
  if (accent === 'amber') {
    return `${base} border-amber-400/40 bg-amber-400/20 text-amber-200 shadow-[0_12px_30px_-20px_rgba(245,158,11,0.6)]`;
  }
  if (accent === 'violet') {
    return `${base} border-violet-400/40 bg-violet-400/20 text-violet-200 shadow-[0_12px_30px_-20px_rgba(139,92,246,0.6)]`;
  }
  return `${base} border-white/30 bg-white/15 text-white`;
};

const statsCardClasses = 'rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_40px_120px_-90px_rgba(120,113,198,0.5)] backdrop-blur-xl';

const highlightCardClasses =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-[0_50px_140px_-100px_rgba(56,189,248,0.65)] backdrop-blur-2xl';

const emptyStateClasses =
  'relative flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/5 p-16 text-center shadow-[0_60px_150px_-100px_rgba(79,70,229,0.5)] backdrop-blur-2xl';

interface ListingsGridProps {
  listings?: Listing[];
}

export const ListingsGrid = ({ listings = [] }: ListingsGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ListingStatusFilter>('all');
  const [viewMode, setViewMode] = useState<ListingViewMode>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const normalizedListings = useMemo(() => listings ?? [], [listings]);
  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedListings.filter((listing) => {
      const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
      if (!matchesStatus) return false;

      if (!query) return true;

      const title = listing.title?.toLowerCase() ?? '';
      const category = listing.category?.toLowerCase() ?? '';
      return title.includes(query) || category.includes(query);
    });
  }, [filterStatus, normalizedListings, searchQuery]);

  const stats = useMemo(() => {
    const total = normalizedListings.length;
    let active = 0;
    let paused = 0;
    let draft = 0;

    for (const listing of normalizedListings) {
      if (listing.status === 'active') active += 1;
      else if (listing.status === 'paused') paused += 1;
      else if (listing.status === 'draft') draft += 1;
    }

    return { total, active, paused, draft };
  }, [normalizedListings]);

  const heroSummary = [
    {
      label: 'Total Listings',
      value: stats.total.toString(),
      hint: `${stats.active} live right now`,
      icon: PlusCircleIcon,
      accent: 'from-blue-500/15 via-blue-500/5 to-transparent',
    },
    {
      label: 'Active',
      value: stats.active.toString(),
      hint: `${Math.max(stats.active - stats.paused, 0)} outperform last week`,
      icon: CheckCircleIcon,
      accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    },
    {
      label: 'Paused',
      value: stats.paused.toString(),
      hint: stats.paused ? `${stats.paused} need attention` : 'All listings live',
      icon: BookmarkIcon,
      accent: 'from-amber-400/20 via-amber-400/5 to-transparent',
    },
    {
      label: 'Draft',
      value: stats.draft.toString(),
      hint: stats.draft ? 'Finish these to launch' : 'Nothing waiting',
      icon: CloudArrowUpIcon,
      accent: 'from-violet-500/20 via-violet-500/5 to-transparent',
    },
  ] as const;

  const layoutGap = 'gap-4';
  const columnGap = 'gap-3';

  return (
    <div className={getFrameClasses()}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6">
        <header className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_50px_160px_-120px_rgba(79,70,229,0.65)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#BD24DF]/15 via-transparent to-[#2D6ADE]/25 opacity-80" aria-hidden />
            <div className="relative flex flex-col justify-between gap-6 text-white lg:flex-row">
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">Listings control center</p>
                <h1 className="text-3xl font-semibold leading-tight">Craft, refine, and amplify your offers</h1>
                <p className="text-sm text-white/70">
                  Keep listings polished, respond to momentum, and launch new services with AI-assisted copy. This view is tuned
                  to help you move fast.
                </p>
                <div className="flex flex-wrap gap-2">
                  {heroSummary.map(({ label, value, hint, icon: Icon, accent }) => (
                    <div
                      key={label}
                      className={`${highlightCardClasses} w-full min-w-[160px] flex-1 border-white/10 ${layoutGap} ${columnGap}`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" aria-hidden />
                      <div className="relative flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{label}</p>
                          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                          <p className="mt-1 text-xs text-white/60">{hint}</p>
                        </div>
                        <div className={`rounded-xl bg-gradient-to-br ${accent} p-2 text-white/80`}>
                          <Icon className="h-5 w-5" aria-hidden />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside className="flex flex-col gap-3">
            <button
              type="button"
              className="relative flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-gradient-to-r from-[#BD24DF]/40 via-[#6366f1]/30 to-[#2D6ADE]/40 px-5 py-4 text-sm font-semibold text-white shadow-[0_40px_120px_-120px_rgba(56,189,248,0.9)] transition hover:border-white/25 hover:from-[#d040f5]/50 hover:to-[#4f82ff]/50"
            >
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">Create new listing</span>
                <span className="text-base font-semibold">Launch a new offer</span>
                <span className="text-[11px] text-white/70">AI drafting ready with smart pricing</span>
              </div>
              <SparklesIcon className="h-6 w-6 text-cyan-200" aria-hidden />
            </button>
            <div className={statsCardClasses}>
              <div className="flex items-start justify-between gap-2 text-white">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Optimization</p>
                  <p className="text-base font-semibold">Update performance</p>
                  <p className="text-[11px] text-white/60">Edit copy, adjust pricing, or refresh imagery to stay on trend.</p>
                </div>
                <BoltIcon className="h-6 w-6 text-amber-300" aria-hidden />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/70">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Paused leads</p>
                  <p className="mt-1 text-lg font-semibold text-white">{stats.paused}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Draft ideas</p>
                  <p className="mt-1 text-lg font-semibold text-white">{stats.draft}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70 shadow-[0_40px_120px_-110px_rgba(59,130,246,0.65)]">
              <div className="flex items-start justify-between gap-2 text-white">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Playbook</p>
                  <p className="text-sm font-semibold text-white">Polish top performer</p>
                  <p className="text-[11px] text-white/60">Duplicate your best listing and tweak the angle for new market segments.</p>
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-300" aria-hidden />
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
              >
                Duplicate top listing
              </button>
            </div>
          </aside>
        </header>

        <div className={commandBarClasses}>
          <div className="relative w-full max-w-xl">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden />
            <input
              type="text"
              placeholder="Search by title, category, or keyword"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 shadow-[0_24px_80px_-60px_rgba(148,163,184,0.5)] backdrop-blur-xl transition focus:border-white/30 focus:bg-white/10 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilterPanel((prev) => !prev)}
              className={filterPillClasses(showFilterPanel)}
            >
              <FunnelIcon className="h-4 w-4" aria-hidden />
              Filters
            </button>
            <button type="button" className={filterPillClasses(viewMode === 'grid', 'violet')} onClick={() => setViewMode('grid')}>
              <Squares2X2Icon className="h-4 w-4" aria-hidden />
              Grid
            </button>
            <button type="button" className={filterPillClasses(viewMode === 'list', 'emerald')} onClick={() => setViewMode('list')}>
              <ListBulletIcon className="h-4 w-4" aria-hidden />
              List
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={filterPillClasses(false)}>
              <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden />
              Bulk update
            </button>
            <button type="button" className={filterPillClasses(false)}>
              <BoltIcon className="h-4 w-4" aria-hidden />
              Generate copy
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)]">
          {showFilterPanel ? (
            <aside className="grid content-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_32px_120px_-100px_rgba(14,165,233,0.6)]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Quick filters</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={filterPillClasses(filterStatus === 'active', 'emerald')} onClick={() => setFilterStatus('active')}>
                    Active spotlight
                  </button>
                  <button type="button" className={filterPillClasses(filterStatus === 'paused', 'amber')} onClick={() => setFilterStatus('paused')}>
                    Needs action
                  </button>
                  <button type="button" className={filterPillClasses(filterStatus === 'draft')} onClick={() => setFilterStatus('draft')}>
                    Drafts
                  </button>
                  <button type="button" className={filterPillClasses(filterStatus === 'all')} onClick={() => setFilterStatus('all')}>
                    Show all
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Categories</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/70">
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Workshops</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Experiences</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Consulting</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Digital goods</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Pricing tiers</p>
                <div className="mt-3 space-y-2 text-sm">
                  <label className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-white/70">Under R500</span>
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-400" />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-white/70">R500 - R1 500</span>
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-400" />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-white/70">Above R1 500</span>
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-400" />
                  </label>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-white/70 shadow-[0_32px_120px_-100px_rgba(56,189,248,0.6)]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Status snapshot</p>
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-300" aria-hidden />
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-white/70">Active listings</span>
                  <span className="text-white">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-white/70">Paused</span>
                  <span className="text-amber-200">{stats.paused}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-white/70">Draft</span>
                  <span className="text-white">{stats.draft}</span>
                </div>
              </div>
            </aside>
          )}

          <section className="relative flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_45px_140px_-110px_rgba(99,102,241,0.6)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-sm text-white/70">
              <p>
                Showing <span className="font-semibold text-white">{filteredListings.length}</span> of{' '}
                <span className="font-semibold text-white">{normalizedListings.length}</span> listings
              </p>
              <button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 transition hover:text-cyan-100">
                Smart sort
              </button>
            </div>
            {filteredListings.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredListings.map((listing) => (
                    <ListingListItem key={listing.id} listing={listing} />
                  ))}
                </div>
              )
            ) : (
              <div className={emptyStateClasses}>
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#BD24DF]/20 via-transparent to-[#2D6ADE]/25 opacity-70" aria-hidden />
                <div className="relative flex flex-col items-center gap-6 text-white">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10">
                    <MagnifyingGlassIcon className="h-10 w-10 text-white/50" aria-hidden />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-semibold">No listings matched</h3>
                    <p className="text-sm text-white/70">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Adjust filters or try another keyword to find the perfect match.'
                        : 'Get your first listing live to start attracting bookings.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
                  >
                    <PlusCircleIcon className="h-5 w-5" aria-hidden />
                    Create your first listing
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
