/**
 * Profile Info Section
 * 
 * Displays user's contact information, bio, and languages
 */

import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../types';

interface ProfileInfoSectionProps {
  profile: UserProfile;
}

export function ProfileInfoSection({ profile }: ProfileInfoSectionProps) {
  // Parse languages from bio or use defaults
  const languages = ['English']; // TODO: Add languages field to profile schema

  return (
    <div className="space-y-4">
      {/* Contact Information */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                <EnvelopeIcon className="h-4 w-4" />
                Email
              </div>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                <PhoneIcon className="h-4 w-4" />
                Phone
              </div>
              <p className="font-medium">
                {profile.phone_number || 'Not provided'}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                <MapPinIcon className="h-4 w-4" />
                Location
              </div>
              <p className="font-medium">
                {profile.location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">About Me</h3>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-white/80">
            {profile.bio || 'No bio added yet. Tell others about yourself and your services.'}
          </p>
          <button className="mt-4 text-sm font-semibold text-blue-300 hover:text-blue-200">
            Edit Bio →
          </button>
        </div>
      </div>

      {/* Languages */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Languages</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, idx) => (
              <span
                key={idx}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium"
              >
                {lang}
              </span>
            ))}
            <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
              + Add Language
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
