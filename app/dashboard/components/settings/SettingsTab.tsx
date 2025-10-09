/**
 * Settings Tab - Business/Product Settings ONLY
 * (NOT profile/account settings - those are in /profile)
 * 
 * Focus: How to display products, pricing rules, booking policies, business hours
 */

'use client';

import { 
  Cog6ToothIcon, 
  ShoppingBagIcon, 
  BanknotesIcon, 
  CalendarDaysIcon,
  BellIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export function SettingsTab() {
  const [productSettings, setProductSettings] = useState({
    autoPublish: false,
    requireApproval: true,
    defaultDuration: '60',
  });

  const [pricingSettings, setPricingSettings] = useState({
    showPricing: true,
    allowNegotiation: false,
    taxIncluded: true,
  });

  const [bookingSettings, setBookingSettings] = useState({
    autoAccept: false,
    requireDeposit: true,
    allowCancellation: true,
    cancellationWindow: '24',
  });

  const [displaySettings, setDisplaySettings] = useState({
    showListings: true,
    showReviews: true,
    showAvailability: true,
  });

  const [businessNotifications, setBusinessNotifications] = useState({
    newBookings: true,
    newReviews: true,
    lowStock: false,
  });

  return (
    <>
      {/* Business Settings - Product/Service focused */}
      <div className="space-y-6">
        
        {/* Product Display Settings */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
                <ShoppingBagIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Product Display</h2>
                <p className="text-sm text-white/60">Control how your listings appear</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <ToggleSetting
                label="Auto-Publish New Listings"
                description="Automatically make new listings public"
                checked={productSettings.autoPublish}
                onChange={(checked) =>
                  setProductSettings({ ...productSettings, autoPublish: checked })
                }
              />
              <ToggleSetting
                label="Require Manual Approval"
                description="Review listings before they go live"
                checked={productSettings.requireApproval}
                onChange={(checked) =>
                  setProductSettings({ ...productSettings, requireApproval: checked })
                }
              />
              <SelectSetting
                label="Default Service Duration"
                description="Standard duration for new services"
                value={productSettings.defaultDuration}
                options={[
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: '90', label: '1.5 hours' },
                  { value: '120', label: '2 hours' },
                ]}
                onChange={(value) =>
                  setProductSettings({ ...productSettings, defaultDuration: value })
                }
              />
            </div>
          </div>
        </div>

        {/* Pricing & Payment Rules */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2 text-green-400">
                <BanknotesIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pricing Rules</h2>
                <p className="text-sm text-white/60">Set default pricing behaviors</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <ToggleSetting
                label="Show Pricing Publicly"
                description="Display prices on listings"
                checked={pricingSettings.showPricing}
                onChange={(checked) =>
                  setPricingSettings({ ...pricingSettings, showPricing: checked })
                }
              />
              <ToggleSetting
                label="Allow Price Negotiation"
                description="Let customers request custom pricing"
                checked={pricingSettings.allowNegotiation}
                onChange={(checked) =>
                  setPricingSettings({ ...pricingSettings, allowNegotiation: checked })
                }
              />
              <ToggleSetting
                label="Tax Included in Price"
                description="Display tax-inclusive pricing"
                checked={pricingSettings.taxIncluded}
                onChange={(checked) =>
                  setPricingSettings({ ...pricingSettings, taxIncluded: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Booking Policies */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Booking Policies</h2>
                <p className="text-sm text-white/60">Manage booking rules</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <ToggleSetting
                label="Auto-Accept Bookings"
                description="Automatically confirm all bookings"
                checked={bookingSettings.autoAccept}
                onChange={(checked) =>
                  setBookingSettings({ ...bookingSettings, autoAccept: checked })
                }
              />
              <ToggleSetting
                label="Require Deposit"
                description="Request upfront payment for bookings"
                checked={bookingSettings.requireDeposit}
                onChange={(checked) =>
                  setBookingSettings({ ...bookingSettings, requireDeposit: checked })
                }
              />
              <ToggleSetting
                label="Allow Cancellations"
                description="Let customers cancel bookings"
                checked={bookingSettings.allowCancellation}
                onChange={(checked) =>
                  setBookingSettings({ ...bookingSettings, allowCancellation: checked })
                }
              />
              <SelectSetting
                label="Cancellation Window"
                description="Hours before booking when cancellation is allowed"
                value={bookingSettings.cancellationWindow}
                options={[
                  { value: '1', label: '1 hour' },
                  { value: '6', label: '6 hours' },
                  { value: '24', label: '24 hours' },
                  { value: '48', label: '48 hours' },
                  { value: '72', label: '3 days' },
                ]}
                onChange={(value) =>
                  setBookingSettings({ ...bookingSettings, cancellationWindow: value })
                }
              />
            </div>
          </div>
        </div>

        {/* Public Profile Display */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-400">
                <EyeIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Public Display</h2>
                <p className="text-sm text-white/60">What appears on your store page</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <ToggleSetting
                label="Show Listings"
                description="Display your products/services publicly"
                checked={displaySettings.showListings}
                onChange={(checked) =>
                  setDisplaySettings({ ...displaySettings, showListings: checked })
                }
              />
              <ToggleSetting
                label="Show Reviews"
                description="Display customer reviews on listings"
                checked={displaySettings.showReviews}
                onChange={(checked) =>
                  setDisplaySettings({ ...displaySettings, showReviews: checked })
                }
              />
              <ToggleSetting
                label="Show Availability"
                description="Display real-time availability"
                checked={displaySettings.showAvailability}
                onChange={(checked) =>
                  setDisplaySettings({ ...displaySettings, showAvailability: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Business Notifications (different from personal notifications in profile) */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/20 p-2 text-orange-400">
                <BellIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Business Alerts</h2>
                <p className="text-sm text-white/60">Notifications for business events only</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <ToggleSetting
                label="New Booking Alerts"
                description="Get notified when someone books a service"
                checked={businessNotifications.newBookings}
                onChange={(checked) =>
                  setBusinessNotifications({ ...businessNotifications, newBookings: checked })
                }
              />
              <ToggleSetting
                label="New Review Alerts"
                description="Get notified when customers leave reviews"
                checked={businessNotifications.newReviews}
                onChange={(checked) =>
                  setBusinessNotifications({ ...businessNotifications, newReviews: checked })
                }
              />
              <ToggleSetting
                label="Low Stock Alerts"
                description="Alert when product inventory is low"
                checked={businessNotifications.lowStock}
                onChange={(checked) =>
                  setBusinessNotifications({ ...businessNotifications, lowStock: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Note about profile settings */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400">
            💡 <strong>Looking for account security or personal settings?</strong> Visit your{' '}
            <a href="/profile" className="underline hover:text-blue-300">
              Profile Settings
            </a>{' '}
            to manage passwords, 2FA, payment methods, and personal preferences.
          </p>
        </div>
      </div>
    </>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
      <div>
        <h4 className="font-semibold text-white">{label}</h4>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-blue-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// Select Setting Component
interface SelectSettingProps {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectSetting({ label, description, value, options, onChange }: SelectSettingProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3">
        <h4 className="font-semibold text-white">{label}</h4>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white backdrop-blur-xl transition hover:bg-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&>option]:bg-[#1a1a1a] [&>option]:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
