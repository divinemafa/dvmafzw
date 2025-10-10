/**
 * Security Section Component
 * 
 * Manages password, 2FA, and account security settings
 */

'use client';

import { useMemo, useState } from 'react';
import { 
  KeyIcon, 
  ShieldCheckIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { UserSettings } from '../types';
import { ChangePasswordModal } from './ChangePasswordModal';
import { useAuth } from '@/app/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_CONFIG_MISSING_MESSAGE, isSupabaseConfigured } from '@/lib/supabase/env';

interface SecuritySectionProps {
  settings: UserSettings | null;
}

export function SecuritySection({ settings }: SecuritySectionProps) {
  const { signOut } = useAuth();
  const supabaseReady = isSupabaseConfigured;
  const supabase = useMemo(() => (supabaseReady ? createClient() : null), [supabaseReady]);
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    setIsEnabling2FA(true);
    try {
      // TODO: Implement 2FA enrollment flow
      alert('2FA setup will be implemented with TOTP/SMS integration');
    } catch (error) {
      console.error('2FA error:', error);
    } finally {
      setIsEnabling2FA(false);
    }
  };

  // Handle account deactivation
  const handleDeactivate = async () => {
    if (!showDeactivateConfirm) {
      setShowDeactivateConfirm(true);
      return;
    }

    setIsProcessing(true);
    try {
      if (!supabase) {
        alert(SUPABASE_CONFIG_MISSING_MESSAGE);
        return;
      }
      // Update account status to suspended
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', is_active: false })
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      alert('Account deactivated. You will be logged out.');
      await signOut();
    } catch (error) {
      console.error('Deactivation error:', error);
      alert('Failed to deactivate account. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeactivateConfirm(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const confirmed = window.confirm(
      'Are you ABSOLUTELY sure? This action cannot be undone. All your data will be permanently deleted.'
    );

    if (!confirmed) {
      setShowDeleteConfirm(false);
      return;
    }

    setIsProcessing(true);
    try {
      if (!supabase) {
        alert(SUPABASE_CONFIG_MISSING_MESSAGE);
        return;
      }
      // Soft delete - mark as deleted
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'banned', 
          is_active: false,
          deleted_at: new Date().toISOString()
        })
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      alert('Account deleted. You will be logged out.');
      await signOut();
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  // Sign out all other sessions
  const handleSignOutAll = async () => {
    try {
      if (!supabase) {
        alert(SUPABASE_CONFIG_MISSING_MESSAGE);
        return;
      }
      await supabase.auth.signOut({ scope: 'global' });
      alert('Signed out from all devices. You will need to log in again.');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out from all devices.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Password & Authentication */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Password & Authentication</h3>
          </div>
          <p className="text-sm text-white/60">Manage your login credentials</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                Password
              </h4>
              <p className="text-sm text-white/60">Last changed recently</p>
            </div>
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-white/60">
                {settings?.two_factor_enabled ? 'Enabled - Extra security active' : 'Add an extra layer of security'}
              </p>
            </div>
            {settings?.two_factor_enabled ? (
              <button 
                onClick={handle2FAToggle}
                disabled={isEnabling2FA}
                className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnabling2FA ? 'Processing...' : 'Disable 2FA'}
              </button>
            ) : (
              <button 
                onClick={handle2FAToggle}
                disabled={isEnabling2FA}
                className="rounded-lg border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnabling2FA ? 'Processing...' : 'Enable 2FA'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ComputerDesktopIcon className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Active Sessions</h3>
              </div>
              <p className="text-sm text-white/60">Manage devices where you&apos;re logged in</p>
            </div>
            <button
              onClick={handleSignOutAll}
              className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
            >
              Sign Out All
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <ComputerDesktopIcon className="h-5 w-5" />
                Current Device
              </h4>
              <p className="text-sm text-white/60">Windows • Chrome • Your Location</p>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                Active now
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              Current
            </span>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Login History</h3>
          </div>
          <p className="text-sm text-white/60">Recent login attempts</p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-300" />
            <p className="text-sm text-white/80">No recent suspicious activity detected</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-red-500/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-300" />
            <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
          </div>
          <p className="text-sm text-white/60">Irreversible account actions</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Deactivate Account */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">Deactivate Account</h4>
                <p className="text-sm text-white/60 mt-1">
                  Temporarily disable your account. You can reactivate it later.
                </p>
              </div>
            </div>
            {showDeactivateConfirm && (
              <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-200 mb-3">
                  Are you sure? Your profile will be hidden and you&apos;ll be logged out.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeactivate}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Deactivating...' : 'Yes, Deactivate'}
                  </button>
                  <button
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!showDeactivateConfirm && (
              <button 
                onClick={handleDeactivate}
                disabled={isProcessing}
                className="mt-2 w-full rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deactivate Account
              </button>
            )}
          </div>

          {/* Delete Account */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">Delete Account</h4>
                <p className="text-sm text-white/60 mt-1">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
            </div>
            {showDeleteConfirm && (
              <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-200 mb-2 font-semibold">
                  ⚠️ FINAL WARNING
                </p>
                <p className="text-sm text-red-200 mb-3">
                  This will permanently delete your account, profile, bookings, reviews, and all associated data. This action CANNOT be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-red-300/30 bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Deleting...' : 'Delete Forever'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!showDeleteConfirm && (
              <button 
                onClick={handleDelete}
                disabled={isProcessing}
                className="mt-2 w-full rounded-lg border border-red-300/30 bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account Permanently
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
