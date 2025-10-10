/**
 * CompactTileGrid - Dense, colorful tile-based dashboard layout
 * Inspired by modern dashboard designs with collapsible sections
 */

'use client';

import { useState } from 'react';
import {
  DocumentTextIcon,
  TicketIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import type { MarketplaceStats, Booking, Review } from '../../types';

interface CompactTileGridProps {
  stats: MarketplaceStats;
  bookings: Booking[];
  reviews: Review[];
}

export const CompactTileGrid = ({ stats, bookings, reviews }: CompactTileGridProps) => {
  const [expandedSection, setExpandedSection] = useState<'activity' | 'bookings' | 'reviews' | 'analytics' | null>(null);

  // Toggle function - only one section open at a time
  const toggleSection = (section: 'activity' | 'bookings' | 'reviews' | 'analytics') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="grid h-[calc(100vh-120px)] grid-cols-12 grid-rows-[repeat(20,minmax(0,1fr))] gap-0.5 overflow-hidden">
      {/* Row 1: Top Stats - Only 2 tiles (left half) */}
      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <DocumentTextIcon className="mb-2 h-6 w-6 text-blue-400" />
        <p className="text-3xl font-bold text-white">{stats.activeListings}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Active Listings</p>
        <p className="text-[10px] text-white/60">{stats.totalViews.toLocaleString()} views</p>
      </div>

      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <div className="mb-2 flex items-start justify-between">
          <TicketIcon className="h-6 w-6 text-emerald-400" />
          <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-sm">+12%</span>
        </div>
        <p className="text-3xl font-bold text-white">{stats.pendingBookings}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Bookings</p>
        <p className="text-[10px] text-white/60">{stats.completedBookings} completed</p>
      </div>

      {/* Row 1 Right: Quick Actions - New Listing and Messages */}
      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <PlusIcon className="mb-2 h-6 w-6 text-indigo-400" />
        <p className="text-xl font-bold text-white">New Listing</p>
        <p className="text-[10px] text-white/60">Create content</p>
      </div>

      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <EnvelopeIcon className="mb-2 h-6 w-6 text-pink-400" />
        <p className="text-xl font-bold text-white">Messages</p>
        <p className="text-[10px] font-semibold text-pink-300">3 unread</p>
      </div>

      {/* Row 2 Left: More Stats */}
      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <StarIcon className="mb-2 h-6 w-6 text-yellow-400" />
        <p className="text-3xl font-bold text-white">{stats.averageRating}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Rating</p>
        <p className="text-[10px] text-white/60">{stats.totalReviews} reviews</p>
      </div>

      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <ChatBubbleLeftRightIcon className="mb-2 h-6 w-6 text-purple-400" />
        <p className="text-3xl font-bold text-white">{stats.responseRate}%</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Response Rate</p>
        <p className="text-[10px] text-white/60">Avg {stats.responseTime}</p>
      </div>

      {/* Row 2 Right: Calendar and Analytics */}
      <div className="col-span-3 row-span-3 border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
        <CalendarIcon className="mb-2 h-6 w-6 text-orange-400" />
        <p className="text-xl font-bold text-white">Calendar</p>
        <p className="text-[10px] text-white/60">View schedule</p>
      </div>

      <div 
        className="col-span-3 row-span-3 cursor-pointer border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
        onClick={() => toggleSection('analytics')}
      >
        <div className="flex items-start justify-between">
          <ChartPieIcon className="mb-2 h-6 w-6 text-cyan-400" />
          {expandedSection === 'analytics' ? (
            <ChevronUpIcon className="h-4 w-4 text-white/90" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-white/90" />
          )}
        </div>
        <p className="text-xl font-bold text-white">Analytics</p>
        <p className="text-[10px] font-medium text-purple-300">View insights</p>
      </div>

      {/* Row 3 Left Column: Mini Widgets Stack (5 tiny tiles in a column) */}
      <div className="col-span-3 row-span-10 flex flex-col gap-0.5">
        {/* Mini Widget 1: Total Revenue */}
        <div className="flex-1 border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <CurrencyDollarIcon className="mb-1 h-4 w-4 text-green-400" />
          <p className="text-lg font-bold text-white">$15.3K</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/70">Revenue</p>
        </div>

        {/* Mini Widget 2: Conversion Rate */}
        <div className="flex-1 border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <ChartBarIcon className="mb-1 h-4 w-4 text-cyan-400" />
          <p className="text-lg font-bold text-white">12.8%</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/70">Conversion</p>
        </div>

        {/* Mini Widget 3: Active Users */}
        <div className="flex-1 border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <EyeIcon className="mb-1 h-4 w-4 text-violet-400" />
          <p className="text-lg font-bold text-white">2.5K</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/70">Visitors</p>
        </div>

        {/* Mini Widget 4: Pending Tasks */}
        <div className="flex-1 border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <TicketIcon className="mb-1 h-4 w-4 text-rose-400" />
          <p className="text-lg font-bold text-white">7</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/70">Pending</p>
        </div>

        {/* Mini Widget 5: Success Rate */}
        <div className="flex-1 border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
          <StarIcon className="mb-1 h-4 w-4 text-teal-400" />
          <p className="text-lg font-bold text-white">98%</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/70">Success</p>
        </div>
      </div>

      {/* Row 2: Activity Chart - Better contrast colors */}
      <div className="col-span-6 row-span-10 border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Activity Overview</h3>
              <p className="text-[10px] text-cyan-300">Weekly performance</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="rounded border border-cyan-400/30 bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 backdrop-blur-sm transition hover:border-cyan-400/50 hover:bg-cyan-400/30">7D</button>
            <button className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10">30D</button>
          </div>
        </div>

        {/* Mini chart bars with better contrast gradient */}
        <div className="flex h-32 items-end gap-1">
          {[12, 19, 15, 22, 28, 31, 18].map((value, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t bg-gradient-to-t from-[#BD24DF] to-[#2D6ADE] transition hover:from-[#d040f5] hover:to-[#4080ff]"
                style={{ height: `${(value / 31) * 100}%` }}
              />
              <span className="text-[9px] font-bold text-white/80">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom stats with much better contrast */}
        <div className="mt-2 grid grid-cols-3 gap-0 border-t border-white/20 pt-2">
          <div className="border-r border-white/20 pr-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/60">Total Views</p>
            <p className="text-lg font-bold text-white">2.5K</p>
            <p className="text-[9px] font-bold text-emerald-400">↑ 18.2%</p>
          </div>
          <div className="border-r border-white/20 px-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/60">Total Bookings</p>
            <p className="text-lg font-bold text-white">145</p>
            <p className="text-[9px] font-bold text-emerald-400">↑ 12.5%</p>
          </div>
          <div className="pl-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/60">Revenue</p>
            <p className="text-lg font-bold text-white">$15.3K</p>
            <p className="text-[9px] font-bold text-emerald-400">↑ 24.8%</p>
          </div>
        </div>
      </div>

      {/* Row 3 Right: Recent Reviews - Collapsible tile (RIGHT side of Activity Chart) */}
      <div
        className={`cursor-pointer overflow-hidden border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 ${
          expandedSection === 'reviews' ? 'col-span-3 row-span-8' : 'col-span-3 row-span-5'
        }`}
        onClick={() => toggleSection('reviews')}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Reviews</h3>
          </div>
          {expandedSection === 'reviews' ? (
            <ChevronUpIcon className="h-4 w-4 text-white/80" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-white/80" />
          )}
        </div>

        {expandedSection === 'reviews' ? (
          <div className="space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 48px)' }}>
            {reviews.slice(0, 3).map((review, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10">
                <div className="mb-1 flex items-start gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-bold text-white backdrop-blur-sm">
                    {(review.reviewerName || review.client || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{review.reviewerName || review.client || 'User'}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, j) => (
                        <StarIcon
                          key={j}
                          className={`h-2.5 w-2.5 ${j < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] italic text-white/80 leading-relaxed pl-9 line-clamp-2">&ldquo;{review.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-white">{reviews.length}</p>
            <p className="text-[10px] text-white/70 mt-1">Click to expand</p>
          </div>
        )}
      </div>
    </div>
  );
};
