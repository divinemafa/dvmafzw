"use client";

import {
  Bars3BottomRightIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CubeTransparentIcon,
  FireIcon,
  FolderOpenIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const marketplaceMetrics = [
  {
    label: 'Daily Volume',
    value: '$182K',
    trend: '+12.4%',
    tone: 'positive',
    description: 'Across all utility items in the last 24h.',
    icon: ChartBarIcon,
  },
  {
    label: 'Active Sellers',
    value: '1,289',
    trend: '+4.1%',
    tone: 'neutral',
    description: 'Verified storefronts currently live.',
    icon: UsersIcon,
  },
  {
    label: 'Average Order Time',
    value: '08:17',
    trend: '-9.6%',
    tone: 'positive',
    description: 'From checkout to fulfillment.',
    icon: ClockIcon,
  },
  {
    label: 'Open Disputes',
    value: '3',
    trend: 'Stable',
    tone: 'neutral',
    description: 'Awaiting moderation triage.',
    icon: ShieldCheckIcon,
  },
];

const featuredCollections = [
  {
    title: 'Creator Tools',
    items: 86,
    volume: '$24K',
    accent: 'from-purple-500/80 via-indigo-500/60 to-blue-500/80',
  },
  {
    title: 'Licenses & Access Keys',
    items: 64,
    volume: '$19K',
    accent: 'from-amber-500/80 via-orange-500/70 to-pink-500/80',
  },
  {
    title: 'NFT Utility Packs',
    items: 112,
    volume: '$41K',
    accent: 'from-emerald-500/80 via-teal-500/70 to-cyan-500/80',
  },
];

type StatusTone = 'emerald' | 'sky' | 'amber' | 'violet';

const mockListings: Array<{
  id: string;
  title: string;
  creator: string;
  price: string;
  stock: string;
  status: string;
  badgeTone: StatusTone;
}> = [
  {
    id: 'LIST-001',
    title: 'Metaverse Billboard Slot',
    creator: 'Orbit Labs',
    price: '35 SOL',
    stock: '18/25',
    status: 'Featured',
    badgeTone: 'emerald',
  },
  {
    id: 'LIST-002',
    title: 'Influencer Campaign Access',
    creator: 'Signal Boosters',
    price: '12 SOL',
    stock: '7/10',
    status: 'Popular',
    badgeTone: 'sky',
  },
  {
    id: 'LIST-003',
    title: 'Custom Mascot Artwork Slot',
    creator: 'Pixel Forge',
    price: '5 SOL',
    stock: '2/12',
    status: 'Low stock',
    badgeTone: 'amber',
  },
  {
    id: 'LIST-004',
    title: 'Gaming Tournament Entry Bundle',
    creator: 'ArenaX',
    price: '2 SOL',
    stock: '54/150',
    status: 'Trending',
    badgeTone: 'violet',
  },
];

const sellerTasks = [
  {
    title: 'Upload product media',
    description: 'Add at least three showcase images or videos to boost conversion.',
    icon: FolderOpenIcon,
    cta: 'Open media studio',
  },
  {
    title: 'Verify payout wallet',
    description: 'Connect the Solana address for automated settlement.',
    icon: BoltIcon,
    cta: 'Launch payout wizard',
  },
  {
    title: 'Set launch promo',
    description: 'Schedule a limited-time discount for new shoppers.',
    icon: TagIcon,
    cta: 'Configure promotion',
  },
];

const activityFeed = [
  {
    actor: 'Orbit Labs',
    action: 'fulfilled an order',
    subject: 'Metaverse Billboard Slot',
    timestamp: '1m ago',
  },
  {
    actor: 'Pixel Forge',
    action: 'submitted a listing for review',
    subject: 'Mascot Animation Kit',
    timestamp: '6m ago',
  },
  {
    actor: 'Signal Boosters',
    action: 'received a 5-star rating',
    subject: 'Influencer Campaign Access',
    timestamp: '12m ago',
  },
  {
    actor: 'ArenaX',
    action: 'restocked inventory',
    subject: 'Tournament Entry Bundle',
    timestamp: '24m ago',
  },
];

const moderationQueue = [
  {
    title: 'Mascot 3D Rig Pack',
    seller: 'Neon Draft',
    submitted: '14m ago',
    flag: 'Auto-detected duplicate asset metadata',
  },
  {
    title: 'VIP Launch Partner Pass',
    seller: 'Bitty Labs',
    submitted: '38m ago',
    flag: 'High ticket item — requires manual approval',
  },
];

const buyerInsights = [
  {
    label: 'New carts',
    value: '56',
    icon: CubeTransparentIcon,
  },
  {
    label: 'Abandoned checkouts',
    value: '9',
    icon: Bars3BottomRightIcon,
  },
  {
    label: 'Support tickets',
    value: '4',
    icon: GiftIcon,
  },
  {
    label: 'Loyalty rewards issued',
    value: '73',
    icon: SparklesIcon,
  },
];

function MetricCard({
  label,
  value,
  trend,
  tone,
  description,
  icon: Icon,
}: typeof marketplaceMetrics[number]) {
  const trendColor = tone === 'positive'
    ? 'text-emerald-300'
    : tone === 'negative'
      ? 'text-red-300'
      : 'text-white/70';

  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-widest text-white/60">{label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          <p className={`mt-1 text-[10px] font-medium ${trendColor}`}>{trend}</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-[10px] text-white/70 leading-tight">{description}</p>
    </article>
  );
}

function GlassSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 text-white">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? <p className="text-[10px] text-white/70">{description}</p> : null}
        </div>
        {action ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            {action}
          </button>
        ) : null}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {children}
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  const palettes: Record<StatusTone, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    sky: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    amber: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    violet: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
  } as const;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${palettes[tone]}`}>
      {label}
    </span>
  );
}

export default function MarketPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1800px] gap-4 px-4 py-6">
        {/* LEFT SIDEBAR - Filters & Categories */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-3">
            {/* Hero CTA - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">Utility Market</p>
              <h2 className="mb-3 text-base font-bold leading-tight">Discover & sell assets</h2>
              <div className="space-y-1.5">
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-purple-500/80 px-3 py-2 text-xs font-semibold text-white shadow-xl transition hover:from-blue-500 hover:to-purple-500"
                >
                  <SparklesIcon className="mr-1.5 inline-block h-3.5 w-3.5" aria-hidden="true" />
                  List new item
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Connect Wallet
                </button>
              </div>
            </div>

            {/* Categories - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <h3 className="text-xs font-semibold text-white">Categories</h3>
              </div>
              <nav className="p-2">
                <ul className="space-y-1 text-xs">
                  {['All Items', 'Creator Tools', 'Licenses & Keys', 'NFT Utilities', 'Games', 'Art & Media', 'Physical Goods'].map((cat, idx) => (
                    <li key={cat}>
                      <button
                        type="button"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-left transition ${
                          idx === 0
                            ? 'bg-white/10 font-semibold text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Quick Stats - Compact */}
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
              {marketplaceMetrics.slice(0, 2).map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/60">{metric.label}</p>
                  <p className="mt-0.5 text-sm font-bold text-white">{metric.value}</p>
                  <p className={`mt-0.5 text-[9px] font-medium ${metric.tone === 'positive' ? 'text-emerald-300' : 'text-white/70'}`}>
                    {metric.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER - Main Content (Products) */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Search & Filter Bar - Compact */}
          <header className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-xl backdrop-blur-2xl">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-xl">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search assets, sellers, collections..."
                    className="w-full rounded-lg border border-white/15 bg-white/10 py-2 pl-10 pr-3 text-xs text-white placeholder-white/50 transition focus:border-blue-400 focus:bg-white/15 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Search
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Filter
                </button>
              </div>
            </div>
          </header>

          {/* Featured Collections - Compact */}
          <section className="rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
            <div className="border-b border-white/10 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Featured Collections</h2>
                <button className="text-xs font-semibold text-blue-200 hover:text-blue-100">See all</button>
              </div>
            </div>
            <div className="p-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCollections.map((collection) => (
                  <article
                    key={collection.title}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl transition hover:border-white/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.accent} opacity-60 transition group-hover:opacity-80`} />
                    <div className="relative z-10 space-y-2">
                      <h3 className="text-xs font-bold text-white">{collection.title}</h3>
                      <p className="text-[10px] text-white/90">{collection.items} items</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{collection.volume}</span>
                        <button
                          type="button"
                          className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-white/20"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Product Grid - Compact */}
          <section className="flex-1 rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
            <div className="border-b border-white/10 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Explore Marketplace</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/60">Sort:</span>
                  <select className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition focus:border-blue-400 focus:outline-none">
                    <option>Trending</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl transition hover:border-white/20 hover:shadow-2xl"
                  >
                    {/* Product Image Placeholder */}
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20">
                      <div className="flex h-full items-center justify-center">
                        <CubeTransparentIcon className="h-12 w-12 text-white/30" aria-hidden="true" />
                      </div>
                    </div>
                    
                    {/* Product Info - Compact */}
                    <div className="p-2.5">
                      <div className="mb-1.5 flex items-start justify-between gap-1.5">
                        <h3 className="flex-1 text-xs font-semibold text-white line-clamp-2">{listing.title}</h3>
                        <StatusBadge tone={listing.badgeTone} label={listing.status} />
                      </div>
                      
                      <p className="mb-2 text-[9px] text-white/60">by {listing.creator}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-white/50">Current price</p>
                          <p className="text-sm font-bold text-white">{listing.price}</p>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
                        >
                          Buy Now
                        </button>
                      </div>
                      
                      <p className="mt-1.5 text-[9px] text-white/50">{listing.stock} in stock</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR - Compact */}
        <aside className="hidden w-72 flex-shrink-0 xl:block">
          <div className="sticky top-6 space-y-3">
            {/* Top Creators - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Top Creators</h3>
                  <button className="text-[10px] font-semibold text-blue-200 hover:text-blue-100">See all</button>
                </div>
              </div>
              <div className="p-3">
                <ul className="space-y-2">
                  {['Orbit Labs', 'Pixel Forge', 'Signal Boosters', 'ArenaX', 'Bitty Labs'].map((creator, idx) => (
                    <li key={creator} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/60 to-blue-500/60 text-xs font-bold text-white">
                          {creator.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{creator}</p>
                          <p className="text-[9px] text-white/60">{Math.floor(Math.random() * 50) + 10} SOL</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-white/60">#{idx + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Activity - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Recent Activity</h3>
                  <button className="text-[10px] font-semibold text-blue-200 hover:text-blue-100">See more</button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-3">
                <ul className="space-y-2">
                  {activityFeed.map((entry) => (
                    <li key={`${entry.actor}-${entry.subject}`} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="mb-1 flex items-start justify-between gap-1.5">
                        <p className="text-[10px] text-white">
                          <span className="font-semibold">{entry.actor}</span> {entry.action}
                        </p>
                        <span className="text-[9px] text-white/50 whitespace-nowrap">{entry.timestamp}</span>
                      </div>
                      <p className="text-[9px] text-white/60 line-clamp-1">{entry.subject}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Metrics - Compact */}
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
              {buyerInsights.slice(0, 3).map((insight) => (
                <div key={insight.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/60">{insight.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-white">{insight.value}</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                    <insight.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
