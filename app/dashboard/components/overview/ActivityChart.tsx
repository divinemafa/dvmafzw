/**
 * ActivityChart - Visual representation of marketplace activity
 * Shows booking trends, views, and engagement over time
 */

'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  TicketIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface ActivityData {
  day: string;
  bookings: number;
  views: number;
  revenue: number;
}

export const ActivityChart = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  // Mock activity data
  const activityData: ActivityData[] = [
    { day: 'Mon', bookings: 12, views: 245, revenue: 1240 },
    { day: 'Tue', bookings: 19, views: 312, revenue: 1890 },
    { day: 'Wed', bookings: 15, views: 289, revenue: 1560 },
    { day: 'Thu', bookings: 22, views: 401, revenue: 2340 },
    { day: 'Fri', bookings: 28, views: 478, revenue: 2980 },
    { day: 'Sat', bookings: 31, views: 523, revenue: 3420 },
    { day: 'Sun', bookings: 18, views: 334, revenue: 1920 },
  ];

  const maxBookings = Math.max(...activityData.map(d => d.bookings));
  const maxViews = Math.max(...activityData.map(d => d.views));

  const quickStats = [
    {
      label: 'Total Views',
      value: '2.5K',
      change: '+18.2%',
      icon: EyeIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Total Bookings',
      value: '145',
      change: '+12.5%',
      icon: TicketIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    },
    {
      label: 'Total Revenue',
      value: '$15.3K',
      change: '+24.8%',
      icon: CurrencyDollarIcon,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="overflow-hidden bg-white/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-1.5">
            <ChartBarIcon className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Activity Overview</h3>
            <p className="text-[10px] text-white/60">Bookings & views</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-2 py-1 text-[10px] font-medium transition ${
                timeframe === period
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {period === '7d' ? '7D' : period === '30d' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-0 bg-white/5">
        {quickStats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2 p-2">
            <div className={`${stat.bg} p-1.5`}>
              <stat.icon className={`h-3 w-3 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-white/60">{stat.label}</p>
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-[10px] font-medium text-green-400">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="p-3">
        <div className="flex h-32 items-end justify-between gap-1">
          {activityData.map((data, index) => {
            const bookingHeight = (data.bookings / maxBookings) * 100;
            const viewHeight = (data.views / maxViews) * 100;

            return (
              <div key={index} className="group flex flex-1 flex-col items-center gap-1">
                {/* Bars Container */}
                <div className="relative flex h-28 w-full items-end justify-center gap-0.5">
                  {/* Bookings Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 transition"
                    style={{ height: `${bookingHeight}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      <p className="font-bold">{data.bookings} bookings</p>
                      <p className="text-white/60">{data.views} views</p>
                    </div>
                  </div>

                  {/* Views Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-blue-500/60 to-blue-400/60 transition"
                    style={{ height: `${viewHeight}%` }}
                  />
                </div>

                {/* Day Label */}
                <span className="text-[10px] font-medium text-white/60">
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-purple-500" />
            <span className="text-[10px] text-white/60">Bookings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-blue-500/60" />
            <span className="text-[10px] text-white/60">Views</span>
          </div>
        </div>
      </div>
    </div>
  );
};
