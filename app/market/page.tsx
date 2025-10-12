"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bars3BottomRightIcon,
  Bars4Icon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeTransparentIcon,
  FolderOpenIcon,
  GiftIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  TagIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { StatusTone, MarketplaceListing } from './data/listings';
import { IPFSImage } from '@/components/IPFSImage';
import { ProviderLink, ProviderLinkCompact } from './components/ProviderLink';
import { useMarketplaceListings } from './hooks/useMarketplaceListings';
import type { MarketplaceListing as RealMarketplaceListing } from './hooks/useMarketplaceListings';

const marketplaceMetrics = [
  {
    label: 'Daily Volume',
    value: '$182K',
    trend: '+12.4%',
    tone: 'positive',
    description: 'Across all services in the last 24h.',
    icon: ChartBarIcon,
  },
  {
    label: 'Active Providers',
    value: '1,289',
    trend: '+4.1%',
    tone: 'neutral',
    description: 'Verified service providers live.',
    icon: UsersIcon,
  },
  {
    label: 'Avg Response Time',
    value: '2.5 hrs',
    trend: '-15.2%',
    tone: 'positive',
    description: 'Average provider response time.',
    icon: ClockIcon,
  },
  {
    label: 'Verified Services',
    value: '98.7%',
    trend: '+2.1%',
    tone: 'positive',
    description: 'Services with blockchain verification.',
    icon: ShieldCheckIcon,
  },
];

// Parent category groups
const categoryGroups = [
  { id: 'general', name: 'General Services', color: 'from-blue-500/60 to-cyan-500/60' },
  { id: 'home', name: 'Home & Property', color: 'from-purple-500/60 to-indigo-500/60' },
  { id: 'transport', name: 'Transportation', color: 'from-orange-500/60 to-amber-500/60' },
  { id: 'trades', name: 'Skilled Trades', color: 'from-emerald-500/60 to-teal-500/60' },
  { id: 'professional', name: 'Professional', color: 'from-pink-500/60 to-rose-500/60' },
  { id: 'education', name: 'Education', color: 'from-violet-500/60 to-purple-500/60' },
  { id: 'creative', name: 'Creative & Digital', color: 'from-cyan-500/60 to-blue-500/60' },
  { id: 'events', name: 'Events & Food', color: 'from-red-500/60 to-orange-500/60' },
  { id: 'personal', name: 'Personal Care', color: 'from-green-500/60 to-emerald-500/60' },
  { id: 'digital', name: 'Digital Products', color: 'from-indigo-500/60 to-blue-500/60' },
  { id: 'blockchain', name: 'Blockchain Services', color: 'from-purple-500/60 to-pink-500/60' },
];

