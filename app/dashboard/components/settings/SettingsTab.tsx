/**
 * Settings Tab - Business/Product Settings ONLY
 * (NOT profile/account settings - those are in /profile)
 * 
 * Focus: How to display products, pricing rules, booking policies, business hours
 */
'use client';

import {
  BanknotesIcon,
  BellIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  EyeIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

function SettingsRightRail({
  activeSection,
  quickSummary,
  productSettings,
  pricingSettings,
  bookingSettings,
  displaySettings,
  automationSettings,
  businessNotifications,
  channelPreferences,
  escalationSettings,
  complianceSettings,
}: SettingsRightRailProps) {
  const activeMeta = NAVIGATION_SECTIONS.find((section) => section.id === activeSection);

  const activeHighlights = useMemo<RightRailHighlight[]>(
    () => {
      switch (activeSection) {
        case 'catalog':
          return [
            {
              label: 'Auto-publish',
              value: productSettings.autoPublish ? 'Enabled' : 'Manual',
              positive: productSettings.autoPublish,
            },
            {
              label: 'Default duration',
              value: `${productSettings.defaultDuration} min`,
            },
          ];
        case 'pricing':
          return [
            {
              label: 'Pricing visibility',
              value: pricingSettings.showPricing ? 'Visible' : 'Hidden',
              positive: pricingSettings.showPricing,
            },
            {
              label: 'Negotiation',
              value: pricingSettings.allowNegotiation ? 'Allowed' : 'Locked',
              positive: pricingSettings.allowNegotiation,
            },
          ];
        case 'bookings':
          return [
            {
              label: 'Auto-accept',
              value: bookingSettings.autoAccept ? 'On' : 'Off',
              positive: bookingSettings.autoAccept,
            },
            {
              label: 'Cancellation window',
              value: `${bookingSettings.cancellationWindow}h`,
            },
          ];
        case 'experience':
          return [
            {
              label: 'Listings',
              value: displaySettings.showListings ? 'Visible' : 'Hidden',
              positive: displaySettings.showListings,
            },
            {
              label: 'Reviews',
              value: displaySettings.showReviews ? 'Visible' : 'Hidden',
              positive: displaySettings.showReviews,
            },
          ];
        case 'alerts':
          return [
            {
              label: 'New bookings',
              value: businessNotifications.newBookings ? 'Alerting' : 'Muted',
              positive: businessNotifications.newBookings,
            },
            {
              label: 'Low stock',
              value: businessNotifications.lowStock ? 'Alerting' : 'Muted',
              positive: businessNotifications.lowStock,
            },
          ];
        case 'automations':
          return [
            {
              label: 'Reminders',
              value: automationSettings.autoReminders ? 'Automated' : 'Manual',
              positive: automationSettings.autoReminders,
            },
            {
              label: 'Waitlist',
              value: automationSettings.waitlistAutofill ? 'Autofill' : 'Manual',
              positive: automationSettings.waitlistAutofill,
            },
          ];
        case 'compliance':
          return [
            {
              label: 'KYC requirement',
              value: complianceSettings.requireKyc ? 'Required' : 'Optional',
              positive: complianceSettings.requireKyc,
            },
            {
              label: 'Retention',
              value: `${complianceSettings.dataRetention}d`,
            },
          ];
        default:
          return [];
      }
    },
    [
      activeSection,
      automationSettings.autoReminders,
      automationSettings.waitlistAutofill,
      bookingSettings.autoAccept,
      bookingSettings.cancellationWindow,
      businessNotifications.lowStock,
      businessNotifications.newBookings,
      complianceSettings.dataRetention,
      complianceSettings.requireKyc,
      displaySettings.showListings,
      displaySettings.showReviews,
      pricingSettings.allowNegotiation,
      pricingSettings.showPricing,
      productSettings.autoPublish,
      productSettings.defaultDuration,
    ],
  );

  const channelBadges = useMemo(
    () => [
      { label: 'Email', enabled: channelPreferences.email },
      { label: 'SMS', enabled: channelPreferences.sms },
      { label: 'WhatsApp', enabled: channelPreferences.whatsapp },
    ],
    [channelPreferences.email, channelPreferences.sms, channelPreferences.whatsapp],
  );

  const escalationCopy = useMemo(
    () => `Remind ${escalationSettings.reminderLead}h · Escalate ${escalationSettings.escalationLead}h`,
    [escalationSettings.escalationLead, escalationSettings.reminderLead],
  );

  return (
    <aside className="hidden xl:block">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/60">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Quick Summary</p>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              {activeMeta?.label ?? 'Overview'}
            </span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {quickSummary.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" aria-hidden />
                <span className="truncate">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Key Signals</p>
          <ul className="mt-3 space-y-2">
            {activeHighlights.map((highlight) => (
              <li key={highlight.label} className="flex items-center justify-between text-xs text-white/70">
                <span className="font-medium text-white">{highlight.label}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${
                    highlight.positive ? 'border-emerald-300/60 text-emerald-200' : 'border-white/20 text-white/55'
                  }`}
                >
                  {highlight.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Channels</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {channelBadges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] ${
                  badge.enabled
                    ? 'border-indigo-300/60 bg-indigo-300/10 text-indigo-100'
                    : 'border-white/15 bg-white/5 text-white/35'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.26em] text-white/45">Escalation</p>
          <p className="mt-1 text-xs text-white/65">{escalationCopy}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Automation Health</p>
          <ul className="mt-3 space-y-1.5 text-xs text-white/65">
            <li className="flex items-center justify-between">
              <span>Reminders</span>
              <span className={automationSettings.autoReminders ? 'text-emerald-200' : 'text-white/45'}>
                {automationSettings.autoReminders ? 'Automatic' : 'Manual'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Waitlist</span>
              <span className={automationSettings.waitlistAutofill ? 'text-emerald-200' : 'text-white/45'}>
                {automationSettings.waitlistAutofill ? 'Autofill' : 'Manual'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Fallback flows</span>
              <span className={automationSettings.fallbackFlows ? 'text-emerald-200' : 'text-white/45'}>
                {automationSettings.fallbackFlows ? 'Active' : 'Disabled'}
              </span>
            </li>
          </ul>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Compliance</p>
            <p className="mt-1 text-xs text-white/65">
              {complianceSettings.requireKyc ? 'KYC required' : 'KYC optional'} · Retain {complianceSettings.dataRetention} days
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface SelectSettingProps {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

interface SettingCardProps {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: ReactNode;
}

interface BusinessNotificationState {
  newBookings: boolean;
  newReviews: boolean;
  lowStock: boolean;
}

interface ChannelPreferencesState {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

interface EscalationSettingsState {
  reminderLead: string;
  escalationLead: string;
}

interface AutomationSettingsState {
  autoReminders: boolean;
  waitlistAutofill: boolean;
  fallbackFlows: boolean;
}

interface ComplianceSettingsState {
  requireKyc: boolean;
  storeConsent: boolean;
  dataRetention: string;
}

interface ProductSettingsState {
  autoPublish: boolean;
  requireApproval: boolean;
  defaultDuration: string;
}

interface PricingSettingsState {
  showPricing: boolean;
  allowNegotiation: boolean;
  taxIncluded: boolean;
}

interface BookingSettingsState {
  autoAccept: boolean;
  requireDeposit: boolean;
  allowCancellation: boolean;
  cancellationWindow: string;
}

interface DisplaySettingsState {
  showListings: boolean;
  showReviews: boolean;
  showAvailability: boolean;
}

interface RightRailHighlight {
  label: string;
  value: string;
  positive?: boolean;
}

interface SettingsRightRailProps {
  activeSection: SettingsSection;
  quickSummary: string[];
  productSettings: ProductSettingsState;
  pricingSettings: PricingSettingsState;
  bookingSettings: BookingSettingsState;
  displaySettings: DisplaySettingsState;
  automationSettings: AutomationSettingsState;
  businessNotifications: BusinessNotificationState;
  channelPreferences: ChannelPreferencesState;
  escalationSettings: EscalationSettingsState;
  complianceSettings: ComplianceSettingsState;
}

const NAVIGATION_SECTIONS = [
  {
    id: 'catalog',
    label: 'Catalog & Display',
    icon: ShoppingBagIcon,
    description: 'Listing defaults and durations',
  },
  {
    id: 'pricing',
    label: 'Pricing Rules',
    icon: BanknotesIcon,
    description: 'Commercial expectations and negotiation',
  },
  {
    id: 'bookings',
    label: 'Booking Policies',
    icon: CalendarDaysIcon,
    description: 'Confirmation windows and guardrails',
  },
  {
    id: 'experience',
    label: 'Customer Experience',
    icon: EyeIcon,
    description: 'Surface content and visibility',
  },
  {
    id: 'alerts',
    label: 'Business Alerts',
    icon: BellIcon,
    description: 'Operational notifications and channels',
  },
  {
    id: 'automations',
    label: 'Automations',
    icon: Cog6ToothIcon,
    description: 'Workflow orchestration and triggers',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: ShieldCheckIcon,
    description: 'Policy enforcement and retention',
  },
] as const;

type SettingsSection = (typeof NAVIGATION_SECTIONS)[number]['id'];

export function SettingsTab() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('catalog');
  const [productSettings, setProductSettings] = useState<ProductSettingsState>({
    autoPublish: true,
    requireApproval: false,
    defaultDuration: '60',
  });
  const [pricingSettings, setPricingSettings] = useState<PricingSettingsState>({
    showPricing: true,
    allowNegotiation: false,
    taxIncluded: false,
  });
  const [bookingSettings, setBookingSettings] = useState<BookingSettingsState>({
    autoAccept: true,
    requireDeposit: false,
    allowCancellation: true,
    cancellationWindow: '24',
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettingsState>({
    showListings: true,
    showReviews: true,
    showAvailability: true,
  });
  const [businessNotifications, setBusinessNotifications] = useState<BusinessNotificationState>({
    newBookings: true,
    newReviews: true,
    lowStock: false,
  });
  const [channelPreferences, setChannelPreferences] = useState<ChannelPreferencesState>({
    email: true,
    sms: false,
    whatsapp: false,
  });
  const [escalationSettings, setEscalationSettings] = useState<EscalationSettingsState>({
    reminderLead: '3',
    escalationLead: '12',
  });
  const [automationSettings, setAutomationSettings] = useState<AutomationSettingsState>({
    autoReminders: true,
    waitlistAutofill: true,
    fallbackFlows: false,
  });
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettingsState>({
    requireKyc: true,
    storeConsent: true,
    dataRetention: '30',
  });

  const quickSummary = useMemo(
    () => [
      productSettings.autoPublish ? 'Auto-publish on' : 'Manual publishing',
      pricingSettings.showPricing ? 'Pricing visible' : 'Pricing hidden',
      bookingSettings.autoAccept ? 'Auto-accept bookings' : 'Manual approvals',
      automationSettings.autoReminders ? 'Reminders automated' : 'Manual reminders',
    ],
    [
      productSettings.autoPublish,
      pricingSettings.showPricing,
      bookingSettings.autoAccept,
      automationSettings.autoReminders,
    ],
  );

  const activeSectionMeta = NAVIGATION_SECTIONS.find((section) => section.id === activeSection)!;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'catalog':
        return (
          <div className="space-y-3">
            <SettingCard
              id="catalog-launch"
              icon={ShoppingBagIcon}
              title="Product display"
              subtitle="Control launch defaults for new listings"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSetting
                  label="Auto-publish"
                  description="Push new listings live immediately"
                  checked={productSettings.autoPublish}
                  onChange={(checked) => setProductSettings({ ...productSettings, autoPublish: checked })}
                />
                <ToggleSetting
                  label="Require approval"
                  description="Hold drafts until reviewed"
                  checked={productSettings.requireApproval}
                  onChange={(checked) => setProductSettings({ ...productSettings, requireApproval: checked })}
                />
                <SelectSetting
                  className="sm:col-span-2"
                  label="Default duration"
                  description="Starting length for service slots"
                  value={productSettings.defaultDuration}
                  options={[
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: '90', label: '1.5 hours' },
                    { value: '120', label: '2 hours' },
                  ]}
                  onChange={(value) => setProductSettings({ ...productSettings, defaultDuration: value })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-3">
            <SettingCard
              id="pricing-rules"
              icon={BanknotesIcon}
              title="Pricing rules"
              subtitle="Define commercial expectations"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSetting
                  label="Show pricing"
                  description="Expose rates on storefront"
                  checked={pricingSettings.showPricing}
                  onChange={(checked) => setPricingSettings({ ...pricingSettings, showPricing: checked })}
                />
                <ToggleSetting
                  label="Allow negotiation"
                  description="Let buyers request custom quotes"
                  checked={pricingSettings.allowNegotiation}
                  onChange={(checked) => setPricingSettings({ ...pricingSettings, allowNegotiation: checked })}
                />
                <ToggleSetting
                  className="sm:col-span-2"
                  label="Tax inclusive"
                  description="Advertise prices with tax included"
                  checked={pricingSettings.taxIncluded}
                  onChange={(checked) => setPricingSettings({ ...pricingSettings, taxIncluded: checked })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-3">
            <SettingCard
              id="booking-policies"
              icon={CalendarDaysIcon}
              title="Booking policies"
              subtitle="Automate confirmations and guardrails"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSetting
                  label="Auto-accept"
                  description="Confirm bookings instantly"
                  checked={bookingSettings.autoAccept}
                  onChange={(checked) => setBookingSettings({ ...bookingSettings, autoAccept: checked })}
                />
                <ToggleSetting
                  label="Require deposit"
                  description="Capture upfront commitment"
                  checked={bookingSettings.requireDeposit}
                  onChange={(checked) => setBookingSettings({ ...bookingSettings, requireDeposit: checked })}
                />
                <ToggleSetting
                  className="sm:col-span-2"
                  label="Allow cancellations"
                  description="Let customers cancel without support"
                  checked={bookingSettings.allowCancellation}
                  onChange={(checked) => setBookingSettings({ ...bookingSettings, allowCancellation: checked })}
                />
                <SelectSetting
                  className="sm:col-span-2"
                  label="Cancellation window"
                  description="Minimum notice required to cancel"
                  value={bookingSettings.cancellationWindow}
                  options={[
                    { value: '1', label: '1 hour' },
                    { value: '6', label: '6 hours' },
                    { value: '24', label: '24 hours' },
                    { value: '48', label: '48 hours' },
                    { value: '72', label: '3 days' },
                  ]}
                  onChange={(value) => setBookingSettings({ ...bookingSettings, cancellationWindow: value })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-3">
            <SettingCard
              id="customer-experience"
              icon={EyeIcon}
              title="Customer experience"
              subtitle="Choose surface content for visitors"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSetting
                  label="Show listings"
                  description="Keep storefront open"
                  checked={displaySettings.showListings}
                  onChange={(checked) => setDisplaySettings({ ...displaySettings, showListings: checked })}
                />
                <ToggleSetting
                  label="Show reviews"
                  description="Display social proof"
                  checked={displaySettings.showReviews}
                  onChange={(checked) => setDisplaySettings({ ...displaySettings, showReviews: checked })}
                />
                <ToggleSetting
                  className="sm:col-span-2"
                  label="Show availability"
                  description="Expose calendar inventory"
                  checked={displaySettings.showAvailability}
                  onChange={(checked) => setDisplaySettings({ ...displaySettings, showAvailability: checked })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-3">
            <SettingCard
              id="business-alerts"
              icon={BellIcon}
              title="Business alerts"
              subtitle="Decide which events trigger a ping"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSetting
                  label="New bookings"
                  description="Ping when a slot is secured"
                  checked={businessNotifications.newBookings}
                  onChange={(checked) => setBusinessNotifications({ ...businessNotifications, newBookings: checked })}
                />
                <ToggleSetting
                  label="New reviews"
                  description="Notify on fresh testimonials"
                  checked={businessNotifications.newReviews}
                  onChange={(checked) => setBusinessNotifications({ ...businessNotifications, newReviews: checked })}
                />
                <ToggleSetting
                  className="sm:col-span-2"
                  label="Low stock"
                  description="Warn when inventory dips"
                  checked={businessNotifications.lowStock}
                  onChange={(checked) => setBusinessNotifications({ ...businessNotifications, lowStock: checked })}
                />
              </div>
            </SettingCard>
            <SettingCard
              id="notification-channels"
              icon={BellIcon}
              title="Notification channels"
              subtitle="Choose how the team gets notified"
            >
              <div className="space-y-2">
                <ToggleSetting
                  label="Email alerts"
                  description="Send summary emails to the inbox"
                  checked={channelPreferences.email}
                  onChange={(checked) => setChannelPreferences({ ...channelPreferences, email: checked })}
                />
                <ToggleSetting
                  label="SMS nudges"
                  description="Text the ops lead for urgent cases"
                  checked={channelPreferences.sms}
                  onChange={(checked) => setChannelPreferences({ ...channelPreferences, sms: checked })}
                />
                <ToggleSetting
                  label="WhatsApp follow-ups"
                  description="Auto-remind via WhatsApp campaigns"
                  checked={channelPreferences.whatsapp}
                  onChange={(checked) => setChannelPreferences({ ...channelPreferences, whatsapp: checked })}
                />
              </div>
            </SettingCard>
            <SettingCard
              id="escalation-windows"
              icon={CalendarDaysIcon}
              title="Escalation windows"
              subtitle="Define lead time before hand-offs"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <SelectSetting
                  label="Reminder lead"
                  description="Hours before session to remind ops"
                  value={escalationSettings.reminderLead}
                  options={[
                    { value: '1', label: '1 hour' },
                    { value: '3', label: '3 hours' },
                    { value: '6', label: '6 hours' },
                  ]}
                  onChange={(value) => setEscalationSettings({ ...escalationSettings, reminderLead: value })}
                />
                <SelectSetting
                  label="Escalation lead"
                  description="Hours before ops escalates to leads"
                  value={escalationSettings.escalationLead}
                  options={[
                    { value: '6', label: '6 hours' },
                    { value: '12', label: '12 hours' },
                    { value: '24', label: '24 hours' },
                  ]}
                  onChange={(value) => setEscalationSettings({ ...escalationSettings, escalationLead: value })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'automations':
        return (
          <div className="space-y-3">
            <SettingCard
              id="automation-suite"
              icon={Cog6ToothIcon}
              title="Automation suite"
              subtitle="Coordinate no-touch workflows"
            >
              <div className="space-y-2">
                <ToggleSetting
                  label="Auto reminders"
                  description="Send nudges 24h before sessions"
                  checked={automationSettings.autoReminders}
                  onChange={(checked) => setAutomationSettings({ ...automationSettings, autoReminders: checked })}
                />
                <ToggleSetting
                  label="Waitlist autofill"
                  description="Backfill cancellations with waitlist"
                  checked={automationSettings.waitlistAutofill}
                  onChange={(checked) => setAutomationSettings({ ...automationSettings, waitlistAutofill: checked })}
                />
                <ToggleSetting
                  label="Fallback flows"
                  description="Route missed payments to recovery journeys"
                  checked={automationSettings.fallbackFlows}
                  onChange={(checked) => setAutomationSettings({ ...automationSettings, fallbackFlows: checked })}
                />
              </div>
            </SettingCard>
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-3">
            <SettingCard
              id="compliance-controls"
              icon={ShieldCheckIcon}
              title="Compliance controls"
              subtitle="Keep policies and data retention aligned"
            >
              <div className="space-y-2">
                <ToggleSetting
                  label="Require KYC"
                  description="Gate high-value services behind verification"
                  checked={complianceSettings.requireKyc}
                  onChange={(checked) => setComplianceSettings({ ...complianceSettings, requireKyc: checked })}
                />
                <ToggleSetting
                  label="Store consent"
                  description="Archive customer consent artefacts automatically"
                  checked={complianceSettings.storeConsent}
                  onChange={(checked) => setComplianceSettings({ ...complianceSettings, storeConsent: checked })}
                />
                <SelectSetting
                  label="Data retention"
                  description="Days to retain completed session records"
                  value={complianceSettings.dataRetention}
                  options={[
                    { value: '14', label: '14 days' },
                    { value: '30', label: '30 days' },
                    { value: '90', label: '90 days' },
                  ]}
                  onChange={(value) => setComplianceSettings({ ...complianceSettings, dataRetention: value })}
                />
              </div>
            </SettingCard>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr)]">
        <aside className="sticky top-6 h-fit rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 backdrop-blur-xl">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Snapshot</p>
            <ul className="mt-2 space-y-1">
              {quickSummary.map((item) => (
                <li key={item} className="truncate text-xs text-white/65">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <nav className="mt-3 space-y-1">
            {NAVIGATION_SECTIONS.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  activeSection === id
                    ? 'border-white/30 bg-white/15 text-white shadow-lg shadow-white/10'
                    : 'border-white/5 bg-white/[0.04] text-white/55 hover:border-white/15 hover:text-white'
                }`}
                aria-current={activeSection === id ? 'true' : undefined}
              >
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <Icon className="h-4 w-4 text-white/45" />
                  {label}
                </span>
                <span className="mt-1 block text-[10px] text-white/35">{description}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(240px,0.9fr)]">
          <section className="space-y-4" aria-live="polite">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Active group</p>
              <h2 className="text-xl font-semibold text-white">{activeSectionMeta.label}</h2>
              <p className="mt-1 text-sm text-white/60">{activeSectionMeta.description}</p>
            </div>
            {renderSectionContent()}
          </section>

          <SettingsRightRail
            activeSection={activeSection}
            quickSummary={quickSummary}
            productSettings={productSettings}
            pricingSettings={pricingSettings}
            bookingSettings={bookingSettings}
            displaySettings={displaySettings}
            automationSettings={automationSettings}
            businessNotifications={businessNotifications}
            channelPreferences={channelPreferences}
            escalationSettings={escalationSettings}
            complianceSettings={complianceSettings}
          />
        </div>
      </div>
    </div>
  );
}

function SettingCard({ id, icon: Icon, title, subtitle, children }: SettingCardProps) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl"
    >
      <header className="flex items-start gap-3 text-white">
        <div className="rounded-lg border border-white/15 bg-white/10 p-2 text-white/70">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/55">{title}</h2>
          <p className="text-base font-medium text-white">{subtitle}</p>
        </div>
      </header>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ToggleSetting({ label, description, checked, onChange, className }: ToggleSettingProps) {
  return (
    <div
      className={`flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 ${className ?? ''}`}
    >
      <div className="max-w-[75%]">
        <p className="text-white">{label}</p>
        <p className="mt-0.5 text-xs text-white/45">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-10 flex-shrink-0 rounded-full border border-white/20 transition ${
          checked ? 'bg-indigo-400/80' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SelectSetting({ label, description, value, options, onChange, className }: SelectSettingProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 ${className ?? ''}`}
    >
      <p className="text-white">{label}</p>
      <p className="mt-0.5 text-xs text-white/45">{description}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 [&>option]:bg-[#13131f] [&>option]:text-white"
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

export function SettingsSidebar() {
  const [businessNotifications, setBusinessNotifications] = useState({
    newBookings: true,
    newReviews: true,
    lowStock: false,
  });

  const [channelPreferences, setChannelPreferences] = useState({
    email: true,
    sms: false,
    whatsapp: true,
  });

  const [escalationSettings, setEscalationSettings] = useState({
    reminderLead: '3',
    escalationLead: '6',
  });

  return (
    <div className="space-y-4 text-white">
      <SettingCard
        id="alerts"
        icon={BellIcon}
        title="Business Alerts"
        subtitle="Decide which events trigger a ping"
      >
        <div className="grid gap-2">
          <ToggleSetting
            label="New bookings"
            description="Ping when a slot is secured"
            checked={businessNotifications.newBookings}
            onChange={(checked) =>
              setBusinessNotifications({ ...businessNotifications, newBookings: checked })
            }
          />
          <ToggleSetting
            label="New reviews"
            description="Notify on fresh testimonials"
            checked={businessNotifications.newReviews}
            onChange={(checked) =>
              setBusinessNotifications({ ...businessNotifications, newReviews: checked })
            }
          />
          <ToggleSetting
            label="Low stock"
            description="Warn when inventory dips"
            checked={businessNotifications.lowStock}
            onChange={(checked) =>
              setBusinessNotifications({ ...businessNotifications, lowStock: checked })
            }
          />
        </div>
      </SettingCard>

      <SettingCard
        id="channels"
        icon={BellIcon}
        title="Notification Channels"
        subtitle="Choose how the team gets notified"
      >
        <div className="space-y-2">
          <ToggleSetting
            label="Email alerts"
            description="Send summary emails to the inbox"
            checked={channelPreferences.email}
            onChange={(checked) => setChannelPreferences({ ...channelPreferences, email: checked })}
          />
          <ToggleSetting
            label="SMS nudges"
            description="Text the ops lead for urgent cases"
            checked={channelPreferences.sms}
            onChange={(checked) => setChannelPreferences({ ...channelPreferences, sms: checked })}
          />
          <ToggleSetting
            label="WhatsApp follow-ups"
            description="Auto-remind via WhatsApp campaigns"
            checked={channelPreferences.whatsapp}
            onChange={(checked) => setChannelPreferences({ ...channelPreferences, whatsapp: checked })}
          />
        </div>
      </SettingCard>

      <SettingCard
        id="sla"
        icon={CalendarDaysIcon}
        title="Escalation windows"
        subtitle="Define lead time before hand-offs"
      >
        <div className="grid gap-2">
          <SelectSetting
            label="Reminder lead"
            description="Hours before session to remind ops"
            value={escalationSettings.reminderLead}
            options={[
              { value: '1', label: '1 hour' },
              { value: '3', label: '3 hours' },
              { value: '6', label: '6 hours' },
            ]}
            onChange={(value) => setEscalationSettings({ ...escalationSettings, reminderLead: value })}
          />
          <SelectSetting
            label="Escalation lead"
            description="Hours before ops escalates to leads"
            value={escalationSettings.escalationLead}
            options={[
              { value: '6', label: '6 hours' },
              { value: '12', label: '12 hours' },
              { value: '24', label: '24 hours' },
            ]}
            onChange={(value) => setEscalationSettings({ ...escalationSettings, escalationLead: value })}
          />
        </div>
      </SettingCard>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
        <p>
          Need account security or payout updates? Manage personal preferences inside
          <a className="ml-1 underline hover:text-blue-100" href="/profile">
            Profile settings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
