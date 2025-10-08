/**
 * Edit Profile Modal
 * 
 * Comprehensive profile editing with all database fields
 */

'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CameraIcon,
  MapPinIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import type { UserProfile } from '../types';

interface EditProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const { updateProfile, uploadAvatar, uploadCoverImage, updating } = useProfileUpdate();
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    bio: profile.bio || '',
    phone_number: profile.phone_number || '',
    country_code: profile.country_code || '',
    city: profile.city || '',
    state: profile.state || '',
    postal_code: profile.postal_code || '',
    address_line1: profile.address_line1 || '',
    address_line2: profile.address_line2 || '',
    primary_wallet_address: profile.primary_wallet_address || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        bio: profile.bio || '',
        phone_number: profile.phone_number || '',
        country_code: profile.country_code || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        primary_wallet_address: profile.primary_wallet_address || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // Upload avatar if selected
      if (avatarFile) {
        const { error: avatarError } = await uploadAvatar(profile.id, avatarFile);
        if (avatarError) throw new Error(avatarError);
      }

      // Upload cover if selected
      if (coverFile) {
        const { error: coverError } = await uploadCoverImage(profile.id, coverFile);
        if (coverError) throw new Error(coverError);
      }

      // Update profile data
      const result = await updateProfile(profile.id, formData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'avatar') {
        setAvatarFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  if (!isOpen) {
    console.log('EditProfileModal: Not rendering (isOpen = false)');
    return null;
  }

  console.log('EditProfileModal: RENDERING! Profile:', profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a1532] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            ✓ Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Profile Images</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Avatar Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  <CameraIcon className="mr-2 inline-block h-4 w-4" />
                  Avatar Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-500/20 file:px-4 file:py-2 file:text-blue-300 file:transition hover:file:bg-blue-500/30"
                />
                <p className="mt-1 text-xs text-white/50">Max 5MB, square ratio recommended</p>
              </div>

              {/* Cover Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  <CameraIcon className="mr-2 inline-block h-4 w-4" />
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-500/20 file:px-4 file:py-2 file:text-blue-300 file:transition hover:file:bg-blue-500/30"
                />
                <p className="mt-1 text-xs text-white/50">Max 10MB, 16:9 ratio recommended</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Your display name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Tell others about yourself..."
              />
              <p className="mt-1 text-xs text-white/50">{formData.bio.length}/500 characters</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="+27 82 123 4567"
              />
              <p className="mt-1 text-xs text-white/50">Include country code (e.g., +27)</p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <MapPinIcon className="h-5 w-5" />
              Location
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Country Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Country Code
                </label>
                <select
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select country</option>
                  <option value="ZA">🇿🇦 South Africa</option>
                  <option value="NG">🇳🇬 Nigeria</option>
                  <option value="KE">🇰🇪 Kenya</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="CA">🇨🇦 Canada</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Cape Town"
                />
              </div>

              {/* State/Province */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Western Cape"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="8001"
                />
              </div>
            </div>

            {/* Address Lines */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
          </div>

          {/* Blockchain Wallet */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <GlobeAltIcon className="h-5 w-5" />
              Blockchain Wallet
            </h3>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Primary Wallet Address (Solana)
              </label>
              <input
                type="text"
                value={formData.primary_wallet_address}
                onChange={(e) => setFormData({ ...formData, primary_wallet_address: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-white outline-none focus:border-blue-500"
                placeholder="Your Solana wallet address"
              />
              <p className="mt-1 text-xs text-white/50">
                Used for BMC token rewards and crypto payments
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