// All marketplace categories organized by parent group
const allCategories = [
  // GENERAL SERVICES (catch-all for common needs)
  { id: 1, name: 'Freelance Services', parent: 'general', icon: '💼', description: 'General freelance work & gigs' },
  { id: 2, name: 'Errands & Tasks', parent: 'general', icon: '📋', description: 'Shopping, pickups, general help' },
  { id: 3, name: 'Assembly & Installation', parent: 'general', icon: '🔧', description: 'Furniture assembly, equipment setup' },
  
  // HOME & PROPERTY SERVICES
  { id: 4, name: 'Home Cleaning', parent: 'home', icon: '🧹', description: 'Regular & deep cleaning' },
  { id: 5, name: 'Gardening & Landscaping', parent: 'home', icon: '🌱', description: 'Lawn care, garden design' },
  { id: 6, name: 'Home Repairs', parent: 'home', icon: '�', description: 'General repairs & maintenance' },
  { id: 7, name: 'Pest Control', parent: 'home', icon: '🐛', description: 'Fumigation & pest removal' },
  { id: 8, name: 'Security Services', parent: 'home', icon: '🛡️', description: 'Guards, alarms, CCTV' },
  { id: 9, name: 'Interior Design', parent: 'home', icon: '🎨', description: 'Room design & decor' },
  
  // TRANSPORTATION & LOGISTICS
  { id: 10, name: 'Ride Services', parent: 'transport', icon: '🚗', description: 'Taxi & ride-sharing' },
  { id: 11, name: 'Delivery & Courier', parent: 'transport', icon: '📦', description: 'Package & food delivery' },
  { id: 12, name: 'Moving Services', parent: 'transport', icon: '🚚', description: 'House & office moves' },
  { id: 13, name: 'Vehicle Rental', parent: 'transport', icon: '🔑', description: 'Cars, bakkies, equipment' },
  
  // SKILLED TRADES
  { id: 14, name: 'Construction', parent: 'trades', icon: '🏗️', description: 'Building & renovations' },
  { id: 15, name: 'Welding & Metalwork', parent: 'trades', icon: '⚒️', description: 'Gates, burglar bars' },
  { id: 16, name: 'Automotive Services', parent: 'trades', icon: '🔩', description: 'Mechanics & repairs' },
  { id: 17, name: 'Electrical Work', parent: 'trades', icon: '⚡', description: 'Wiring, solar, compliance' },
  { id: 18, name: 'Plumbing', parent: 'trades', icon: '🚰', description: 'Pipes, geysers, drains' },
  { id: 19, name: 'Appliance Repair', parent: 'trades', icon: '❄️', description: 'Fridge, stove, aircon' },
  
  // PROFESSIONAL SERVICES
  { id: 20, name: 'Legal Services', parent: 'professional', icon: '⚖️', description: 'Lawyers, contracts, wills' },
  { id: 21, name: 'Accounting', parent: 'professional', icon: '�', description: 'Tax, bookkeeping, payroll' },
  { id: 22, name: 'Business Consulting', parent: 'professional', icon: '📊', description: 'Strategy & planning' },
  { id: 23, name: 'Marketing', parent: 'professional', icon: '📢', description: 'Advertising & social media' },
  { id: 24, name: 'Real Estate', parent: 'professional', icon: '🏘️', description: 'Sales, rentals, valuations' },
  
  // EDUCATION & TRAINING
  { id: 25, name: 'Tutoring', parent: 'education', icon: '📚', description: 'School subjects & exam prep' },
  { id: 26, name: 'Language Lessons', parent: 'education', icon: '🗣️', description: 'All languages' },
  { id: 27, name: 'Music & Arts', parent: 'education', icon: '🎵', description: 'Instruments, singing, art' },
  { id: 28, name: 'Tech Training', parent: 'education', icon: '💻', description: 'Coding, software, IT' },
  { id: 29, name: 'Skills Development', parent: 'education', icon: '🎓', description: 'Professional training' },
  
  // CREATIVE & DIGITAL SERVICES
  { id: 30, name: 'Graphic Design', parent: 'creative', icon: '🎨', description: 'Logos, branding, graphics' },
  { id: 31, name: 'Photography', parent: 'creative', icon: '📸', description: 'Events, portraits, products' },
  { id: 32, name: 'Web Development', parent: 'creative', icon: '💻', description: 'Websites & apps' },
  { id: 33, name: 'Content Writing', parent: 'creative', icon: '✍️', description: 'Copywriting, articles, blogs' },
  { id: 34, name: 'Video Production', parent: 'creative', icon: '🎬', description: 'Videography & editing' },
  
  // EVENTS & FOOD SERVICES
  { id: 35, name: 'Event Planning', parent: 'events', icon: '🎉', description: 'Weddings, parties, corporate' },
  { id: 36, name: 'Catering', parent: 'events', icon: '🍽️', description: 'Event catering & meal prep' },
  { id: 37, name: 'Entertainment', parent: 'events', icon: '🎭', description: 'DJs, performers, MCs' },
  
  // PERSONAL CARE & WELLNESS
  { id: 38, name: 'Pet Services', parent: 'personal', icon: '🐾', description: 'Walking, sitting, grooming' },
  { id: 39, name: 'Beauty Services', parent: 'personal', icon: '💇', description: 'Hair, nails, makeup' },
  { id: 40, name: 'Fitness & Wellness', parent: 'personal', icon: '💪', description: 'Training, yoga, massage' },
  { id: 41, name: 'Childcare', parent: 'personal', icon: '👶', description: 'Babysitting, nannies' },
  { id: 42, name: 'Elderly Care', parent: 'personal', icon: '👴', description: 'Home healthcare, companions' },
  
  // DIGITAL PRODUCTS & ASSETS
  { id: 43, name: 'Design Templates', parent: 'digital', icon: '📐', description: 'Graphics, web, print templates' },
  { id: 44, name: 'Digital Art & NFTs', parent: 'digital', icon: '🖼️', description: 'Artwork, collectibles, avatars' },
  { id: 45, name: 'Music & Audio', parent: 'digital', icon: '🎧', description: 'Beats, samples, sound effects' },
  { id: 46, name: 'Software & Tools', parent: 'digital', icon: '⚙️', description: 'Plugins, scripts, apps' },
  { id: 47, name: 'Educational Content', parent: 'digital', icon: '�', description: 'Courses, ebooks, guides' },
  
  // BLOCKCHAIN SERVICES (from original list - practical ones)
  { id: 48, name: 'Smart Contracts', parent: 'blockchain', icon: '📜', description: 'Contract automation & escrow' },
  { id: 49, name: 'Digital Identity', parent: 'blockchain', icon: '🆔', description: 'Verified credentials & KYC' },
  { id: 50, name: 'Tokenization Services', parent: 'blockchain', icon: '🪙', description: 'Asset & IP tokenization' },
  { id: 51, name: 'NFT Minting', parent: 'blockchain', icon: '✨', description: 'Create & manage NFTs' },
  { id: 52, name: 'Crypto Consulting', parent: 'blockchain', icon: '�', description: 'Blockchain advisory & setup' },
];

