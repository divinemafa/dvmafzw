/**
 * Compact Provider Info Component
 * 
 * Displays provider information in a compact card format
 * Used inside listing detail pages to show provider info without leaving the page
 * Clickable to navigate to full provider profile
 */

'use client';

import Link from 'next/link';
import {
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { IPFSImage } from '@/components/IPFSImage';

interface ProviderInfoProps {
  provider: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    rating: number;
    total_reviews: number;
    is_verified: boolean;
    verification_level: number;
    is_premium?: boolean;
    location?: string;
    services_completed?: number;
    response_time?: string;
  };
  showStats?: boolean;
  className?: string;
}

export function CompactProviderInfo({ provider, showStats = true, className = '' }: ProviderInfoProps) {
  // Render verification badge based on level
  const renderVerificationBadge = () => {
    if (!provider.is_verified) return null;

    const levels = [
      { min: 0, label: 'Verified', color: 'emerald', icon: CheckBadgeIcon },
      { min: 2, label: 'Pro', color: 'blue', icon: CheckBadgeIcon },
      { min: 3, label: 'Expert', color: 'purple', icon: CheckBadgeIcon },
      { min: 4, label: 'Elite', color: 'yellow', icon: CheckBadgeIcon },
    ];

    const level = [...levels].reverse().find(l => provider.verification_level >= l.min) || levels[0];
    const Icon = level.icon;
    
    const colorClasses = {
      emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
      blue: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
      purple: 'border-purple-400/30 bg-purple-500/10 text-purple-200',
      yellow: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
    }[level.color];

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colorClasses}`}>
        <Icon className="h-3 w-3" />
        {level.label}
      </span>
    );
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-2xl ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Provider</h3>
        <Link
          href={`/profile/${provider.username}`}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          View Profile →
        </Link>
      </div>

      {/* Provider Header */}
      <Link
        href={`/profile/${provider.username}`}
        className="mt-4 flex items-center gap-3 group"
      >
        {/* Avatar */}
        <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden">
          {provider.avatar_url ? (
            <IPFSImage
              src={provider.avatar_url}
              alt={provider.display_name}
              fill
              sizes="56px"
              className="object-cover transition duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/70 to-purple-500/70 text-lg font-semibold text-white">
              {provider.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white group-hover:text-blue-300 truncate">
              {provider.display_name}
            </p>
            {renderVerificationBadge()}
          </div>
          <p className="text-xs text-white/60">@{provider.username}</p>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1 text-xs">
            <StarSolidIcon className="h-3.5 w-3.5 text-yellow-400" />
            <span className="font-semibold text-white">{provider.rating.toFixed(1)}</span>
            <span className="text-white/60">({provider.total_reviews} reviews)</span>
          </div>
        </div>
      </Link>

      {/* Additional Stats */}
      {showStats && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {provider.location && (
            <div className="flex items-center gap-2 text-xs text-white/70">
              <MapPinIcon className="h-4 w-4 text-white/50" />
              <span>{provider.location}</span>
            </div>
          )}
          
          {provider.response_time && (
            <div className="flex items-center gap-2 text-xs text-white/70">
              <ClockIcon className="h-4 w-4 text-white/50" />
              <span>Responds in {provider.response_time}</span>
            </div>
          )}

          {typeof provider.services_completed === 'number' && provider.services_completed > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/70">
              <ShoppingBagIcon className="h-4 w-4 text-white/50" />
              <span>{provider.services_completed} services completed</span>
            </div>
          )}
        </div>
      )}

      {/* Premium Badge */}
      {provider.is_premium && (
        <div className="mt-3 rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-2 text-center">
          <p className="text-xs font-semibold text-yellow-200">⭐ Premium Provider</p>
        </div>
      )}
    </div>
  );
}
