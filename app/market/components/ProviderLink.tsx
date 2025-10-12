/**
 * Provider Link Component
 * 
 * Clickable provider name/avatar that links to provider profile page
 * Used in marketplace listing cards
 * 
 * Features:
 * - Links to /profile/[username]
 * - Shows verification badge
 * - Optional avatar display
 * - Optional rating display
 * - Stops event propagation (doesn't trigger listing click)
 */

'use client';

import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { IPFSImage } from '@/components/IPFSImage';

interface ProviderLinkProps {
  provider: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
    is_verified?: boolean;
    verification_level?: number;
    rating?: number;
    total_reviews?: number;
  };
  showAvatar?: boolean;
  showRating?: boolean;
  showVerified?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProviderLink({
  provider,
  showAvatar = false,
  showRating = false,
  showVerified = true,
  size = 'sm',
  className = '',
}: ProviderLinkProps) {
  // Size classes
  const sizeClasses = {
    xs: {
      text: 'text-[9px]',
      avatar: 'h-5 w-5',
      badge: 'text-[8px] px-1 py-0.5',
      icon: 'h-2.5 w-2.5',
      gap: 'gap-1',
    },
    sm: {
      text: 'text-xs',
      avatar: 'h-6 w-6',
      badge: 'text-[9px] px-1.5 py-0.5',
      icon: 'h-3 w-3',
      gap: 'gap-1.5',
    },
    md: {
      text: 'text-sm',
      avatar: 'h-8 w-8',
      badge: 'text-xs px-2 py-1',
      icon: 'h-3.5 w-3.5',
      gap: 'gap-2',
    },
    lg: {
      text: 'text-base',
      avatar: 'h-10 w-10',
      badge: 'text-xs px-2.5 py-1',
      icon: 'h-4 w-4',
      gap: 'gap-2',
    },
  }[size];

  // Render verification badge based on level
  const renderVerificationBadge = () => {
    if (!showVerified || !provider.is_verified) return null;

    // Different badge styles based on verification level
    const verificationLevels = [
      { min: 0, label: 'Verified', icon: ShieldCheckIcon, color: 'emerald' },
      { min: 2, label: 'Verified', icon: CheckBadgeIcon, color: 'blue' },
      { min: 3, label: 'Verified', icon: CheckBadgeIcon, color: 'purple' },
      { min: 4, label: 'Elite', icon: CheckBadgeIcon, color: 'yellow' },
    ];

    const level = [...verificationLevels]
      .reverse()
      .find((l) => (provider.verification_level || 0) >= l.min) || verificationLevels[0];
    
    const Icon = level.icon;

    const colorClasses = {
      emerald: 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200',
      blue: 'border-blue-400/30 bg-blue-500/20 text-blue-200',
      purple: 'border-purple-400/30 bg-purple-500/20 text-purple-200',
      yellow: 'border-yellow-400/30 bg-yellow-500/20 text-yellow-200',
    }[level.color];

    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full border font-semibold ${sizeClasses.badge} ${colorClasses}`}
      >
        <Icon className={sizeClasses.icon} aria-hidden="true" />
        {level.label}
      </span>
    );
  };

  // Stop propagation to prevent triggering parent click handlers (e.g., listing card click)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link
      href={`/profile/${provider.username}`}
      onClick={handleClick}
      className={`inline-flex items-center ${sizeClasses.gap} ${sizeClasses.text} font-semibold text-white/80 transition hover:text-blue-300 ${className}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className={`relative flex-shrink-0 overflow-hidden rounded-full ${sizeClasses.avatar}`}>
          {provider.avatar_url ? (
            <IPFSImage
              src={provider.avatar_url}
              alt={provider.display_name}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/70 to-purple-500/70 text-white text-[10px] font-semibold">
              {provider.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Provider Name */}
      <span className="truncate">{provider.display_name}</span>

      {/* Verification Badge */}
      {renderVerificationBadge()}

      {/* Rating */}
      {showRating && provider.rating !== undefined && provider.rating > 0 && (
        <span className="inline-flex items-center gap-0.5 text-white/70">
          <StarSolidIcon className={`text-yellow-400 ${sizeClasses.icon}`} />
          <span>{provider.rating.toFixed(1)}</span>
          {provider.total_reviews !== undefined && provider.total_reviews > 0 && (
            <span className="text-white/50">({provider.total_reviews})</span>
          )}
        </span>
      )}
    </Link>
  );
}

/**
 * Compact version for very small spaces (like grid cards)
 */
export function ProviderLinkCompact({
  provider,
  className = '',
}: {
  provider: {
    username: string;
    display_name: string;
    is_verified?: boolean;
  };
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link
      href={`/profile/${provider.username}`}
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-[9px] font-semibold text-white/80 transition hover:text-blue-300 ${className}`}
    >
      <span className="truncate">{provider.display_name}</span>
      {provider.is_verified && (
        <ShieldCheckIcon className="h-2.5 w-2.5 text-emerald-300" aria-hidden="true" />
      )}
    </Link>
  );
}

/**
 * Avatar-only version with tooltip
 */
export function ProviderAvatar({
  provider,
  size = 'md',
  showVerificationBadge = true,
  className = '',
}: {
  provider: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
    is_verified?: boolean;
    verification_level?: number;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showVerificationBadge?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size];

  const badgeClasses = {
    xs: 'h-2 w-2',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link
      href={`/profile/${provider.username}`}
      onClick={handleClick}
      title={`View ${provider.display_name}'s profile`}
      className={`group relative inline-block ${className}`}
    >
      <div className={`relative overflow-hidden rounded-full transition group-hover:ring-2 group-hover:ring-blue-400/50 ${sizeClasses}`}>
        {provider.avatar_url ? (
          <IPFSImage
            src={provider.avatar_url}
            alt={provider.display_name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/70 to-purple-500/70 text-sm font-semibold text-white">
            {provider.display_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Verification Badge Overlay */}
      {showVerificationBadge && provider.is_verified && (
        <div className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-0.5 ring-2 ring-[#0a1532] ${badgeClasses}`}>
          <CheckBadgeIcon className="h-full w-full text-white" />
        </div>
      )}
    </Link>
  );
}
