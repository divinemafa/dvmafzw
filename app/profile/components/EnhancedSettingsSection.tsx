/**
 * Enhanced Settings Section
 * 
 * Comprehensive user settings with all database fields
 * Includes real-time updates to database
 */

'use client';

import { useState, useEffect } from 'react';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import type { UserSettings } from '../types';

interface EnhancedSettingsSectionProps {
  settings: UserSettings | null;
  userId: string;
  onUpdate?: () => void;
}

export function EnhancedSettingsSection({
  settings,
  userId,
  onUpdate,
}: EnhancedSettingsSectionProps) {
  const { updateSettings, updating } = useProfileUpdate();
  const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initialize local settings with safe defaults to prevent controlled/uncontrolled input warnings
  useEffect(() => {
    if (settings) {
      // Ensure all values are defined to prevent undefined -> value transition
      setLocalSettings({
        ...settings,
        // Ensure numeric fields have default values
        minimum_booking_notice_hours: settings.minimum_booking_notice_hours ?? 0,
        default_tip_percentage: settings.default_tip_percentage ?? 0,
        max_advance_booking_days: settings.max_advance_booking_days ?? 0,
        service_area_radius_km: settings.service_area_radius_km ?? 0,
      });
    }
  }, [settings]);

  // Auto-save on change with debounce
  const handleToggle = async (key: keyof UserSettings) => {
    const newValue = !localSettings[key];
    setLocalSettings(prev => ({
      ...prev,
      [key]: newValue,
    }));

    // Update database
    const result = await updateSettings(userId, { [key]: newValue });
    if (result.success) {
      setSaveMessage('✓ Saved');
      setTimeout(() => setSaveMessage(null), 2000);
      // Don't call onUpdate - no need to refetch, settings already updated
    } else {
      setSaveMessage('✗ Failed to save');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSelectChange = async (key: keyof UserSettings, value: string | number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));

    // Update database
    const result = await updateSettings(userId, { [key]: value });
    if (result.success) {
      setSaveMessage('✓ Saved');
      setTimeout(() => setSaveMessage(null), 2000);
      // Don't call onUpdate - no need to refetch, settings already updated
    } else {
      setSaveMessage('✗ Failed to save');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (!settings) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/60">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Status */}
      {saveMessage && (
        <div className={`rounded-lg p-3 text-sm font-semibold ${
          saveMessage.includes('✓')
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Email Notifications */}
      <SettingsCard title="Email Notifications" description="Manage email notification preferences">
        <ToggleSetting
          label="Email Notifications"
          description="Receive notifications via email"
          enabled={localSettings.email_notifications_enabled ?? true}
          onToggle={() => handleToggle('email_notifications_enabled')}
        />
        
        {localSettings.email_notifications_enabled && (
          <div className="ml-6 space-y-3 border-l-2 border-white/10 pl-4">
            <ToggleSetting
              label="Booking Notifications"
              description="Get notified about new bookings"
              enabled={localSettings.email_booking_notifications ?? true}
              onToggle={() => handleToggle('email_booking_notifications')}
            />
            <ToggleSetting
              label="Message Notifications"
              description="Get notified about new messages"
              enabled={localSettings.email_message_notifications ?? true}
              onToggle={() => handleToggle('email_message_notifications')}
            />
            <ToggleSetting
              label="Review Notifications"
              description="Get notified about new reviews"
              enabled={localSettings.email_review_notifications ?? true}
              onToggle={() => handleToggle('email_review_notifications')}
            />
            <ToggleSetting
              label="Payment Notifications"
              description="Get notified about payments"
              enabled={localSettings.email_payment_notifications ?? true}
              onToggle={() => handleToggle('email_payment_notifications')}
            />
            <ToggleSetting
              label="Marketing Emails"
              description="Receive promotional offers"
              enabled={localSettings.email_marketing_notifications ?? false}
              onToggle={() => handleToggle('email_marketing_notifications')}
            />
            
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email Frequency
              </label>
              <select
                value={localSettings.email_notification_frequency ?? 'real_time'}
                onChange={(e) => handleSelectChange('email_notification_frequency', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white"
              >
                <option value="real_time">Real-time</option>
                <option value="daily_digest">Daily Digest</option>
                <option value="weekly_digest">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* SMS Notifications */}
      <SettingsCard title="SMS Notifications" description="Manage text message notifications">
        <div className="space-y-4">
          {/* Coming Soon Notice */}
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <div>
                <p className="text-sm font-medium text-yellow-300">SMS Integration Coming Soon</p>
                <p className="text-xs text-yellow-300/70">SMS notifications will be available in a future update</p>
              </div>
            </div>
          </div>

          <ToggleSetting
            label="SMS Notifications"
            description="Receive notifications via text message (Feature coming soon)"
            enabled={localSettings.sms_notifications_enabled ?? false}
            onToggle={() => handleToggle('sms_notifications_enabled')}
          />
          
          {localSettings.sms_notifications_enabled && (
            <div className="ml-6 space-y-3 border-l-2 border-white/10 pl-4">
              <ToggleSetting
                label="Booking Alerts"
                description="SMS for new bookings"
                enabled={localSettings.sms_booking_notifications ?? false}
                onToggle={() => handleToggle('sms_booking_notifications')}
              />
              <ToggleSetting
                label="Payment Alerts"
                description="SMS for payment confirmations"
                enabled={localSettings.sms_payment_notifications ?? true}
                onToggle={() => handleToggle('sms_payment_notifications')}
              />
              <ToggleSetting
                label="Security Alerts"
                description="SMS for security events"
                enabled={localSettings.sms_security_alerts ?? true}
                onToggle={() => handleToggle('sms_security_alerts')}
              />
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Push Notifications */}
      <SettingsCard title="Push Notifications" description="Manage browser/app push notifications">
        <ToggleSetting
          label="Push Notifications"
          description="Receive push notifications"
          enabled={localSettings.push_notifications_enabled ?? true}
          onToggle={() => handleToggle('push_notifications_enabled')}
        />
        
        {localSettings.push_notifications_enabled && (
          <div className="ml-6 space-y-3 border-l-2 border-white/10 pl-4">
            <ToggleSetting
              label="Message Push"
              description="Push for new messages"
              enabled={localSettings.push_message_notifications ?? true}
              onToggle={() => handleToggle('push_message_notifications')}
            />
            <ToggleSetting
              label="Booking Push"
              description="Push for booking updates"
              enabled={localSettings.push_booking_notifications ?? true}
              onToggle={() => handleToggle('push_booking_notifications')}
            />
          </div>
        )}
      </SettingsCard>

      {/* Language & Region */}
      <SettingsCard title="Language & Region" description="Set your language and regional preferences">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Theme Preference</label>
            <select
              value={localSettings.theme_preference ?? 'dark'}
              onChange={(e) => handleSelectChange('theme_preference', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="dark">🌙 Dark Mode</option>
              <option value="light">☀️ Light Mode</option>
              <option value="system">💻 System Default</option>
            </select>
            <p className="mt-1 text-xs text-white/50">
              Theme will be applied in future update
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Language</label>
            <select
              value={localSettings.preferred_language ?? 'en'}
              onChange={(e) => handleSelectChange('preferred_language', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
              <option value="xh">Xhosa</option>
              <option value="st">Sotho</option>
              <option value="tn">Tswana</option>
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Currency</label>
            <select
              value={localSettings.preferred_currency ?? 'ZAR'}
              onChange={(e) => handleSelectChange('preferred_currency', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="ZAR">ZAR (South African Rand)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="KES">KES (Kenyan Shilling)</option>
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Timezone</label>
            <select
              value={localSettings.timezone ?? 'Africa/Johannesburg'}
              onChange={(e) => handleSelectChange('timezone', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="Africa/Johannesburg">South Africa (SAST)</option>
              <option value="Africa/Lagos">Nigeria (WAT)</option>
              <option value="Africa/Nairobi">Kenya (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">British Time (GMT)</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Date Format</label>
              <select
                value={localSettings.date_format ?? 'YYYY-MM-DD'}
                onChange={(e) => handleSelectChange('date_format', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2025-10-08)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (08/10/2025)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (10/08/2025)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Time Format</label>
              <select
                value={localSettings.time_format ?? '24h'}
                onChange={(e) => handleSelectChange('time_format', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Privacy */}
      <SettingsCard title="Privacy Settings" description="Control who can see your information">
        <div className="space-y-4">
          <ToggleSetting
            label="Public Profile"
            description="Make your profile visible to everyone"
            enabled={localSettings.profile_visible_to_public ?? true}
            onToggle={() => handleToggle('profile_visible_to_public')}
          />
          <ToggleSetting
            label="Show in Search Results"
            description="Allow others to find you via search"
            enabled={localSettings.show_in_search_results ?? true}
            onToggle={() => handleToggle('show_in_search_results')}
          />
          <ToggleSetting
            label="Show Online Status"
            description="Let others see when you're online"
            enabled={localSettings.show_online_status ?? true}
            onToggle={() => handleToggle('show_online_status')}
          />
          <ToggleSetting
            label="Show Last Seen"
            description="Display when you were last active"
            enabled={localSettings.show_last_seen ?? true}
            onToggle={() => handleToggle('show_last_seen')}
          />
          <ToggleSetting
            label="Show Review History"
            description="Allow others to see your reviews"
            enabled={localSettings.show_review_history ?? true}
            onToggle={() => handleToggle('show_review_history')}
          />
          <ToggleSetting
            label="Show Booking Count"
            description="Display total bookings completed"
            enabled={localSettings.show_booking_history ?? true}
            onToggle={() => handleToggle('show_booking_history')}
          />
          <ToggleSetting
            label="Analytics Tracking"
            description="Help improve the platform (anonymized data)"
            enabled={localSettings.allow_analytics_tracking ?? true}
            onToggle={() => handleToggle('allow_analytics_tracking')}
          />
          <ToggleSetting
            label="Marketing Cookies"
            description="Allow personalized marketing"
            enabled={localSettings.allow_marketing_cookies ?? false}
            onToggle={() => handleToggle('allow_marketing_cookies')}
          />
        </div>
      </SettingsCard>

      {/* Payment Preferences */}
      <SettingsCard title="Payment Preferences" description="Manage payment and booking settings">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Preferred Payout Currency</label>
            <select
              value={localSettings.preferred_payout_currency ?? 'USD'}
              onChange={(e) => handleSelectChange('preferred_payout_currency', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="USD">USD (US Dollar)</option>
              <option value="ZAR">ZAR (South African Rand)</option>
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="ETH">ETH (Ethereum)</option>
              <option value="SOL">SOL (Solana)</option>
              <option value="BMC">BMC (Bitcoin Mascot)</option>
            </select>
          </div>

          <ToggleSetting
            label="Auto-Accept Bookings"
            description="Automatically accept all booking requests"
            enabled={localSettings.auto_accept_bookings ?? false}
            onToggle={() => handleToggle('auto_accept_bookings')}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Booking Notice (hours)
            </label>
            <input
              type="number"
              min="0"
              value={localSettings.minimum_booking_notice_hours ?? 0}
              onChange={(e) => handleSelectChange('minimum_booking_notice_hours', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
            />
            <p className="mt-1 text-xs text-white/50">
              Clients must book at least this many hours in advance
            </p>
          </div>

          <ToggleSetting
            label="Save Payment Methods"
            description="Remember payment info for future bookings"
            enabled={localSettings.save_payment_methods ?? true}
            onToggle={() => handleToggle('save_payment_methods')}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Default Tip Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={localSettings.default_tip_percentage ?? 0}
              onChange={(e) => handleSelectChange('default_tip_percentage', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
            />
            <p className="mt-1 text-xs text-white/50">0-25%</p>
          </div>

          {/* Payment Methods Manager - Coming Soon */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Payment Methods</h4>
                <p className="text-sm text-white/60">Manage your saved payment methods</p>
              </div>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                Coming Soon
              </span>
            </div>
            <button
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/40 cursor-not-allowed"
            >
              💳 Manage Payment Methods
            </button>
            <p className="mt-2 text-xs text-white/40">
              Credit cards, debit cards, and crypto wallets will be manageable here
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Provider Settings */}
      <SettingsCard title="Provider Settings" description="Settings for service providers">
        <div className="space-y-4">
          <ToggleSetting
            label="Instant Booking"
            description="Allow clients to book without approval"
            enabled={localSettings.instant_booking_enabled ?? false}
            onToggle={() => handleToggle('instant_booking_enabled')}
          />
          
          <ToggleSetting
            label="Same-Day Bookings"
            description="Allow bookings for today"
            enabled={localSettings.allow_same_day_bookings ?? true}
            onToggle={() => handleToggle('allow_same_day_bookings')}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Maximum Advance Booking (days)
            </label>
            <input
              type="number"
              min="0"
              value={localSettings.max_advance_booking_days ?? 0}
              onChange={(e) => handleSelectChange('max_advance_booking_days', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
            />
            <p className="mt-1 text-xs text-white/50">0 = unlimited</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Service Area Radius (km)
            </label>
            <input
              type="number"
              min="0"
              value={localSettings.service_area_radius_km ?? 0}
              onChange={(e) => handleSelectChange('service_area_radius_km', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
            />
            <p className="mt-1 text-xs text-white/50">
              Maximum distance for location-based services
            </p>
          </div>

          <ToggleSetting
            label="Auto-Decline Out of Area"
            description="Automatically decline bookings outside service area"
            enabled={localSettings.auto_decline_out_of_area ?? false}
            onToggle={() => handleToggle('auto_decline_out_of_area')}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

// Helper Components
function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-6 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? 'bg-blue-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            enabled ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
