/**
 * Profile Header Component
 * 
 * Displays user avatar, name, verification status, and basic stats
 */

import {
  CameraIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { UserProfile, UserVerification } from '../types';

interface ProfileHeaderProps {
  profile: UserProfile;
  verification: UserVerification | null;
  onEditProfile: () => void;
}

export function ProfileHeader({ profile, verification, onEditProfile }: ProfileHeaderProps) {
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format date for "Member since"
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check if user is verified (email + phone minimum)
  const isVerified = verification?.email_verified && verification?.phone_verified;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      {/* Cover Photo */}
      <div className="relative h-40 overflow-hidden">
        {profile.cover_image_url ? (
          <div
            aria-label={`${profile.display_name || 'User'} cover image`}
            role="img"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.cover_image_url})` }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10" />
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <div className="-mt-16 mb-4 sm:mb-0">
            <div className="relative inline-block">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User avatar'}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full border-4 border-[#0a1532] object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#0a1532] bg-gradient-to-br from-purple-500 to-blue-500 text-4xl font-bold">
                  {getInitials(profile.display_name)}
                </div>
              )}
              <button className="absolute bottom-0 right-0 rounded-full border-2 border-[#0a1532] bg-blue-500 p-2 text-white transition hover:bg-blue-600">
                <CameraIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                  {isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                      <ShieldCheckIcon className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {profile.status !== 'active' && (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-300">
                      {profile.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/60">
                  Member since {formatJoinDate(profile.created_at)}
                </p>
              </div>
              <button 
                onClick={onEditProfile}
                className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                <PencilSquareIcon className="mr-2 inline-block h-4 w-4" />
                Edit Profile
              </button>
            </div>

            {/* Stats - Placeholder for future features */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">New</span>
                <span className="text-white/60">(No reviews yet)</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-white/60">
                <ClockIcon className="h-4 w-4" />
                <span>Response time: N/A</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-white/60">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Completion rate: N/A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
