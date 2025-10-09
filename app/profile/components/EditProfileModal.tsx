/**
 * Edit Profile Modal
 * 
 * Comprehensive profile editing with all database fields
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  CameraIcon,
  MapPinIcon,
  GlobeAltIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import { ImageCropperModal } from './ImageCropperModal';
import { SocialLinksEditor } from './SocialLinksEditor';
import type { UserProfile, SocialLinks } from '../types';

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
    // Financial/Payment fields (for all user types)
    bank_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    bank_swift_code: '',
    preferred_currency: 'USD',
    preferred_payout_currency: 'USD',
    // Service provider specific
    service_area_radius_km: 50,
    instant_booking_enabled: false,
    allow_same_day_bookings: true,
    max_advance_booking_days: 90,
    minimum_booking_notice_hours: 24,
    // Business specific
    business_name: '',
    business_registration_number: '',
    tax_id: '',
    business_type: '',
    // Social media links
    social_links: profile.social_links || {},
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState({
    images: true,
    basic: true,
    location: false,
    social: false,
    financial: false,
    provider: false,
    business: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Determine user access level
  const isServiceProvider = profile.user_type === 'service';
  const isBusiness = profile.user_type === 'business';
  const isIndividual = profile.user_type === 'individual';
  
  // TODO: Add admin role check from database
  const isAdmin = false; // Will be implemented with admin role system

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
        // Financial/Payment fields (load from profile)
        bank_name: profile.bank_name || '',
        bank_account_number: profile.bank_account_number || '',
        bank_routing_number: profile.bank_routing_number || '',
        bank_swift_code: profile.bank_swift_code || '',
        preferred_currency: profile.preferred_currency || 'USD',
        preferred_payout_currency: profile.preferred_payout_currency || 'USD',
        // Service provider specific (load from profile)
        service_area_radius_km: profile.service_area_radius_km || 50,
        instant_booking_enabled: profile.instant_booking_enabled || false,
        allow_same_day_bookings: profile.allow_same_day_bookings !== null ? profile.allow_same_day_bookings : true,
        max_advance_booking_days: profile.max_advance_booking_days || 90,
        minimum_booking_notice_hours: profile.minimum_booking_notice_hours || 24,
        // Business specific (load from profile)
        business_name: profile.business_name || '',
        business_registration_number: profile.business_registration_number || '',
        tax_id: profile.tax_id || '',
        business_type: profile.business_type || '',
        // Social media links (load from profile)
        social_links: profile.social_links || {},
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setCropType(type);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropped image from cropper modal
  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File(
      [croppedBlob],
      `${cropType}-${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    );

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedBlob);

    if (cropType === 'avatar') {
      setAvatarFile(croppedFile);
      setAvatarPreview(previewUrl);
    } else {
      setCoverFile(croppedFile);
      setCoverPreview(previewUrl);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a1532] shadow-2xl">
        {/* Compact Header */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-white/10 bg-[#0a1532] px-6 py-3 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Compact Messages */}
        {success && (
          <div className="mx-6 mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            ✓ Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="mx-6 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          {/* COLLAPSIBLE: Profile Images */}
          <div className="rounded-lg border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleSection('images')}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <CameraIcon className="h-4 w-4 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Profile Images</h3>
              </div>
              {expandedSections.images ? (
                <ChevronUpIcon className="h-4 w-4 text-white/60" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white/60" />
              )}
            </button>
            
            {expandedSections.images && (
              <div className="space-y-3 px-4 pb-4">
            
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Avatar Upload with Small Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  <CameraIcon className="mr-1.5 inline-block h-4 w-4" />
                  Avatar
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Small Avatar Preview */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {(avatarPreview || profile.avatar_url) ? (
                      <Image
                        src={avatarPreview || profile.avatar_url || ''}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/30">
                        <CameraIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
                    Change Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-white/40">1:1 ratio, max 5MB</p>
              </div>

              {/* Cover Upload with Small Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  <CameraIcon className="mr-1.5 inline-block h-4 w-4" />
                  Cover
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Small Cover Preview */}
                  <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {(coverPreview || profile.cover_image_url) ? (
                      <Image
                        src={coverPreview || profile.cover_image_url || ''}
                        alt="Cover"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/30">
                        <CameraIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
                    Change Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-white/40">16:9 ratio, max 10MB</p>
              </div>
            </div>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE: Basic Information */}
          <div className="rounded-lg border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
            >
              <h3 className="text-base font-semibold text-white">Basic Information</h3>
              {expandedSections.basic ? (
                <ChevronUpIcon className="h-4 w-4 text-white/60" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white/60" />
              )}
            </button>
            
            {expandedSections.basic && (
              <div className="space-y-3 px-4 pb-4">
            
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Display Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Your display name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="+27821234567"
                />
              </div>
            </div>

            {/* Bio - Full Width */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                placeholder="Tell others about yourself..."
              />
              <p className="mt-1 text-xs text-white/40">{formData.bio.length}/500</p>
            </div>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE: Location */}
          <div className="rounded-lg border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Location</h3>
              </div>
              {expandedSections.location ? (
                <ChevronUpIcon className="h-4 w-4 text-white/60" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white/60" />
              )}
            </button>
            
            {expandedSections.location && (
              <div className="space-y-3 px-4 pb-4">
            
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Country Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Country
                </label>
                <select
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                >
                  <option value="">Select</option>
                  <option value="ZA">🇿🇦 ZA</option>
                  <option value="NG">🇳🇬 NG</option>
                  <option value="KE">🇰🇪 KE</option>
                  <option value="US">🇺🇸 US</option>
                  <option value="GB">🇬🇧 GB</option>
                  <option value="CA">🇨🇦 CA</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Cape Town"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="8001"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* State/Province */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Western Cape"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Street address"
                />
              </div>
            </div>

            {/* Address Line 2 - Optional */}
            <div>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE: Social Media Links - ALL USERS */}
          <div className="rounded-lg border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleSection('social')}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-4 w-4 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Social Media Links</h3>
              </div>
              {expandedSections.social ? (
                <ChevronUpIcon className="h-4 w-4 text-white/60" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white/60" />
              )}
            </button>
            {expandedSections.social && (
              <div className="border-t border-white/10 px-4 py-4">
                <SocialLinksEditor
                  socialLinks={formData.social_links}
                  onChange={(links) => setFormData({ ...formData, social_links: links })}
                />
              </div>
            )}
          </div>

          {/* COLLAPSIBLE: Financial & Payment - ALL USERS */}
          <div className="rounded-lg border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleSection('financial')}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Financial & Payment</h3>
              </div>
              {expandedSections.financial ? (
                <ChevronUpIcon className="h-4 w-4 text-white/60" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white/60" />
              )}
            </button>
            
            {expandedSections.financial && (
              <div className="space-y-3 px-4 pb-4">
            
            {/* Cryptocurrency Wallet */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Solana Wallet Address
              </label>
              <input
                type="text"
                value={formData.primary_wallet_address}
                onChange={(e) => setFormData({ ...formData, primary_wallet_address: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none focus:border-blue-500"
                placeholder="Your Solana wallet address"
              />
              <p className="mt-1 text-xs text-white/40">
                For BMC token rewards & cryptocurrency payments
              </p>
            </div>

            {/* Currency Preferences */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Preferred Currency
                </label>
                <select
                  value={formData.preferred_currency}
                  onChange={(e) => setFormData({ ...formData, preferred_currency: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                >
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="GBP">🇬🇧 GBP - British Pound</option>
                  <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                  <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
                  <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Payout Currency
                </label>
                <select
                  value={formData.preferred_payout_currency}
                  onChange={(e) => setFormData({ ...formData, preferred_payout_currency: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="ZAR">🇿🇦 ZAR</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                  <option value="USDC">💵 USDC (Stablecoin)</option>
                  <option value="SOL">◎ SOL (Solana)</option>
                </select>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <CreditCardIcon className="h-4 w-4" />
                Bank Account (Fiat Payments)
              </h4>
              
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="e.g., Standard Bank"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="Account number"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      Routing/Sort Code
                    </label>
                    <input
                      type="text"
                      value={formData.bank_routing_number}
                      onChange={(e) => setFormData({ ...formData, bank_routing_number: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="e.g., 051001"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      SWIFT/BIC Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.bank_swift_code}
                      onChange={(e) => setFormData({ ...formData, bank_swift_code: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      placeholder="For international"
                    />
                  </div>
                </div>

                <p className="text-xs text-white/40">
                  🔒 Your bank details are encrypted and securely stored
                </p>
              </div>
            </div>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE: SERVICE PROVIDER SETTINGS - Only for service providers and businesses */}
          {(isServiceProvider || isBusiness || isAdmin) && (
            <div className="rounded-lg border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => toggleSection('provider')}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">Service Provider Settings</h3>
                </div>
                {expandedSections.provider ? (
                  <ChevronUpIcon className="h-4 w-4 text-white/60" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-white/60" />
                )}
              </button>
              
              {expandedSections.provider && (
                <div className="space-y-3 px-4 pb-4">

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    value={formData.service_area_radius_km}
                    onChange={(e) => setFormData({ ...formData, service_area_radius_km: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="50"
                    min="1"
                    max="500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Min Notice (hrs)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_booking_notice_hours}
                    onChange={(e) => setFormData({ ...formData, minimum_booking_notice_hours: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="24"
                    min="0"
                    max="168"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Max Advance (days)
                  </label>
                  <input
                    type="number"
                    value={formData.max_advance_booking_days}
                    onChange={(e) => setFormData({ ...formData, max_advance_booking_days: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="90"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={formData.instant_booking_enabled}
                    onChange={(e) => setFormData({ ...formData, instant_booking_enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Instant Booking</p>
                    <p className="text-xs text-white/50">No approval needed</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={formData.allow_same_day_bookings}
                    onChange={(e) => setFormData({ ...formData, allow_same_day_bookings: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Same-Day</p>
                    <p className="text-xs text-white/50">Today&apos;s bookings</p>
                  </div>
                </label>
              </div>
                </div>
              )}
            </div>
          )}

          {/* COLLAPSIBLE: BUSINESS SETTINGS - Only for businesses and admins */}
          {(isBusiness || isAdmin) && (
            <div className="rounded-lg border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => toggleSection('business')}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-orange-400" />
                  <h3 className="text-base font-semibold text-white">Business Information</h3>
                </div>
                {expandedSections.business ? (
                  <ChevronUpIcon className="h-4 w-4 text-white/60" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-white/60" />
                )}
              </button>
              
              {expandedSections.business && (
                <div className="space-y-3 px-4 pb-4">

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Business Type
                  </label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                  >
                    <option value="">Select type</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietor">Sole Proprietor</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.business_registration_number}
                    onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Company registration no."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">
                    Tax ID / VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Tax identification"
                  />
                </div>
              </div>
                </div>
              )}
            </div>
          )}

          {/* Compact Action Buttons */}
          <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t border-white/10 bg-[#0a1532] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropImageSrc}
        cropType={cropType}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
