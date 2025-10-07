"use client";

import { useState } from 'react';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { TabNavigation } from './components/TabNavigation';
import { LoginScreen } from './components/LoginScreen';

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
 * Refactored from 830+ lines to ~150 lines with focused components
 */
export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName] = useState('Demo User');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Login Screen
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Main Dashboard with Tabs
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

        {/* Tab Navigation */}
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
              {/* Balance Cards */}
              <BalanceCards userData={mockUserData} />

              {/* Finance Stats */}
              <FinanceStats userData={mockUserData} />

              {/* Transaction List */}
              <TransactionList activities={mockActivity} />

              {/* Premium Features */}
              <PremiumFeatures features={mockPremiumFeatures} />
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-4 lg:col-span-4">
              <EarnOpportunities opportunities={mockEarnOpportunities} />
              <FinanceSidebar />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