const featuredCollections = [
  {
    title: 'General Services',
    items: 186,
    volume: '$124K',
    accent: 'from-blue-500/80 via-cyan-500/60 to-teal-500/80',
    description: 'Everyday tasks & freelance work',
  },
  {
    title: 'Skilled Trades',
    items: 342,
    volume: '$189K',
    accent: 'from-emerald-500/80 via-teal-500/70 to-green-500/80',
    description: 'Construction, electrical, plumbing',
  },
  {
    title: 'Creative & Digital',
    items: 412,
    volume: '$241K',
    accent: 'from-purple-500/80 via-indigo-500/70 to-blue-500/80',
    description: 'Design, development, content',
  },
  {
    title: 'Professional Services',
    items: 264,
    volume: '$156K',
    accent: 'from-pink-500/80 via-rose-500/70 to-red-500/80',
    description: 'Legal, accounting, consulting',
  },
  {
    title: 'Blockchain Services',
    items: 89,
    volume: '$78K',
    accent: 'from-purple-500/80 via-pink-500/70 to-fuchsia-500/80',
    description: 'Smart contracts, NFTs, tokenization',
  },
  {
    title: 'Digital Products',
    items: 523,
    volume: '$312K',
    accent: 'from-indigo-500/80 via-blue-500/70 to-cyan-500/80',
    description: 'Templates, NFTs, courses, tools',
  },
];

const quickFilterOptions = [
  { label: 'All services', value: 'all' },
  { label: 'Verified only', value: 'verified' },
  { label: 'Remote capable', value: 'remote' },
  { label: 'Top rated', value: 'topRated' },
  { label: 'Quick turnaround', value: 'quickTurnaround' },
  { label: 'In-person', value: 'inPerson' },
] as const;

type QuickFilterValue = (typeof quickFilterOptions)[number]['value'];

const parseResponseTimeToMinutes = (raw: string): number | null => {
  const match = raw.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(minute|hour)/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  if (Number.isNaN(value)) {
    return null;
  }

  const unit = match[2];
  if (unit.startsWith('hour')) {
    return Math.round(value * 60);
  }

  return Math.round(value);
};

const isRemoteListing = (listing: MarketplaceListing) =>
  listing.tags.includes('remote') || listing.location.toLowerCase().includes('remote');

