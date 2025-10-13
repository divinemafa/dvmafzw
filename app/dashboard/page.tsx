"use client";

import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { Squares2X2Icon, ArrowsRightLeftIcon, SparklesIcon, ShieldCheckIcon, BanknotesIcon } from '@heroicons/react/24/outline';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar } from './components/DashboardSidebar';
import { FloatingChatButton } from './components/FloatingChatButton';

// Overview Tab Components
import { CompactTileGrid } from './components/overview/CompactTileGrid';
import { QuickActions } from './components/overview/Sidebar';

// Content Tab Components
import { ListingsGrid } from './components/content/ListingsGrid';
import { AIContentBanner } from './components/content/AIContentBanner';

// Finance Tab Components
import { FinanceStats } from './components/finance/FinanceStats';
import { TransactionList } from './components/finance/TransactionList';
import { PremiumFeatures } from './components/finance/PremiumFeatures';
import { EarnOpportunities } from './components/finance/EarnOpportunities';
import { FinanceSidebar } from './components/finance/FinanceSidebar';
import { FinanceOverviewTallCard } from './components/finance/FinanceOverviewTallCard';
import { FinanceInfoTabs } from './components/finance/FinanceInfoTabs';
import { FinanceTransactionInsights } from './components/finance/FinanceTransactionInsights';
import { FinanceComplianceSummary } from './components/finance/FinanceComplianceSummary';
import { FinancePayoutPlanner } from './components/finance/FinancePayoutPlanner';

// New Tab Components
import { BookingsTab } from './components/bookings/BookingsTab';
import { MessagesTab, MessagesInsights } from './components/messages/MessagesTab';
import { CalendarTab } from './components/calendar/CalendarTab';
import { ReviewsTab, ReviewsInsights } from './components/reviews/ReviewsTab';
import { ClientsTab, ClientsInsights } from './components/clients/ClientsTab';
import { AnalyticsTab, AnalyticsInsights } from './components/analytics/AnalyticsTab';
import { SettingsTab, SettingsSidebar } from './components/settings/SettingsTab';

// Types and Data
import type { TabType, Listing } from './types';
import {
  mockMarketplaceStats,
  mockListings,
  mockBookings,
  mockReviews,
  mockUserData,
  mockActivity,
  mockEarnOpportunities,
  mockPremiumFeatures,
  mockClients,
} from './mockData';

type FinanceModuleId = 'overview' | 'payouts' | 'transactions' | 'earn' | 'compliance';

