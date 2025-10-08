/**
 * Profile Data Fetching Hook
 * 
 * Fetches user profile, verification, and settings data from Supabase
 * Uses the authenticated user's session to load their data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { ProfileData, UserProfile, UserVerification, UserSettings } from '../types';

export function useProfileData(): ProfileData & { refetch: () => void } {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [data, setData] = useState<ProfileData>({
    profile: null,
    verification: null,
    settings: null,
    loading: true,
    error: null,
  });

  // Fetch all profile data
  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setData({
        profile: null,
        verification: null,
        settings: null,
        loading: false,
        error: 'Not authenticated',
      });
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch verification data
      const { data: verificationData, error: verificationError } = await supabase
        .from('user_verification')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (verificationError && verificationError.code !== 'PGRST116') {
        console.warn('Verification fetch error:', verificationError);
      }

      // Fetch settings data
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('Settings fetch error:', settingsError);
      }

      setData({
        profile: profileData as UserProfile,
        verification: verificationData as UserVerification | null,
        settings: settingsData as UserSettings | null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setData(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load profile data',
      }));
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Expose refetch method
  return {
    ...data,
    refetch: fetchProfileData,
  };
}
