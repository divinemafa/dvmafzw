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
    <article className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className={`mt-2 text-sm font-medium ${trendColor}`}>{trend}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-white/70">{description}</p>
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
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-white">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="text-sm text-white/70">{description}</p> : null}
        </div>
        {action ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {action}
          </button>
        ) : null}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                <FireIcon className="h-4 w-4" aria-hidden="true" />
                Utility Market Control Center
              </p>
              <h1 className="text-3xl font-semibold leading-tight lg:text-4xl">Oversee every listing, seller, and order from one glass dashboard.</h1>
              <p className="max-w-2xl text-sm text-white/70">
                This marketplace cockpit is wired for modular expansion. Swap in live metrics, hook inventory to on-chain or off-chain storage, and let creators spin up storefronts without losing governance over the experience.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span className="inline-flex items-center gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                  Smart discovery filters
                </span>
                <span className="inline-flex items-center gap-1">
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                  Seller growth playbooks
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                  Moderation ready
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm font-semibold text-white">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-purple-500/80 px-6 py-3 shadow-xl transition hover:from-blue-500 hover:to-purple-500"
              >
                <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                Launch new listing
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-white transition hover:bg-white/20"
              >
                <Bars3BottomRightIcon className="h-5 w-5" aria-hidden="true" />
                Open order manager
              </button>
              <p className="text-xs text-white/60">
                {/* TODO: Wire actions above to creation & fulfillment workflows once APIs are available. */}
                TODO: Connect quick actions to server-side mutations and wizard flows.
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {marketplaceMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <GlassSection
              title="Featured collections"
              description="Curated bundles to surface across the hero rail."
              action="Manage collections"
            >
              <div className="grid gap-4 md:grid-cols-3">
                {featuredCollections.map((collection) => (
                  <article
                    key={collection.title}
                    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.accent} opacity-70`} />
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-lg font-semibold">{collection.title}</h3>
                      <p className="text-sm text-white/80">{collection.items} live items</p>
                      <p className="text-xs uppercase tracking-wider text-white/70">Last 7 days volume</p>
                      <span className="text-xl font-semibold">{collection.volume}</span>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        {/* TODO: replace with deep link into CMS once available. */}
                        Curate spotlight
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </GlassSection>

            <GlassSection
              title="Active listings"
              description="Snapshot of top performing utility assets."
              action="View all listings"
            >
              <div className="space-y-3">
                {mockListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner backdrop-blur-xl"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{listing.title}</p>
                      <p className="text-xs text-white/60">
                        By {listing.creator} · SKU {listing.id}
                      </p>
                      <p className="text-xs text-white/50">
                        {/* TODO: Replace placeholder copy with dynamic attributes (tags, delivery info, etc.). */}
                        TODO: Inject primary attributes once listing schema is finalized.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm font-semibold text-white">
                      <StatusBadge tone={listing.badgeTone} label={listing.status} />
                      <span>{listing.price}</span>
                      <span className="text-xs text-white/60">{listing.stock} available</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassSection>
          </div>

          <div className="flex flex-col gap-4">
            <GlassSection title="Seller tasks" description="Keep storefronts launch-ready." action="View checklist">
              <ul className="space-y-3">
                {sellerTasks.map((task) => (
                  <li key={task.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                        <task.icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-white/70">{task.description}</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-200 underline-offset-4 hover:underline"
                        >
                          {task.cta}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassSection>

            <GlassSection title="Marketplace activity" description="Live pulse across the utility market." action="Open timeline">
              <ul className="space-y-3 text-sm text-white/80">
                {activityFeed.map((entry) => (
                  <li key={`${entry.actor}-${entry.subject}`} className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p>
                          <span className="font-semibold text-white">{entry.actor}</span> {entry.action}
                        </p>
                        <p className="text-xs text-white/60">{entry.subject}</p>
                      </div>
                      <span className="text-xs text-white/60">{entry.timestamp}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassSection>

            <GlassSection title="Moderation triage" description="Items waiting on human review." action="Open moderation">
              <ul className="space-y-3 text-sm text-white/80">
                {moderationQueue.map((entry) => (
                  <li key={entry.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur-xl">
                    <p className="text-sm font-semibold text-white">{entry.title}</p>
                    <p className="text-xs text-white/60">Seller: {entry.seller}</p>
                    <p className="text-xs text-white/60">Submitted {entry.submitted}</p>
                    <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                      {entry.flag}
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      {/* TODO: route to moderation workspace */}
                      Review submission
                    </button>
                  </li>
                ))}
              </ul>
            </GlassSection>
          </div>
        </div>

        <footer className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl backdrop-blur-2xl lg:grid-cols-2 xl:grid-cols-4">
          {buyerInsights.map((insight) => (
            <div key={insight.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur-xl">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">{insight.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{insight.value}</p>
                <p className="text-xs text-white/60">{/* TODO: replace static insight copy with analytics pipeline. */}TODO: Pull metric from analytics service.</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                <insight.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}