interface FinanceModule {
  id: FinanceModuleId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const financeModules: FinanceModule[] = [
  {
    id: 'overview',
    label: 'Portfolio Snapshot',
    description: 'Balances, momentum, safety scores',
    icon: Squares2X2Icon,
  },
  {
    id: 'payouts',
    label: 'Payout Planner',
    description: 'Scheduled releases and withdrawals',
    icon: BanknotesIcon,
  },
  {
    id: 'transactions',
    label: 'Money Movement',
    description: 'Payouts, refunds, and inflows',
    icon: ArrowsRightLeftIcon,
  },
  {
    id: 'earn',
    label: 'Earn & Boosts',
    description: 'Premium features and reward tasks',
    icon: SparklesIcon,
  },
  {
    id: 'compliance',
    label: 'Compliance Hub',
    description: 'Tax, disputes, and verifications',
    icon: ShieldCheckIcon,
  },
];

const transactionInsightMetrics = [
  {
    label: 'Net Volume (7d)',
    value: 'R12,450',
    delta: { direction: 'up' as const, label: '+8.2%' },
  },
  {
    label: 'Refund Rate',
    value: '2.1%',
    delta: { direction: 'down' as const, label: '-0.4%' },
  },
  {
    label: 'Avg. Settlement',
    value: '16h',
    delta: { direction: 'steady' as const, label: 'On target' },
  },
];

const transactionAlerts = [
  {
    title: 'Payout ready for release',
    description: 'R3,820 will be released to your bank account tomorrow at 10:00.',
    severity: 'info' as const,
  },
  {
    title: 'Chargeback response required',
    description: 'Booking #1298 needs supporting documents within 24 hours.',
    severity: 'critical' as const,
  },
  {
    title: 'Unusual spike detected',
    description: 'Transactions increased 42% in the last 2 hours compared to typical activity.',
    severity: 'warning' as const,
  },
];

const complianceStatuses = [
  {
    title: 'Business KYC Level 2',
    state: 'complete' as const,
    description: 'All company documents and directors verified.',
  },
  {
    title: 'Annual tax submission',
    state: 'attention' as const,
    description: 'Upload updated SARS tax clearance certificate.',
    deadline: 'Oct 22',
  },
  {
    title: 'Bank revalidation',
    state: 'pending' as const,
    description: 'Awaiting confirmation from First National Bank.',
  },
  {
    title: 'Chargeback responses',
    state: 'attention' as const,
    description: '2 open disputes require evidence submission.',
    deadline: 'Oct 12',
  },
];

const complianceAudits = [
  {
    label: 'Disputes resolved',
    value: '12',
    trend: { direction: 'up' as const, label: '+3 this month' },
  },
  {
    label: 'VAT collected (Q4)',
    value: 'R42,900',
    trend: { direction: 'steady' as const, label: 'Awaiting filing' },
  },
  {
    label: 'Documents expiring',
    value: '1',
    trend: { direction: 'down' as const, label: '-2 vs last quarter' },
  },
];

const complianceInsightMetrics = [
  {
    label: 'Pending verifications',
    value: '3',
    delta: { direction: 'down' as const, label: '-2 w/w' },
  },
  {
    label: 'Disputes in progress',
    value: '2',
    delta: { direction: 'steady' as const, label: 'Unchanged' },
  },
  {
    label: 'Average resolution time',
    value: '18h',
    delta: { direction: 'up' as const, label: '+4h' },
  },
];

const complianceAlerts = [
  {
    title: 'Tax filing due in 12 days',
    description: 'Complete the FY2025 SARS submission to avoid penalties.',
    severity: 'warning' as const,
  },
  {
    title: 'Payment institution audit',
    description: 'Upload updated proof-of-address for payout account.',
    severity: 'critical' as const,
  },
];

const payoutSchedule = [
  {
    id: 'pay-32',
    amount: 'R3,820.00',
    status: 'processing' as const,
    eta: 'Arriving tomorrow 10:00',
    method: 'FNB Business Account ••1290',
    reference: 'INV-2025/0103',
  },
  {
    id: 'pay-31',
    amount: 'R1,950.00',
    status: 'scheduled' as const,
    eta: 'Oct 14, 09:00',
    method: 'USDC Wallet ••95A7',
    reference: 'SUB-2025/0919',
  },
  {
    id: 'pay-30',
    amount: 'R780.00',
    status: 'on-hold' as const,
    eta: 'Awaiting verification',
    method: 'Capitec Savings ••8821',
    reference: 'REF-2025/0904',
  },
];

const payoutInsightMetrics = [
  {
    label: 'Pending payouts',
    value: '3',
    delta: { direction: 'up' as const, label: '+1 vs last week' },
  },
  {
    label: 'Avg. processing time',
    value: '14h',
    delta: { direction: 'down' as const, label: '-3h' },
  },
  {
    label: 'On-hold value',
    value: 'R780',
    delta: { direction: 'steady' as const, label: 'Awaiting docs' },
  },
];

const payoutAlerts = [
  {
    title: 'Verification needed for REF-2025/0904',
    description: 'Upload updated bank statement to release the hold.',
    severity: 'warning' as const,
  },
  {
    title: 'FX rate favourable for USDC',
    description: 'ZAR/USDC rate improved by 3% today. Consider converting payout.',
    severity: 'info' as const,
  },
];

const payoutHistory = [
  {
    id: 'hist-12',
    amount: 'R2,450.00',
    completedAt: 'Oct 5 • 14:20',
    destination: 'FNB Business Account',
  },
  {
    id: 'hist-11',
    amount: 'R950.00',
    completedAt: 'Oct 3 • 08:15',
    destination: 'USDC Wallet 0x7d…95A7',
    hash: '0x9185…cd12',
  },
  {
    id: 'hist-10',
    amount: 'R1,120.00',
    completedAt: 'Sep 29 • 12:40',
    destination: 'PayPal Merchant',
  },
];

const financeFrameClasses = [
  'relative isolate flex min-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(30,64,175,0.75)]',
].join(' ');

const financeFrameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)]';

