/**
 * Public Provider Profile Page
 * 
 * View-only profile page for marketplace providers
 * Accessible at /profile/[username]
 * 
 * Features:
 * - Provider information display
 * - Active listings grid
 * - Stats and verification badges
 * - Responsive design with glassmorphism
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLongLeftIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  MapPinIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Metadata } from 'next';
import { IPFSImage } from '@/components/IPFSImage';

// Force dynamic rendering (fetch fresh data on each request)
export const dynamic = 'force-dynamic';

interface ProviderProfilePageProps {
  params: {
    username: string;
  };
}

interface Listing {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  price: number;
  currency: string;
  price_display: string | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  views: number;
  status: string;
  created_at: string;
}

// Fetch provider profile data
async function getProviderProfile(username: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/profiles/${username}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProviderProfilePageProps): Promise<Metadata> {
  const data = await getProviderProfile(params.username);
  
  if (!data || !data.profile) {
    return {
      title: 'Provider not found • Bitcoin Mascot',
    };
  }

  const { profile } = data;

  return {
    title: `${profile.display_name} (@${profile.username}) • Bitcoin Mascot`,
    description: profile.bio || `View ${profile.display_name}'s profile and services on Bitcoin Mascot marketplace`,
  };
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const data = await getProviderProfile(params.username);

  if (!data || !data.profile) {
    notFound();
  }

  const { profile, listings, stats } = data;

  // Render verification badge based on level
  const renderVerificationBadge = () => {
    if (!profile.is_verified) return null;

    const levels = [
      { min: 0, label: 'Verified', color: 'emerald' },
      { min: 1, label: 'Verified', color: 'emerald' },
      { min: 2, label: 'Verified Pro', color: 'blue' },
      { min: 3, label: 'Verified Expert', color: 'purple' },
      { min: 4, label: 'Premium Elite', color: 'yellow' },
    ];

    const level = levels.find(l => profile.verification_level >= l.min) || levels[0];
    const colorClasses = {
      emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
      blue: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
      purple: 'border-purple-400/30 bg-purple-500/10 text-purple-200',
      yellow: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
    }[level.color];

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colorClasses}`}>
        <CheckBadgeIcon className="h-4 w-4" />
        {level.label}
      </span>
    );
  };

  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] px-4 py-12 text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-8">
        {/* Back navigation */}
        <nav className="flex items-center justify-between">
          <Link
            href="/market"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLongLeftIcon className="h-4 w-4" />
            Back to marketplace
          </Link>
        </nav>

        {/* Profile Header with Cover Image */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          {/* Cover Image */}
          {profile.cover_image_url ? (
            <div className="relative h-48 w-full sm:h-64">
              <IPFSImage
                src={profile.cover_image_url}
                alt={`${profile.display_name} cover`}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-48 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 sm:h-64" />
          )}

          {/* Profile Info */}
          <div className="relative -mt-16 px-6 pb-6 sm:-mt-20 sm:px-8">
            {/* Avatar */}
            <div className="flex items-end gap-6">
              <div className="relative h-28 w-28 rounded-2xl border-4 border-[#0a1532] sm:h-36 sm:w-36">
                {profile.avatar_url ? (
                  <IPFSImage
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    fill
                    sizes="144px"
                    className="rounded-xl object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/70 to-purple-500/70 text-4xl font-semibold text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl">{profile.display_name}</h1>
                  {renderVerificationBadge()}
                  {profile.is_premium && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                      <StarSolidIcon className="h-4 w-4" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/60">@{profile.username}</p>

                {/* Stats */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold text-white">{profile.rating.toFixed(1)}</span>
                    <span className="text-white/60">({stats.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <ShoppingBagIcon className="h-4 w-4" />
                    <span>{stats.servicesCompleted} completed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <ClockIcon className="h-4 w-4" />
                    <span>Responds in {stats.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio and Location */}
            <div className="mt-6 space-y-4">
              {profile.bio && (
                <p className="text-sm leading-relaxed text-white/80">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
                  >
                    <GlobeAltIcon className="h-4 w-4" />
                    Website
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4" />
                  Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Active Listings</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.activeListings}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Total Bookings</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.totalBookings}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Success Rate</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.successRate}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Avg Rating</p>
            <p className="mt-2 text-3xl font-semibold text-white">{profile.rating.toFixed(1)}</p>
          </div>
        </div>

        {/* Active Listings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Active Listings</h2>
            <span className="text-sm text-white/60">{listings.length} services</span>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing: Listing) => (
                <Link
                  key={listing.id}
                  href={`/market/${listing.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl transition hover:border-white/20 hover:bg-white/10"
                >
                  {/* Listing Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {listing.image_url ? (
                      <IPFSImage
                        src={listing.image_url}
                        alt={listing.title}
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Listing Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-blue-300">
                      {listing.title}
                    </h3>
                    {listing.short_description && (
                      <p className="mt-2 line-clamp-2 text-xs text-white/60">
                        {listing.short_description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-white">{listing.rating.toFixed(1)}</span>
                        <span className="text-white/60">({listing.reviews_count})</span>
                      </div>
                      <p className="text-base font-semibold text-white">
                        {listing.price_display || `${listing.price} ${listing.currency}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-xl backdrop-blur-2xl">
              <p className="text-white/60">No active listings at the moment</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
