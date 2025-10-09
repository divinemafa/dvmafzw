"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { TabNavigation } from './components/TabNavigation';

// Overview Tab Components
import { StatsGrid } from './components/overview/StatsGrid';
import { RecentBookings } from './components/overview/RecentBookings';
import { RecentReviews } from './components/overview/RecentReviews';
import { QuickStats, QuickActions } from './components/overview/Sidebar';

// Content Tab Components
import { ListingsGrid } from './components/content/ListingsGrid';
import { AIContentBanner } from './components/content/AIContentBanner';

// Finance Tab Components
import { BalanceCards } from './components/finance/BalanceCards';
import { FinanceStats } from './components/finance/FinanceStats';
import { TransactionList } from './components/finance/TransactionList';
import { PremiumFeatures } from './components/finance/PremiumFeatures';
import { EarnOpportunities } from './components/finance/EarnOpportunities';
import { FinanceSidebar } from './components/finance/FinanceSidebar';

// New Tab Components
import { BookingsTab } from './components/bookings/BookingsTab';
import { MessagesTab } from './components/messages/MessagesTab';
import { CalendarTab } from './components/calendar/CalendarTab';
import { ReviewsTab } from './components/reviews/ReviewsTab';
import { ClientsTab } from './components/clients/ClientsTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { SettingsTab } from './components/settings/SettingsTab';

// Types and Data
import type { TabType } from './types';
import {
  mockMarketplaceStats,
  mockListings,
  mockBookings,
  mockReviews,
  mockUserData,
  mockActivity,
  mockEarnOpportunities,
  mockPremiumFeatures,
} from './mockData';

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
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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

  // Main Dashboard with ALL 10 Tabs
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6">
        {/* Header */}
        <DashboardHeader userName={userName} />

        {/* Tab Navigation - Horizontal Scroll on Mobile */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main Content - Left Column */}
            <div className="space-y-4 lg:col-span-8">
              <StatsGrid stats={mockMarketplaceStats} />
              <RecentBookings bookings={mockBookings} />
              <RecentReviews reviews={mockReviews} />
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-4 lg:col-span-4">
              <QuickStats bmcBalance={mockUserData.bmcBalance} />
              <QuickActions />
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <BookingsTab bookings={mockBookings} />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <MessagesTab messages={[]} />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <CalendarTab events={[]} timeSlots={[]} />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* CONTENT MANAGEMENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <AIContentBanner />
            <ListingsGrid listings={mockListings} />
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main Content - Left Column */}
            <div className="space-y-6 lg:col-span-8">
              <BalanceCards userData={mockUserData} />
              <FinanceStats userData={mockUserData} />
              <TransactionList activities={mockActivity} />
              <PremiumFeatures features={mockPremiumFeatures} />
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-4 lg:col-span-4">
              <EarnOpportunities opportunities={mockEarnOpportunities} />
              <FinanceSidebar />
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <ReviewsTab reviews={mockReviews} />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <ClientsTab clients={[]} />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <AnalyticsTab />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <SettingsTab />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
