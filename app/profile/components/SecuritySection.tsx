/**
 * Security Section Component
 * 
 * Manages password, 2FA, and account security settings
 */

import { KeyIcon } from '@heroicons/react/24/outline';
import type { UserSettings } from '../types';

interface SecuritySectionProps {
  settings: UserSettings | null;
}

export function SecuritySection({ settings }: SecuritySectionProps) {
  return (
    <div className="space-y-4">
      {/* Password & Authentication */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Password & Authentication</h3>
          <p className="text-sm text-white/60">Manage your login credentials</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold">Password</h4>
              <p className="text-sm text-white/60">Last changed recently</p>
            </div>
            <button className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold">Two-Factor Authentication</h4>
              <p className="text-sm text-white/60">
                {settings?.two_factor_enabled ? 'Enabled - Extra security active' : 'Add an extra layer of security'}
              </p>
            </div>
            {settings?.two_factor_enabled ? (
              <button className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30">
                Disable 2FA
              </button>
            ) : (
              <button className="rounded-lg border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30">
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="text-sm text-white/60">Manage devices where you&apos;re logged in</p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="font-semibold">Current Device</h4>
              <p className="text-sm text-white/60">Windows • Chrome • Your Location</p>
              <p className="text-xs text-white/40">Active now</p>
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
          <h3 className="text-lg font-semibold">Login History</h3>
          <p className="text-sm text-white/60">Recent login attempts</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-white/60">No recent suspicious activity detected</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-red-500/20 px-6 py-4">
          <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
          <p className="text-sm text-white/60">Irreversible account actions</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Deactivate Account</h4>
              <p className="text-sm text-white/60">Temporarily disable your account</p>
            </div>
            <button className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30">
              Deactivate
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Delete Account</h4>
              <p className="text-sm text-white/60">Permanently delete your account and data</p>
            </div>
            <button className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
