"use client";

import { useState } from 'react';

// Components
import DashboardHeader from './components/DashboardHeader';
import TabNavigation from './components/TabNavigation';
import LoginScreen from './components/LoginScreen';

// Overview Tab Components
import StatsGrid from './components/overview/StatsGrid';
import RecentBookings from './components/overview/RecentBookings';
import RecentReviews from './components/overview/RecentReviews';
import { QuickStats, QuickActions } from './components/overview/Sidebar';

// Content Tab Components
import ListingsGrid from './components/content/ListingsGrid';
import AIContentBanner from './components/content/AIContentBanner';

// Finance Tab Components
import BalanceCards from './components/finance/BalanceCards';
import FinanceStats from './components/finance/FinanceStats';
import TransactionList from './components/finance/TransactionList';
import PremiumFeatures from './components/finance/PremiumFeatures';
import EarnOpportunities from './components/finance/EarnOpportunities';
import { QuickActions as FinanceQuickActions, AboutBMC } from './components/finance/FinanceSidebar';

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

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName] = useState('Demo User');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Marketplace Overview Data
  const marketplaceStats = {
    activeListings: 5,
    totalViews: 1243,
    pendingBookings: 3,
    completedBookings: 28,
    averageRating: 4.8,
    totalReviews: 24,
    responseRate: 95,
    responseTime: '2 hours',
  };

  const myListings = [
    { 
      id: 1, 
      title: 'Professional House Cleaning', 
      category: 'Home Services', 
      price: 450, 
      currency: 'ZAR',
      views: 324, 
      bookings: 12, 
      status: 'active',
      featured: true,
      rating: 4.9,
    },
    { 
      id: 2, 
      title: 'Garden Maintenance & Landscaping', 
      category: 'Outdoor Services', 
      price: 600, 
      currency: 'ZAR',
      views: 189, 
      bookings: 8, 
      status: 'active',
      featured: false,
      rating: 4.7,
    },
    { 
      id: 3, 
      title: 'Math Tutoring (High School)', 
      category: 'Education', 
      price: 250, 
      currency: 'ZAR',
      views: 521, 
      bookings: 15, 
      status: 'active',
      featured: true,
      rating: 5.0,
    },
    { 
      id: 4, 
      title: 'Pet Sitting & Dog Walking', 
      category: 'Pet Care', 
      price: 200, 
      currency: 'ZAR',
      views: 156, 
      bookings: 6, 
      status: 'paused',
      featured: false,
      rating: 4.8,
    },
    { 
      id: 5, 
      title: 'Plumbing Repairs & Installation', 
      category: 'Home Services', 
      price: 550, 
      currency: 'ZAR',
      views: 53, 
      bookings: 2, 
      status: 'draft',
      featured: false,
      rating: 0,
    },
  ];

  const recentBookings = [
    { 
      id: 1, 
      service: 'Professional House Cleaning',
      client: 'Sarah M.',
      date: '2025-10-08',
      time: '09:00 AM',
      amount: 450,
      status: 'confirmed',
    },
    { 
      id: 2, 
      service: 'Math Tutoring (High School)',
      client: 'John D.',
      date: '2025-10-07',
      time: '03:00 PM',
      amount: 250,
      status: 'pending',
    },
    { 
      id: 3, 
      service: 'Garden Maintenance',
      client: 'Mike K.',
      date: '2025-10-06',
      time: '08:00 AM',
      amount: 600,
      status: 'completed',
    },
    { 
      id: 4, 
      service: 'Professional House Cleaning',
      client: 'Linda P.',
      date: '2025-10-05',
      time: '10:00 AM',
      amount: 450,
      status: 'completed',
    },
  ];

  const recentReviews = [
    {
      id: 1,
      service: 'Math Tutoring (High School)',
      client: 'Emma W.',
      rating: 5,
      comment: 'Excellent tutor! My son improved his grades significantly.',
      date: '2 days ago',
    },
    {
      id: 2,
      service: 'Professional House Cleaning',
      client: 'David L.',
      rating: 5,
      comment: 'Very professional and thorough. Highly recommend!',
      date: '5 days ago',
    },
    {
      id: 3,
      service: 'Garden Maintenance',
      client: 'Rachel T.',
      rating: 4,
      comment: 'Good service, arrived on time. Minor issues but overall satisfied.',
      date: '1 week ago',
    },
  ];

  // Finance Data
  const userData = {
    bmcBalance: 1245,
    fiatBalance: 2450.50,
    currency: 'ZAR',
    pendingRewards: 125,
    totalEarned: 3450,
    level: 'Pro Member',
    joinDate: 'March 2025',
  };

  const recentActivity = [
    { type: 'earn', action: 'Completed booking', amount: 25, time: '2 hours ago' },
    { type: 'spend', action: 'Featured listing', amount: -50, time: '5 hours ago' },
    { type: 'earn', action: 'Received 5-star review', amount: 30, time: '1 day ago' },
    { type: 'earn', action: 'Referral bonus', amount: 100, time: '2 days ago' },
    { type: 'spend', action: 'Boosted service', amount: -20, time: '3 days ago' },
  ];

  const earnOpportunities = [
    { title: 'Complete your profile', reward: 25, icon: UserCircleIcon, status: 'available' },
    { title: 'Verify your ID', reward: 50, icon: ShieldCheckIcon, status: 'available' },
    { title: 'List your first service', reward: 50, icon: SparklesIcon, status: 'available' },
    { title: 'Get your first booking', reward: 100, icon: BoltIcon, status: 'locked' },
    { title: 'Refer 3 friends', reward: 300, icon: GiftIcon, status: 'locked' },
  ];

  const premiumFeatures = [
    { title: 'Featured Listing', cost: 50, period: '/week', icon: StarIcon, color: 'from-yellow-500/60 to-orange-500/60' },
    { title: 'Top Search Boost', cost: 20, period: '/day', icon: ArrowTrendingUpIcon, color: 'from-blue-500/60 to-cyan-500/60' },
    { title: 'Verified Pro Badge', cost: 100, period: '/month', icon: ShieldCheckIcon, color: 'from-purple-500/60 to-pink-500/60' },
    { title: 'Priority Support', cost: 25, period: '/month', icon: BoltIcon, color: 'from-emerald-500/60 to-teal-500/60' },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-16 left-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-md px-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <HomeIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Marketplace Dashboard</h1>
              <p className="text-sm text-white/70">Manage your services and grow your business</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:from-blue-600 hover:to-purple-600"
            >
              Login with Demo Account
            </button>

            <p className="mt-4 text-center text-xs text-white/50">
              Demo mode - No authentication required
            </p>
          </div>
        </div>
      </main>
    );
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
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
            <p className="text-sm text-white/60">Manage your marketplace and grow your business</p>
          </div>
          <a
            href="/profile"
            className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <UserCircleIcon className="mr-2 inline-block h-5 w-5" />
            Profile
          </a>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="flex flex-wrap gap-2 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              Content Management
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'finance'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BanknotesIcon className="h-5 w-5" />
              Finance
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main Content */}
            <div className="space-y-4 lg:col-span-8">
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Active Listings</span>
                    <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{marketplaceStats.activeListings}</p>
                  <p className="mt-1 text-xs text-white/50">{marketplaceStats.totalViews.toLocaleString()} total views</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Bookings</span>
                    <CalendarIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{marketplaceStats.pendingBookings}</p>
                  <p className="mt-1 text-xs text-emerald-300">{marketplaceStats.completedBookings} completed</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Rating</span>
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{marketplaceStats.averageRating}</p>
                  <p className="mt-1 text-xs text-white/50">{marketplaceStats.totalReviews} reviews</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Response Rate</span>
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{marketplaceStats.responseRate}%</p>
                  <p className="mt-1 text-xs text-white/50">Avg {marketplaceStats.responseTime}</p>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">{booking.service}</h3>
                            <p className="mt-1 text-xs text-white/60">Client: {booking.client}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {booking.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {booking.time}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">R{booking.amount}</p>
                            <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Recent Reviews</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-white/60">{review.service}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-white">{review.comment}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                          <span>{review.client}</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:col-span-4">
              {/* Quick Stats */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Quick Stats</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">This Week&apos;s Earnings</span>
                    <span className="text-sm font-bold text-emerald-300">R1,850</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">New Messages</span>
                    <span className="text-sm font-bold text-blue-300">7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Profile Views</span>
                    <span className="text-sm font-bold text-purple-300">342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">BMC Balance</span>
                    <span className="text-sm font-bold text-yellow-300">{userData.bmcBalance} BMC</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <button className="w-full rounded-lg border border-white/15 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-3 text-left text-sm font-semibold text-white transition hover:from-purple-500/30 hover:to-blue-500/30">
                    <PlusCircleIcon className="mr-2 inline-block h-5 w-5" />
                    Create New Listing
                  </button>
                  <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                    <ChatBubbleLeftRightIcon className="mr-2 inline-block h-5 w-5" />
                    View Messages
                  </button>
                  <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                    <CalendarIcon className="mr-2 inline-block h-5 w-5" />
                    Manage Calendar
                  </button>
                  <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                    <ChartBarIcon className="mr-2 inline-block h-5 w-5" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT MANAGEMENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">My Listings</h2>
                <p className="text-sm text-white/60">Manage your services and content</p>
              </div>
              <button className="rounded-lg border border-white/15 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600">
                <PlusCircleIcon className="mr-2 inline-block h-5 w-5" />
                Create New Listing
              </button>
            </div>

            {/* Listings Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
              {myListings.map((listing) => (
                <div key={listing.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{listing.title}</h3>
                          {listing.featured && (
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60">{listing.category}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        listing.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                        listing.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {listing.status}
                      </span>
                    </div>

                    <div className="mb-4 flex items-center gap-4 text-sm">
                      <span className="font-bold text-white">
                        R{listing.price} {listing.currency}
                      </span>
                      {listing.rating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <StarIcon className="h-4 w-4 fill-current" />
                          {listing.rating}
                        </span>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-center">
                        <p className="text-xs text-white/60">Views</p>
                        <p className="text-sm font-bold text-white">{listing.views}</p>
                      </div>
                      <div className="text-center border-x border-white/10">
                        <p className="text-xs text-white/60">Bookings</p>
                        <p className="text-sm font-bold text-white">{listing.bookings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/60">Conv Rate</p>
                        <p className="text-sm font-bold text-white">
                          {listing.views > 0 ? Math.round((listing.bookings / listing.views) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                        <PencilSquareIcon className="mx-auto h-4 w-4 mb-1" />
                        Edit
                      </button>
                      <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                        <EyeIcon className="mx-auto h-4 w-4 mb-1" />
                        View
                      </button>
                      <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                        <FireIcon className="mx-auto h-4 w-4 mb-1" />
                        Boost
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Future AI Content Creation Section */}
            <div className="overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 shadow-xl backdrop-blur-2xl">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                  <BeakerIcon className="h-6 w-6 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-semibold text-white">AI Content Creation (Coming Soon)</h3>
                  <p className="text-sm text-white/70">
                    Soon you&apos;ll be able to generate listing descriptions, images, and optimize your content using AI. 
                    Create professional listings in seconds without needing photos or writing skills.
                  </p>
                  <button className="mt-3 rounded-lg border border-purple-300/30 bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/30">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main Content */}
            <div className="space-y-4 lg:col-span-8">
              {/* Balance Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 opacity-0 transition group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-widest text-white/60">Platform Credits</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-200">
                        <SparklesIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{userData.bmcBalance.toLocaleString()}</span>
                      <span className="text-lg text-white/60">BMC</span>
                    </div>
                    <p className="text-xs text-white/50">≈ R{userData.bmcBalance.toLocaleString()} {userData.currency}</p>
                    <button className="mt-4 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20">
                      Buy More Credits
                    </button>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 transition group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-widest text-white/60">Wallet Balance</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
                        <WalletIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">R{userData.fiatBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                      <span className="text-lg text-white/60">{userData.currency}</span>
                    </div>
                    <p className="text-xs text-white/50">Available for withdrawal</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20">
                        Deposit
                      </button>
                      <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20">
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Pending Rewards</span>
                    <GiftIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userData.pendingRewards} BMC</p>
                  <button className="mt-2 text-xs font-semibold text-blue-300 hover:text-blue-200">Claim Now →</button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Total Earned</span>
                    <ChartBarIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userData.totalEarned.toLocaleString()} BMC</p>
                  <p className="mt-2 text-xs text-emerald-300">+12.5% this month</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/60">Member Level</span>
                    <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userData.level}</p>
                  <p className="mt-2 text-xs text-white/50">Since {userData.joinDate}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            activity.type === 'earn' 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {activity.type === 'earn' ? (
                              <ArrowDownLeftIcon className="h-4 w-4" />
                            ) : (
                              <ArrowUpRightIcon className="h-4 w-4" />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{activity.action}</p>
                            <p className="text-xs text-white/50">{activity.time}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${
                          activity.type === 'earn' ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {activity.amount > 0 ? '+' : ''}{activity.amount} BMC
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Features */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Premium Features</h2>
                  <p className="text-xs text-white/60">Unlock advanced tools with your credits</p>
                </div>
                <div className="p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {premiumFeatures.map((feature, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition group-hover:opacity-60`} />
                        <div className="relative z-10">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                              <feature.icon className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-xs font-semibold text-white">{feature.cost} BMC{feature.period}</span>
                          </div>
                          <h3 className="mb-1 text-sm font-semibold text-white">{feature.title}</h3>
                          <button className="mt-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">
                            Activate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:col-span-4">
              {/* Earn Opportunities */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Earn More Credits</h2>
                  <p className="text-xs text-white/60">Complete tasks to earn BMC</p>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {earnOpportunities.map((opportunity, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-lg border border-white/10 p-3 ${
                          opportunity.status === 'locked' 
                            ? 'bg-white/5 opacity-50' 
                            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <opportunity.icon className="h-4 w-4 text-white" />
                          </span>
                          <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-bold text-yellow-300">
                            +{opportunity.reward} BMC
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-white">{opportunity.title}</h3>
                        {opportunity.status === 'available' ? (
                          <button className="mt-2 text-xs font-semibold text-blue-300 hover:text-blue-200">
                            Start now →
                          </button>
                        ) : (
                          <p className="mt-2 text-xs text-white/50">Complete previous tasks first</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <button className="w-full rounded-lg border border-white/15 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-3 text-left text-sm font-semibold text-white transition hover:from-blue-500/30 hover:to-purple-500/30">
                      <CurrencyDollarIcon className="mr-2 inline-block h-5 w-5" />
                      Send Money to User
                    </button>
                    <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                      <FireIcon className="mr-2 inline-block h-5 w-5" />
                      Boost Your Listing
                    </button>
                    <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                      <StarIcon className="mr-2 inline-block h-5 w-5" />
                      Feature a Service
                    </button>
                    <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
                      <ClockIcon className="mr-2 inline-block h-5 w-5" />
                      Transaction History
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 shadow-xl backdrop-blur-2xl">
                <div className="mb-2 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-blue-300" />
                  <h3 className="text-sm font-semibold text-white">About BMC Credits</h3>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  BMC (Bitcoin Mascot Credits) are platform credits used for premium features, boosting listings, and peer-to-peer transfers. Earn them for free or purchase as needed.
                </p>
                <button className="mt-3 text-xs font-semibold text-blue-300 hover:text-blue-200">
                  Learn more →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
