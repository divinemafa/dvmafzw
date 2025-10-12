import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLongLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Metadata } from 'next';
import { IPFSImage } from '@/components/IPFSImage';
import { CompactProviderInfo } from '../components/CompactProviderInfo';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: {
    listingSlug: string;
  };
}

// Fetch listing by slug directly from database (Server Component)
async function getListingBySlug(slug: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !anonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }
    
    const supabase = createClient(supabaseUrl, anonKey);
    
    const { data: listing, error } = await supabase
      .from('service_listings')
      .select(`
        *,
        provider:profiles(
          id,
          username,
          display_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          verification_level
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.listingSlug);
  
  if (!listing) {
    return {
      title: 'Listing not found • Bitcoin Mascot Marketplace',
    };
  }

  return {
    title: `${listing.title} • Bitcoin Mascot Marketplace`,
    description: listing.shortDescription,
  };
}

export default async function MarketplaceListingPage({ params }: ListingPageProps) {
  const listing = await getListingBySlug(params.listingSlug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] px-4 py-12 text-white">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <article className="relative z-10 w-full max-w-5xl space-y-8">
        <nav className="flex items-center justify-between text-xs text-white/60">
          <Link
            href="/market"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLongLeftIcon className="h-4 w-4" />
            Back to market
          </Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
            #{listing.id}
          </span>
        </nav>

        <header className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="relative h-72 w-full sm:h-[420px]">
            <IPFSImage
              src={listing.image}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">{listing.category}</p>
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl">{listing.title}</h1>
                  <p className="mt-2 max-w-xl text-sm text-white/70">{listing.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 font-semibold text-yellow-200">
                      <StarSolidIcon className="h-4 w-4" />
                      {listing.rating.toFixed(1)}
                    </span>
                    <span className="text-white/70">{listing.reviews.toLocaleString()} reviews</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/70">
                      <StarIcon className="h-3.5 w-3.5" />
                      Responds in {listing.responseTime}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Starting from</p>
                  <p className="text-2xl font-semibold text-white">{listing.price}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl">
              <h2 className="text-lg font-semibold text-white">About this service</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{listing.longDescription}</p>
            </div>

            {listing.features && listing.features.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">What&apos;s included</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {listing.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Availability</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <CalendarDaysIcon className="h-5 w-5" />
                <p>{listing.availability}</p>
              </div>
              {listing.tags && listing.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            {/* Provider Info */}
            {listing.provider && (
              <CompactProviderInfo provider={listing.provider} showStats />
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
              <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Ready to book?</h3>
              <p className="mt-2 text-sm text-white/70">
                Share your preferred date, location, and any project details. The provider will confirm within a few hours.
              </p>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Project title</span>
                  <input
                    type="text"
                    placeholder="e.g. Deep clean before moving"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Preferred date</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Additional notes</span>
                  <textarea
                    rows={3}
                    placeholder="Tell us anything important about your project."
                    className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-gradient-to-r from-blue-500/80 to-purple-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500"
              >
                <UserIcon className="h-4 w-4" />
                Submit booking request
              </button>
              <p className="mt-2 text-[11px] text-white/50">No payment required yet. You&apos;ll finalise the booking once the provider confirms availability.</p>
            </div>
          </aside>
        </section>
      </article>
    </main>
  );
}
