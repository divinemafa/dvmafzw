/**
 * Settings Section Component
 * 
 * Displays and manages user settings
 * Maps to user_settings table
 */

'use client';

import { useState, useEffect } from 'react';
import type { UserSettings } from '../types';

interface SettingsSectionProps {
  settings: UserSettings | null;
  onUpdate?: (settings: Partial<UserSettings>) => Promise<void>;
}

export function SettingsSection({ settings, onUpdate }: SettingsSectionProps) {
  const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    push_notifications_enabled: true,
    marketing_emails_enabled: false,
    booking_alerts_enabled: true,
    message_alerts_enabled: true,
    review_alerts_enabled: true,
    profile_visibility: 'public',
    show_online_status: true,
    preferred_language: 'en',
    preferred_currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
  });

  // Update local settings when props change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key: keyof UserSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    // TODO: Implement update to database
    if (onUpdate) {
      onUpdate({ [key]: !localSettings[key] });
    }
  };

  const handleSelectChange = (key: keyof UserSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // TODO: Implement update to database
    if (onUpdate) {
      onUpdate({ [key]: value });
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Settings */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <p className="text-sm text-white/60">Manage how you receive notifications</p>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSetting
            label="Email Notifications"
            description="Receive notifications via email"
            enabled={localSettings.email_notifications_enabled ?? true}
            onToggle={() => handleToggle('email_notifications_enabled')}
          />
          <ToggleSetting
            label="SMS Notifications"
            description="Receive notifications via text message"
            enabled={localSettings.sms_notifications_enabled ?? false}
            onToggle={() => handleToggle('sms_notifications_enabled')}
          />
          <ToggleSetting
            label="Push Notifications"
            description="Receive push notifications in your browser"
            enabled={localSettings.push_notifications_enabled ?? true}
            onToggle={() => handleToggle('push_notifications_enabled')}
          />
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm font-semibold text-white/80 mb-3">Alert Types</p>
            <div className="space-y-3">
              <ToggleSetting
                label="Booking Alerts"
                description="Get notified about new bookings"
                enabled={localSettings.booking_alerts_enabled ?? true}
                onToggle={() => handleToggle('booking_alerts_enabled')}
              />
              <ToggleSetting
                label="Message Alerts"
                description="Get notified about new messages"
                enabled={localSettings.message_alerts_enabled ?? true}
                onToggle={() => handleToggle('message_alerts_enabled')}
              />
              <ToggleSetting
                label="Review Alerts"
                description="Get notified about new reviews"
                enabled={localSettings.review_alerts_enabled ?? true}
                onToggle={() => handleToggle('review_alerts_enabled')}
              />
              <ToggleSetting
                label="Marketing Emails"
                description="Receive promotional offers and updates"
                enabled={localSettings.marketing_emails_enabled ?? false}
                onToggle={() => handleToggle('marketing_emails_enabled')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Language & Region</h3>
          <p className="text-sm text-white/60">Set your language and regional preferences</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Language</label>
            <select
              value={localSettings.preferred_language}
              onChange={(e) => handleSelectChange('preferred_language', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
              <option value="xh">Xhosa</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Currency</label>
            <select
              value={localSettings.preferred_currency}
              onChange={(e) => handleSelectChange('preferred_currency', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="ZAR">ZAR (South African Rand)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Time Zone</label>
            <select
              value={localSettings.timezone}
              onChange={(e) => handleSelectChange('timezone', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">British Time (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Privacy</h3>
          <p className="text-sm text-white/60">Control who can see your information</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Profile Visibility</h4>
              <p className="text-sm text-white/60">Who can see your profile</p>
            </div>
            <select
              value={localSettings.profile_visibility}
              onChange={(e) => handleSelectChange('profile_visibility', e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white"
            >
              <option value="public">Everyone</option>
              <option value="registered_only">Registered Users</option>
              <option value="private">Only Me</option>
            </select>
          </div>
          <ToggleSetting
            label="Show Online Status"
            description="Let others see when you're online"
            enabled={localSettings.show_online_status ?? true}
            onToggle={() => handleToggle('show_online_status')}
          />
        </div>
      </div>
    </div>
  );
}

// Helper component for toggle settings
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