const isQuickTurnaroundListing = (listing: MarketplaceListing) => {
  if (listing.tags.includes('instant')) {
    return true;
  }

  const minutes = parseResponseTimeToMinutes(listing.responseTime);
  if (minutes === null) {
    return false;
  }

  return minutes <= 120;
};

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
    actor: 'Sparkle Clean Co.',
    action: 'completed a service',
    subject: 'Home Deep Cleaning in Centurion',
    timestamp: '1m ago',
  },
  {
    actor: 'Green Thumb Gardens',
    action: 'uploaded completion certificate',
    subject: 'Garden Landscaping Project',
    timestamp: '6m ago',
  },
  {
    actor: 'QuickFix Auto',
    action: 'received a 5-star rating',
    subject: 'Mobile Mechanic Service',
    timestamp: '12m ago',
  },
  {
    actor: 'PowerPro Electrical',
    action: 'verified license updated',
    subject: 'Electrical Compliance Certificate',
    timestamp: '24m ago',
  },
  {
    actor: 'Perfect Day Events',
    action: 'accepted a booking',
    subject: 'Wedding Planning - December 2025',
    timestamp: '38m ago',
  },
  {
    actor: 'EduSmart Tutors',
    action: 'issued progress certificate',
    subject: 'Mathematics Grade 12 Tutoring',
    timestamp: '1h ago',
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'price_low' | 'price_high'>('newest');
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterValue>('all');
  const [showFeaturedCollections, setShowFeaturedCollections] = useState(true);
  const [previewListing, setPreviewListing] = useState<any | null>(null);
  const [bookingListing, setBookingListing] = useState<any | null>(null);
  const exploreScrollRef = useRef<HTMLDivElement | null>(null);
  const featuredSectionRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Use real marketplace data from hook
  const {
    listings,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refetch,
  } = useMarketplaceListings({
    limit: 20,
    search: searchTerm,
    sort: sortOption,
  });

  useEffect(() => {
    const node = exploreScrollRef.current;
    if (!node) {
      return;
    }

    const handleScroll = () => {
      if (node.scrollTop > 12 && showFeaturedCollections) {
        setShowFeaturedCollections(false);
      }
    };

    node.addEventListener('scroll', handleScroll);
    return () => {
      node.removeEventListener('scroll', handleScroll);
    };
  }, [showFeaturedCollections]);

  useEffect(() => {
    if (showFeaturedCollections) {
      exploreScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [showFeaturedCollections]);

  useEffect(() => {
    const node = featuredSectionRef.current;
    if (!node) {
      return undefined;
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        setShowFeaturedCollections(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const firstTouch = event.touches[0];
      touchStartYRef.current = firstTouch ? firstTouch.clientY : null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY ?? null;

      if (startY !== null && currentY !== null) {
        if (startY - currentY > 12) {
          setShowFeaturedCollections(false);
          touchStartYRef.current = null;
        }
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: true });
    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
    };
  }, [showFeaturedCollections]);

  const handleHideFeatured = () => setShowFeaturedCollections(false);
  const handleShowFeatured = () => setShowFeaturedCollections(true);
  const handleOpenPreview = (listing: any) => setPreviewListing(listing);
  const handleClosePreview = () => setPreviewListing(null);
  const handleOpenBooking = (listing: any) => setBookingListing(listing);
  const handleCloseBooking = () => setBookingListing(null);

  useEffect(() => {
    const hasOverlay = Boolean(previewListing || bookingListing);
    if (hasOverlay) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [previewListing, bookingListing]);

  // Filter listings by quick filter (tags)
  const filteredListings = useMemo(() => {
    if (activeQuickFilter === 'all') {
      return listings;
    }
    
    return listings.filter((listing) => {
      return listing.tags?.some((tag: string) => tag.toLowerCase() === activeQuickFilter.toLowerCase());
    });
  }, [listings, activeQuickFilter]);

  const resultsCount = filteredListings.length;
  const hasActiveFilters = activeQuickFilter !== 'all' || searchTerm.trim().length > 0;
  const hasModifiedSort = sortOption !== 'newest';

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleResetExploration = () => {
    setActiveQuickFilter('all');
    setSortOption('newest');
    setSearchTerm('');
  };

  const renderTagPills = (listing: any) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {listing.tags && listing.tags.slice(0, 4).map((tag: string) => (
        <span
          key={`${listing.id}-${tag}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60"
        >
          #{tag}
        </span>
      ))}
    </div>
  );

  const renderListingGridCard = (listing: any) => (
    <article
      key={listing.id}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl transition hover:border-white/20 hover:shadow-2xl"
    >
      <button
        type="button"
        onClick={() => handleOpenPreview(listing)}
        className="relative block aspect-square w-full overflow-hidden"
      >
        <span className="sr-only">View photo for {listing.title}</span>
        <IPFSImage
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(min-width: 1280px) 250px, (min-width: 1024px) 220px, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-3 text-xs text-white opacity-0 transition group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/20 px-2 py-0.5 font-semibold text-yellow-100">
            <StarSolidIcon className="h-3.5 w-3.5" />
            {listing.rating.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">{listing.reviews.toLocaleString()} reviews</span>
        </div>
      </button>

      <button
        type="button"
        aria-label="Save to favorites"
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-white/40 hover:bg-black/50"
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col p-2.5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/market/${listing.slug}`}
              className="block text-xs font-semibold text-white transition hover:text-blue-200 line-clamp-2"
            >
              {listing.title}
            </Link>
            <p className="mt-1 text-[9px] text-white/60 line-clamp-2">{listing.shortDescription}</p>
          </div>
          <StatusBadge tone={listing.badgeTone} label={listing.status} />
        </div>

        <div className="mb-2 flex items-center justify-between gap-2 text-[9px] text-white/60">
          <div className="flex items-center gap-1">
            <span className="text-white/50">by</span>
            {listing.provider && (
              <ProviderLinkCompact provider={listing.provider} />
            )}
          </div>
          <span className="text-white/40">Responds in {listing.responseTime}</span>
        </div>

        <p className="mb-2 text-[9px] text-white/50">📍 {listing.location}</p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] text-white/50">Price</p>
              <p className="text-sm font-bold text-white">{listing.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/market/${listing.slug}`}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                View details
              </Link>
              <button
                type="button"
                onClick={() => handleOpenBooking(listing)}
                className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
              >
                Book Now
              </button>
            </div>
          </div>

          {renderTagPills(listing)}
        </div>
      </div>
    </article>
  );

  const renderListingListItem = (listing: any) => (
    <article
      key={listing.id}
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl transition hover:border-white/20 hover:shadow-2xl md:flex-row md:items-stretch"
    >
      <button
        type="button"
        onClick={() => handleOpenPreview(listing)}
        className="relative aspect-video w-full overflow-hidden rounded-xl md:w-64"
      >
        <IPFSImage
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 256px, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 pb-2">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/20 px-2 py-0.5 font-semibold text-yellow-100">
              <StarSolidIcon className="h-3.5 w-3.5" />
              {listing.rating.toFixed(1)}
            </span>
            <span className="text-white/70">{listing.reviews.toLocaleString()} reviews</span>
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={listing.badgeTone} label={listing.status} />
            <h3 className="text-base font-semibold text-white">{listing.title}</h3>
          </div>
          <p className="text-sm text-white/70 line-clamp-2">{listing.longDescription}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
            <span className="font-semibold text-white">{listing.creator}</span>
            {listing.verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                <ShieldCheckIcon className="h-3 w-3" />
                Verified
              </span>
            )}
            <span>|</span>
            <span>Responds in {listing.responseTime}</span>
            <span>|</span>
            <span>📍 {listing.location}</span>
          </div>
          {renderTagPills(listing)}
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-3 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white/50">Starting at</span>
            <span className="text-lg font-semibold text-white">{listing.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/market/${listing.slug}`}
              className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
            >
              View details
            </Link>
            <button
              type="button"
              onClick={() => handleOpenBooking(listing)}
              className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <main className="relative flex h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

  <div className="relative mx-auto flex h-full w-full max-w-[1800px] gap-4 px-4 py-6">
        {/* LEFT SIDEBAR - Filters & Categories */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-3">
            {/* Hero CTA - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">Service Marketplace</p>
              <h2 className="mb-3 text-base font-bold leading-tight">Find & offer services</h2>
              <div className="space-y-1.5">
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-purple-500/80 px-3 py-2 text-xs font-semibold text-white shadow-xl transition hover:from-blue-500 hover:to-purple-500"
                >
                  <SparklesIcon className="mr-1.5 inline-block h-3.5 w-3.5" aria-hidden="true" />
                  List your service
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Connect Wallet
                </button>
              </div>
            </div>

            {/* Categories - Grouped */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <h3 className="text-xs font-semibold text-white">Browse Categories</h3>
              </div>
              <div className="relative">
                <nav className="max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  <ul className="space-y-2 text-xs">
                    {/* All Services */}
                    <li>
                      <button
                        type="button"
                        className="w-full rounded-lg px-2.5 py-1.5 text-left transition bg-white/10 font-semibold text-white"
                      >
                        All Services
                      </button>
                    </li>
                    
                    {/* Grouped Categories */}
                    {categoryGroups.map((group) => {

                    {previewListing ? (
                      <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
                        onClick={handleClosePreview}
                      >
                        <div
                          className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#151932] via-[#0f1730] to-[#0b1024] shadow-2xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={handleClosePreview}
                            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:border-white/40 hover:bg-black/40"
                            aria-label="Close preview"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                          <div className="relative h-64 w-full sm:h-96">
                            <IPFSImage
                              src={previewListing.image}
                              alt={previewListing.title}
                              fill
                              sizes="(min-width: 768px) 768px, 100vw"
                              className="object-cover"
                              priority
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-6 py-4">
                              <h3 className="text-lg font-semibold text-white">{previewListing.title}</h3>
                              <p className="text-sm text-white/70">{previewListing.shortDescription}</p>
                            </div>
                          </div>
                          <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
                            <div className="space-y-3 text-sm text-white/70">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">Provider:</span>
                                {previewListing.provider && (
                                  <ProviderLink provider={previewListing.provider} size="sm" showVerified />
                                )}
                              </div>
                              <p><span className="font-semibold text-white">Location:</span> {previewListing.location}</p>
                              <p><span className="font-semibold text-white">Price:</span> {previewListing.price}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  handleClosePreview();
                                  handleOpenBooking(previewListing);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
                              >
                                Book this service
                              </button>
                            </div>
                            <div className="space-y-2 text-sm text-white/70">
                              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Included Features</h4>
                              <ul className="space-y-2">
                                {previewListing.features && previewListing.features.map((feature: string) => (
                                  <li key={feature} className="flex items-start gap-2">
                                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-300" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {bookingListing ? (
                      <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
                        onClick={handleCloseBooking}
                      >
                        <div
                          className="w-full max-w-xl rounded-2xl border border-white/15 bg-gradient-to-br from-[#141b33] via-[#0d152d] to-[#080d1d] p-6 text-white shadow-2xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Booking</p>
                              <h3 className="text-lg font-semibold">{bookingListing.title}</h3>
                              <p className="text-sm text-white/70">by {bookingListing.creator}</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleCloseBooking}
                              aria-label="Close booking"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/10"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                              <span>Selected package</span>
                              <span className="font-semibold text-white">{bookingListing.price}</span>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                              <div className="flex items-center gap-2 text-white">
                                <CalendarDaysIcon className="h-4 w-4" />
                                <p className="text-sm font-semibold">Availability</p>
                              </div>
                              <p className="mt-1 text-xs text-white/60">{bookingListing.availability}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Included highlights</p>
                              <ul className="mt-2 space-y-1.5">
                                {bookingListing.features && bookingListing.features.slice(0, 3).map((feature: string) => (
                                  <li key={feature} className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-300" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={handleCloseBooking}
                              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-white/20 bg-gradient-to-r from-emerald-500/80 to-blue-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-500 hover:to-blue-500"
                            >
                              Confirm booking request
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                      const groupCategories = allCategories.filter(cat => cat.parent === group.id);
                      return (
                        <li key={group.id} className="space-y-1">
                          {/* Group Header with subtle glow */}
                          <div className="relative px-2.5 py-2 mt-2">
                            {/* Faint glowing line above */}
                            <div className="absolute top-0 left-2.5 right-2.5 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                            {/* Header text with subtle glow */}
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/90 drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]">
                              {group.name}
                            </div>
                          </div>
                          {/* Group Items */}
                          {groupCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              className="w-full rounded-lg px-2.5 py-1.5 text-left transition text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                              <span className="text-sm">{cat.icon}</span>
                              <span className="flex-1 line-clamp-1 text-[11px]">{cat.name}</span>
                            </button>
                          ))}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                {/* Fade effect at bottom */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a1532] via-[#0a1532]/80 to-transparent" />
              </div>
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
  <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          {/* Search & Filter Bar - Compact */}
          <header className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-xl backdrop-blur-2xl">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-xl">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search services, providers, locations..."
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
          {showFeaturedCollections ? (
            <section
              ref={featuredSectionRef}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl"
            >
              <div className="border-b border-white/10 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Featured Collections</h2>
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-semibold text-blue-200 hover:text-blue-100">See all</button>
                    <button
                      type="button"
                      onClick={handleHideFeatured}
                      className="text-xs font-semibold text-white/60 transition hover:text-white"
                    >
                      Hide
                    </button>
                  </div>
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
                        <p className="text-[9px] text-white/80 line-clamp-1">{collection.description}</p>
                        <p className="text-[10px] text-white/90">{collection.items} listings</p>
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
          ) : (
            <button
              type="button"
              onClick={handleShowFeatured}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-white/40 hover:text-white"
            >
              Show featured collections
            </button>
          )}

          {/* Product Grid - Compact */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
            <div className="border-b border-white/10 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Explore Marketplace</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/60">Sort:</span>
                  <select className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition focus:border-blue-400 focus:outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white">
                    <option>Trending</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div
              ref={exploreScrollRef}
              className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            >
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-blue-500"></div>
                    <p className="text-sm text-white/70">Loading marketplace...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <p className="text-sm text-red-300">Failed to load listings. Please try again.</p>
                  <button
                    onClick={refetch}
                    className="mt-4 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && filteredListings.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <p className="text-white/70">No listings found</p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetExploration}
                      className="mt-4 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Listings Grid */}
              {!isLoading && !error && filteredListings.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl transition hover:border-white/20 hover:shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(listing)}
                      className="relative block aspect-square w-full overflow-hidden"
                    >
                      <span className="sr-only">View photo for {listing.title}</span>
                      <IPFSImage
                        src={listing.image}
                        alt={listing.title}
                        fill
                        sizes="(min-width: 1280px) 250px, (min-width: 1024px) 220px, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </button>

                    <div className="flex flex-1 flex-col p-2.5">
                      <div className="mb-1.5 flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/market/${listing.slug}`}
                            className="block text-xs font-semibold text-white transition hover:text-blue-200 line-clamp-2"
                          >
                            {listing.title}
                          </Link>
                          <p className="mt-1 text-[9px] text-white/60 line-clamp-2">{listing.shortDescription}</p>
                        </div>
                        <StatusBadge tone={listing.badgeTone} label={listing.status} />
                      </div>
                      
                      <div className="mb-2 flex items-center gap-1.5 text-[9px] text-white/60">
                        <span className="text-white/50">by</span>
                        {listing.provider && (
                          <ProviderLinkCompact provider={listing.provider} />
                        )}
                      </div>
                      
                      <p className="mb-2 text-[9px] text-white/50">📍 {listing.location}</p>

                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] text-white/50">Price</p>
                            <p className="text-sm font-bold text-white">{listing.price}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(listing)}
                            className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
                          >
                            Book Now
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-white/50">
                          <span>Category: {listing.category}</span>
                          <Link
                            href={`/market/${listing.slug}`}
                            className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-200 transition hover:text-blue-100"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                </div>
              )}

              {/* Load More Button */}
              {!isLoading && !error && pagination && pagination.hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        Loading...
                      </span>
                    ) : (
                      `Load More (${pagination ? pagination.total - filteredListings.length : 0} remaining)`
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR - Compact */}
        <aside className="hidden w-72 flex-shrink-0 xl:block">
          <div className="sticky top-6 space-y-3">
            {/* Top Service Providers - Compact */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">Top Providers</h3>
                  <button className="text-[10px] font-semibold text-blue-200 hover:text-blue-100">See all</button>
                </div>
              </div>
              <div className="relative">
                <div className="max-h-72 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  <ul className="space-y-2">
                    {[
                      { name: 'Sparkle Clean Co.', revenue: '12.5K', rating: '4.9' },
                      { name: 'Green Thumb Gardens', revenue: '11.2K', rating: '4.8' },
                      { name: 'PowerPro Electrical', revenue: '10.8K', rating: '5.0' },
                      { name: 'Perfect Day Events', revenue: '9.4K', rating: '4.9' },
                      { name: 'CodeCraft Studios', revenue: '8.9K', rating: '4.7' },
                    ].map((provider, idx) => (
                      <li key={provider.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/60 to-blue-500/60 text-xs font-bold text-white">
                            {provider.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{provider.name}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[9px] text-white/60">${provider.revenue}</p>
                              <span className="text-[9px] text-emerald-300">★ {provider.rating}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-semibold text-white/60">#{idx + 1}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Fade effect at bottom */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a1532] via-[#0a1532]/80 to-transparent" />
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
              <div className="relative">
                <div className="max-h-80 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
                {/* Fade effect at bottom */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a1532] via-[#0a1532]/80 to-transparent" />
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