/**
 * DashboardPage - Main marketplace dashboard
 * 
 * Three main tabs:
 * 1. Overview - Stats, bookings, reviews
 * 2. Content Management - Listings and AI tools
 * 3. Finance - Balances, transactions, earning opportunities
 * 
 * Now uses REAL authentication (replaces demo LoginScreen)
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeFinanceModule, setActiveFinanceModule] = useState<FinanceModuleId>('overview');
  
  // Real listings state
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  
  // Real bookings state
  const [bookings, setBookings] = useState<typeof mockBookings>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch real listings from API
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        setListingsLoading(true);
        // Fetch user's own listings (including drafts, paused, etc.)
        const response = await fetch('/api/listings?my_listings=true');
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform API response to match Listing type
          const transformedListings: Listing[] = (data.listings || []).map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            category: listing.category || 'Uncategorized',
            price: parseFloat(listing.price) || 0,
            currency: listing.currency || 'ZAR',
            views: listing.views || 0,
            bookings: listing.bookings || 0,
            status: listing.status || 'draft',
            featured: listing.featured || false,
            rating: listing.rating || 0,
            imageUrl: listing.image_url || null,
          }));
          
          setListings(transformedListings);
        } else {
          console.error('Failed to fetch listings:', response.statusText);
          // Fall back to mock data on error
          setListings(mockListings);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Fall back to mock data on error
        setListings(mockListings);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, [user]);
  
  // Fetch real bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !session) return;
      
      try {
        setBookingsLoading(true);
        // Fetch user's bookings (both as provider and client) with authentication
        const response = await fetch('/api/bookings/recent?limit=50', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform API response to match Booking type
          const transformedBookings = (data.bookings || []).map((booking: any) => ({
            id: booking.id,
            listingTitle: booking.listingTitle || booking.project_title,
            service: booking.listingTitle || booking.project_title,
            client: booking.client || 'Anonymous',
            date: booking.preferredDate || booking.startDate || booking.createdAt,
            startDate: booking.preferredDate || booking.startDate,
            time: booking.preferredDate ? new Date(booking.preferredDate).toLocaleTimeString() : '',
            location: booking.location,
            amount: booking.amount,
            status: booking.status,
          }));
          
          setBookings(transformedBookings);
        } else {
          console.error('Failed to fetch bookings:', response.statusText);
          // Fall back to mock data on error
          setBookings(mockBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fall back to mock data on error
        setBookings(mockBookings);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user, session]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
          <p className="text-sm text-white/70">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  // Don't render anything if not authenticated (redirect happening)
  if (!user) {
    return null;
  }

  // Get user's display name from profile or email
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const renderFinanceModuleContent = () => {
    switch (activeFinanceModule) {
      case 'overview':
        return <FinanceOverviewTallCard userData={mockUserData} />;
      case 'payouts':
        return (
          <FinancePayoutPlanner upcoming={payoutSchedule} history={payoutHistory} />
        );
      case 'transactions':
        return (
          <TransactionList activities={mockActivity} className="flex-1" />
        );
      case 'earn':
        return (
          <div className="flex flex-col gap-4">
            <PremiumFeatures features={mockPremiumFeatures} className="lg:max-h-[260px]" />
            <EarnOpportunities opportunities={mockEarnOpportunities} className="lg:max-h-[240px]" />
          </div>
        );
      case 'compliance':
        return (
          <FinanceComplianceSummary statuses={complianceStatuses} audits={complianceAudits} />
        );
      default:
        return null;
    }
  };

  const renderFinanceModuleAside = () => {
    switch (activeFinanceModule) {
      case 'overview':
        return (
          <>
            <FinanceStats userData={mockUserData} />
            <FinanceInfoTabs className="lg:flex-1" />
            <FinanceSidebar />
          </>
        );
      case 'payouts':
        return (
          <>
            <FinanceTransactionInsights
              title="Payout performance"
              subtitle="Track release velocity and items on hold."
              metrics={payoutInsightMetrics}
              alerts={payoutAlerts}
              ctaLabel="Configure payout rules"
              ctaIcon={BanknotesIcon}
            />
            <FinanceSidebar />
          </>
        );
      case 'transactions':
        return (
          <>
            <FinanceTransactionInsights metrics={transactionInsightMetrics} alerts={transactionAlerts} />
            <FinanceSidebar />
          </>
        );
      case 'earn':
        return (
          <>
            <FinanceStats userData={mockUserData} />
            <FinanceInfoTabs className="lg:flex-1" />
            <FinanceSidebar />
          </>
        );
      case 'compliance':
        return (
          <>
            <FinanceTransactionInsights
              metrics={complianceInsightMetrics}
              alerts={complianceAlerts}
              title="Compliance Signals"
              subtitle="Monitor regulatory checks, audits, and dispute health."
              ctaLabel="Manage policies"
            />
            <FinanceSidebar />
          </>
        );
      default:
        return null;
    }
  };

  const quickActionsAside = (
    <div className="space-y-4">
      <QuickActions />
    </div>
  );

  const renderStandardTab = (
    main: React.ReactNode,
    aside: React.ReactNode | null = quickActionsAside,
  ) => (
    <div className={`grid gap-4 ${aside ? 'lg:grid-cols-12' : ''}`} aria-live="polite">
      <div
        className={`space-y-4 ${aside ? 'lg:col-span-8' : ''}`}
        role="region"
        aria-label="Primary content"
      >
        {main}
      </div>
      {aside ? (
        <aside className="space-y-4 lg:col-span-4" aria-label="Secondary actions">
          {aside}
        </aside>
      ) : null}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CompactTileGrid
            stats={mockMarketplaceStats}
            bookings={mockBookings}
            reviews={mockReviews}
            onTabChange={setActiveTab}
            listings={listings}
            listingsLoading={listingsLoading}
          />
        );
      case 'content':
        return (
          <div className="space-y-6">
            <AIContentBanner />
            {listingsLoading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
                  <p className="text-sm text-white/70">Loading your listings...</p>
                </div>
              </div>
            ) : (
              <ListingsGrid listings={listings} />
            )}
          </div>
        );
      case 'finance':
        return (
          <div className={financeFrameClasses} aria-live="polite">
            <div className={financeFrameOverlayClasses} aria-hidden />
            <div className="relative grid gap-4 lg:grid-cols-12">
              <nav
                className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_40px_140px_-120px_rgba(148,163,184,0.6)] backdrop-blur-2xl lg:col-span-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1"
                aria-label="Finance modules"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Finance Modules</h2>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    {financeModules.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {financeModules.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeFinanceModule === module.id;
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => setActiveFinanceModule(module.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD24DF]/50 ${
                          isActive
                            ? 'border-white/40 bg-white/15 text-white shadow-lg shadow-[#BD24DF]/20'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                        }`}
                        aria-pressed={isActive}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-2xl border p-2 ${
                              isActive
                                ? 'border-[#BD24DF]/30 bg-[#BD24DF]/20 text-white'
                                : 'border-white/10 bg-white/10 text-white/60'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{module.label}</p>
                            <p className="text-xs text-white/60">{module.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>

              <section
                className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_45px_140px_-120px_rgba(79,70,229,0.65)] backdrop-blur-2xl lg:col-span-6 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1"
                aria-label="Finance detail"
              >
                {renderFinanceModuleContent()}
              </section>

              <aside
                className="flex flex-col gap-4 lg:col-span-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1"
                aria-label="Finance insights"
              >
                {renderFinanceModuleAside()}
              </aside>
            </div>
          </div>
        );
      case 'bookings':
        return renderStandardTab(
          <BookingsTab bookings={bookings} />,
          null,
        );
      case 'messages':
        return renderStandardTab(
          <MessagesTab messages={[]} />,
          <MessagesInsights messages={[]} />
        ); // TODO: Inject real-time threads from messaging API.
      case 'calendar':
        return renderStandardTab(
          <CalendarTab events={[]} timeSlots={[]} />,
          null,
        ); // TODO: Feed availability slots from calendar integration.
      case 'reviews':
        return renderStandardTab(
          <ReviewsTab reviews={mockReviews} />,
          (
            <div className="space-y-4">
              <QuickActions />
              <ReviewsInsights reviews={mockReviews} />
            </div>
          )
        ); // TODO: Source reviews from marketplace feedback service.
      case 'clients':
        return renderStandardTab(
          <ClientsTab clients={mockClients} />,
          (
            <div className="space-y-4">
              <QuickActions />
              <ClientsInsights clients={mockClients} />
            </div>
          )
        ); // TODO: Populate with CRM customer data.
      case 'analytics':
        return renderStandardTab(
          <AnalyticsTab />,
          <AnalyticsInsights />
        ); // TODO: Connect to analytics pipeline for traffic and conversion data.
      case 'settings':
        return renderStandardTab(
          <SettingsTab />,
          <SettingsSidebar />
        ); // TODO: Replace with authenticated account settings payload.
      default:
        return null;
    }
  };

  // Main Dashboard with ALL 10 Tabs - Full Screen Layout
  return (
    <main className="relative flex min-h-screen">
      {/* Collapsible Sidebar Navigation */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area - adjusts based on sidebar state */}
      <div className="flex-1 overflow-y-auto transition-all lg:ml-20">
        {/* Background ambience */}
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1800px] flex-col px-1 py-1">
          {/* Header - Compact */}
          <div className="shrink-0">
            <DashboardHeader userName={userName} />
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 px-4 py-4" role="region" aria-live="polite">
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* Floating Chat Support Button */}
      <FloatingChatButton />
    </main>
  );
}
