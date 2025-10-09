/**
 * Profile Header Component
 * 
 * Displays user avatar, name, verification status, and basic stats
 */

import {
  CameraIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BriefcaseIcon,
  SparklesIcon,
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

  // Calculate profile completeness percentage
  const calculateProfileCompleteness = () => {
    const fields = [
      profile.display_name,
      profile.bio,
      profile.avatar_url,
      profile.cover_image_url,
      profile.phone_number,
      profile.city,
      profile.country_code,
      profile.primary_wallet_address,
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Get verification level display
  const getVerificationLevelDisplay = () => {
    if (!verification) return { level: 0, label: 'Unverified' };
    
    const levelMap = {
      'level_0_unverified': { level: 0, label: 'Unverified' },
      'level_1_email': { level: 1, label: 'Email Verified' },
      'level_2_phone': { level: 2, label: 'Phone Verified' },
      'level_3_id': { level: 3, label: 'ID Verified' },
      'level_4_bank': { level: 4, label: 'Fully Verified' },
    };
    
    return levelMap[verification.current_level] || { level: 0, label: 'Unverified' };
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    const typeMap = {
      'service': 'Service Provider',
      'business': 'Business',
      'individual': 'Individual',
    };
    return typeMap[profile.user_type] || 'Individual';
  };

  const profileCompleteness = calculateProfileCompleteness();
  const verificationLevel = getVerificationLevelDisplay();

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      {/* Cover Photo - Reduced height */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20">
        {profile.cover_image_url && (
          <Image
            src={profile.cover_image_url}
            alt="Profile cover"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        )}
      </div>

      <div className="relative px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">
          {/* Avatar - Smaller size */}
          <div className="-mt-12 mb-3 sm:mb-0">
            <div className="relative inline-block">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User avatar'}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-3 border-[#0a1532] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-3 border-[#0a1532] bg-gradient-to-br from-purple-500 to-blue-500 text-3xl font-bold">
                  {getInitials(profile.display_name)}
                </div>
              )}
              <button className="absolute bottom-0 right-0 rounded-full border-2 border-[#0a1532] bg-blue-500 p-1.5 text-white transition hover:bg-blue-600">
                <CameraIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{profile.display_name}</h2>
                  {isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <ShieldCheckIcon className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}
                  {profile.status !== 'active' && (
                    <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-300">
                      {profile.status}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-white/60">
                  Member since {formatJoinDate(profile.created_at)}
                </p>
              </div>
              <button 
                onClick={onEditProfile}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
              >
                <PencilSquareIcon className="mr-1.5 inline-block h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Personal Dashboard Stats - More compact */}
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Account Type */}
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <UserCircleIcon className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-[10px] text-white/50">Account Type</p>
                  <p className="text-xs font-semibold">{getUserTypeDisplay()}</p>
                </div>
              </div>

              {/* Verification Level */}
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <ShieldCheckIcon className={`h-4 w-4 ${verificationLevel.level >= 2 ? 'text-emerald-400' : 'text-yellow-400'}`} />
                <div>
                  <p className="text-[10px] text-white/50">Verification</p>
                  <p className="text-xs font-semibold">{verificationLevel.label}</p>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <BriefcaseIcon className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="text-[10px] text-white/50">Profile</p>
                  <p className="text-xs font-semibold">{profileCompleteness}% Complete</p>
                </div>
              </div>

              {/* Premium Status */}
              {profile.is_premium && (
                <div className="flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2 py-1.5">
                  <SparklesIcon className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-[10px] text-yellow-300/70">Status</p>
                    <p className="text-xs font-semibold text-yellow-300">Premium Member</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
