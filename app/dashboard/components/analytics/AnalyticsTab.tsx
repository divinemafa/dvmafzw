/**
 * Analytics Tab - Performance metrics and insights
 */

'use client';

import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import type { AnalyticsData, TrafficSource } from '../../types';

interface AnalyticsTabProps {
  analytics?: AnalyticsData;
  trafficSources?: TrafficSource[];
}

export function AnalyticsTab({ analytics, trafficSources = [] }: AnalyticsTabProps) {
  // Mock data with defaults
  const mockAnalytics: Required<Pick<AnalyticsData, 'totalViews' | 'totalClicks' | 'conversionRate' | 'averageSessionDuration' | 'bounceRate' | 'revenueGrowth'>> = {
    totalViews: analytics?.totalViews ?? 12450,
    totalClicks: analytics?.totalClicks ?? 3890,
    conversionRate: analytics?.conversionRate ?? 8.2,
    averageSessionDuration: analytics?.averageSessionDuration ?? 245, // seconds
    bounceRate: analytics?.bounceRate ?? 42.5,
    revenueGrowth: analytics?.revenueGrowth ?? 15.3,
  };

  const mockSources: TrafficSource[] = trafficSources.length > 0 ? trafficSources : [
    { source: 'Direct', visitors: 4200, percentage: 33.7 },
    { source: 'Search', visitors: 3100, percentage: 24.9 },
    { source: 'Social', visitors: 2800, percentage: 22.5 },
    { source: 'Referral', visitors: 2350, percentage: 18.9 },
  ];

  return (
    <>
      {/* Key Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Views"
          value={mockAnalytics.totalViews.toLocaleString()}
          change={12.5}
          isPositive={true}
        />
        <MetricCard
          title="Total Clicks"
          value={mockAnalytics.totalClicks.toLocaleString()}
          change={8.3}
          isPositive={true}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${mockAnalytics.conversionRate}%`}
          change={2.1}
          isPositive={true}
        />
        <MetricCard
          title="Avg Session"
          value={`${Math.floor(mockAnalytics.averageSessionDuration / 60)}m ${mockAnalytics.averageSessionDuration % 60}s`}
          change={5.2}
          isPositive={true}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${mockAnalytics.bounceRate}%`}
          change={-3.4}
          isPositive={true}
        />
        <MetricCard
          title="Revenue Growth"
          value={`${mockAnalytics.revenueGrowth}%`}
          change={15.3}
          isPositive={true}
        />
      </div>

      {/* Traffic Sources */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Traffic Sources</h2>
          <p className="mt-1 text-sm text-white/60">Where your visitors come from</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {mockSources.map((source, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{source.source}</h4>
                      <span className="text-sm text-white/60">
                        {source.visitors.toLocaleString()} visitors
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-white/40">{source.percentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

function MetricCard({ title, value, change, isPositive }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
            )}
            <span
              className={`text-xs font-semibold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
          <ChartBarIcon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
