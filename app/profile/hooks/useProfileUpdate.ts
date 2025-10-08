/**
 * Profile Update Hook
 * 
 * Handles all profile, verification, and settings updates to Supabase
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserSettings } from '../types';

interface UpdateResult {
  success: boolean;
  error: string | null;
}

export function useProfileUpdate() {
  const supabase = createClient();
  const [updating, setUpdating] = useState(false);

  /**
   * Update user profile
   */
  const updateProfile = async (
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UpdateResult> => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      console.error('Profile update error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update profile',
      };
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Update user settings
   */
  const updateSettings = async (
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<UpdateResult> => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      console.error('Settings update error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update settings',
      };
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Upload avatar image to Supabase Storage
   */
  const uploadAvatar = async (
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: string | null }> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'File must be an image' };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: 'Image must be less than 5MB' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { url: publicUrl, error: null };
    } catch (err) {
      console.error('Avatar upload error:', err);
      return {
        url: null,
        error: err instanceof Error ? err.message : 'Failed to upload avatar',
      };
    }
  };

  /**
   * Upload cover image to Supabase Storage
   */
  const uploadCoverImage = async (
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: string | null }> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'File must be an image' };
      }

      if (file.size > 10 * 1024 * 1024) {
        return { url: null, error: 'Image must be less than 10MB' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      // Update profile with new cover URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_image_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { url: publicUrl, error: null };
    } catch (err) {
      console.error('Cover upload error:', err);
      return {
        url: null,
        error: err instanceof Error ? err.message : 'Failed to upload cover image',
      };
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (newPassword: string): Promise<UpdateResult> => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      console.error('Password update error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update password',
      };
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateProfile,
    updateSettings,
    uploadAvatar,
    uploadCoverImage,
    updatePassword,
    updating,
  };
}
