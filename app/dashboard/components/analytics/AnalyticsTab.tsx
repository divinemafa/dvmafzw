/**
 * Analytics Tab - Compact performance workspace with mixed chart types
 */

'use client';

import { useMemo, useId } from 'react';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { AnalyticsData, TrafficSource } from '../../types';

interface TrendPoint {
  label: string;
  views: number;
  clicks: number;
  conversionRate: number;
}

interface SparkMetric {
  label: string;
  value: number;
  change: number;
  series: number[];
}

interface FunnelStage {
  label: string;
  rate: number;
  change: number;
}

type ExtendedAnalytics = AnalyticsData & {
  trend?: TrendPoint[];
  retentionSegments?: SparkMetric[];
  funnelStages?: FunnelStage[];
};

interface AnalyticsTabProps {
  analytics?: ExtendedAnalytics;
  trafficSources?: TrafficSource[];
}

const defaultTrend: TrendPoint[] = [
  { label: 'Mon', views: 980, clicks: 210, conversionRate: 6.8 },
  { label: 'Tue', views: 1120, clicks: 260, conversionRate: 7.1 },
  { label: 'Wed', views: 1280, clicks: 295, conversionRate: 7.6 },
  { label: 'Thu', views: 1460, clicks: 340, conversionRate: 8.0 },
  { label: 'Fri', views: 1600, clicks: 360, conversionRate: 8.5 },
  { label: 'Sat', views: 1750, clicks: 410, conversionRate: 8.8 },
  { label: 'Sun', views: 1890, clicks: 430, conversionRate: 9.2 },
];

const defaultRetention: SparkMetric[] = [
  { label: 'Returning', value: 62, change: 4.1, series: [50, 54, 55, 57, 60, 62] },
  { label: 'New Users', value: 38, change: 2.7, series: [28, 30, 33, 35, 36, 38] },
  { label: 'Engaged', value: 74, change: 5.8, series: [60, 63, 66, 69, 72, 74] },
];

const defaultFunnel: FunnelStage[] = [
  { label: 'Visited', rate: 100, change: 6.3 },
  { label: 'Added to Cart', rate: 42, change: 3.1 },
  { label: 'Booked', rate: 27, change: 2.5 },
];

const defaultSources: TrafficSource[] = [
  { source: 'Direct', visitors: 4200, percentage: 33.7 },
  { source: 'Search', visitors: 3100, percentage: 24.9 },
  { source: 'Social', visitors: 2800, percentage: 22.5 },
  { source: 'Referral', visitors: 2350, percentage: 18.9 },
];

export function AnalyticsTab({ analytics, trafficSources = [] }: AnalyticsTabProps) {
  const metrics = useMemo(
    () => ({
      totalViews: analytics?.totalViews ?? 12450,
      totalClicks: analytics?.totalClicks ?? 3890,
      conversionRate: analytics?.conversionRate ?? 8.2,
      averageSessionDuration: analytics?.averageSessionDuration ?? 245,
      bounceRate: analytics?.bounceRate ?? 42.5,
      revenueGrowth: analytics?.revenueGrowth ?? 15.3,
    }),
    [analytics],
  );

  const trend = useMemo<TrendPoint[]>(() => {
    return analytics?.trend && analytics.trend.length > 1 ? analytics.trend : defaultTrend;
  }, [analytics]);

  const retention = useMemo<SparkMetric[]>(() => {
    return analytics?.retentionSegments && analytics.retentionSegments.length > 0
      ? analytics.retentionSegments
      : defaultRetention;
  }, [analytics]);

  const funnel = useMemo<FunnelStage[]>(() => {
    return analytics?.funnelStages && analytics.funnelStages.length > 0
      ? analytics.funnelStages
      : defaultFunnel;
  }, [analytics]);

  const sources = useMemo<TrafficSource[]>(() => {
    return trafficSources.length > 0 ? trafficSources : defaultSources;
  }, [trafficSources]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Performance Overview</h2>
            <p className="text-xs text-white/45">Weekly flow of reach vs. engagement</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/55">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" /> Views
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" /> Clicks
            </span>
          </div>
        </header>
        <div className="mt-4 rounded-xl border border-white/5 bg-black/10 p-4">
          <PerformanceChart data={trend} totalViews={metrics.totalViews} totalClicks={metrics.totalClicks} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TinyMetric label="Total Views" value={metrics.totalViews.toLocaleString()} change={12.5} positive />
          <TinyMetric label="Total Clicks" value={metrics.totalClicks.toLocaleString()} change={8.3} positive />
          <TinyMetric label="Conversion" value={`${metrics.conversionRate.toFixed(1)}%`} change={2.1} positive />
          <TinyMetric
            label="Revenue Growth"
            value={`${metrics.revenueGrowth.toFixed(1)}%`}
            change={metrics.revenueGrowth >= 0 ? metrics.revenueGrowth : -metrics.revenueGrowth}
            positive={metrics.revenueGrowth >= 0}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {retention.map((segment) => (
          <SparkCard key={segment.label} metric={segment} />
        ))}
        <RadialSessionCard
          averageSeconds={metrics.averageSessionDuration}
          bounceRate={metrics.bounceRate}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MiniFunnelCard stages={funnel} />
        <CompactBarCard data={trend} />
        <TrafficSourcesCard sources={sources} />
      </section>
    </div>
  );
}

interface PerformanceChartProps {
  data: TrendPoint[];
  totalViews: number;
  totalClicks: number;
}

const PerformanceChart = ({ data, totalViews, totalClicks }: PerformanceChartProps) => {
  const gradientViewsId = useId();
  const gradientClicksId = useId();

  const width = 540;
  const height = 180;
  const viewsSeries = data.map((point) => point.views);
  const clicksSeries = data.map((point) => point.clicks);
  const maxValue = Math.max(...viewsSeries, ...clicksSeries, 1);

  const createPath = (series: number[]) => {
    return series
      .map((value, index) => {
        const x = (index / (series.length - 1 || 1)) * width;
        const y = height - (value / maxValue) * height;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const createArea = (series: number[]) => {
    if (series.length === 0) return '';
    const path = createPath(series);
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  };

  const viewsPath = createPath(viewsSeries);
  const clicksPath = createPath(clicksSeries);
  const viewsArea = createArea(viewsSeries);
  const clicksArea = createArea(clicksSeries);
  const averageConversion = data.length > 0
    ? data.reduce((acc, point) => acc + point.conversionRate, 0) / data.length
    : 0;

  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 text-[11px] text-white/50">
        <span>Views: {totalViews.toLocaleString()}</span>
        <span>Clicks: {totalClicks.toLocaleString()}</span>
        <span>Avg Conversion: {averageConversion.toFixed(1)}%</span>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-48 w-full"
        >
          <defs>
            <linearGradient id={gradientViewsId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(192,132,252,0.35)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
            </linearGradient>
            <linearGradient id={gradientClicksId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(45,212,191,0.3)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.05)" />
            </linearGradient>
            <linearGradient id="gradientViewsLine" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="gradientClicksLine" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {Array.from({ length: 4 }).map((_, index) => {
            const y = (index / 3) * height;
            return (
              <line
                key={y}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          <path d={viewsArea} fill={`url(#${gradientViewsId})`} />
          <path d={clicksArea} fill={`url(#${gradientClicksId})`} />
          <path d={viewsPath} fill="none" stroke="url(#gradientViewsLine)" strokeWidth="2.2" />
          <path d={clicksPath} fill="none" stroke="url(#gradientClicksLine)" strokeWidth="2.2" />

          {data.map((point, index) => {
            const x = (index / (data.length - 1 || 1)) * width;
            const yViews = height - (point.views / maxValue) * height;
            const yClicks = height - (point.clicks / maxValue) * height;
            return (
              <g key={point.label}>
                <circle cx={x} cy={yViews} r={3.2} fill="#c084fc" opacity={0.9} />
                <circle cx={x} cy={yClicks} r={3} fill="#34d399" opacity={0.8} />
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-2 text-[11px] text-white/40">
          {data.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TinyMetricProps {
  label: string;
  value: string;
  change: number;
  positive?: boolean;
}

const TinyMetric = ({ label, value, change, positive = true }: TinyMetricProps) => {
  return (
    <div className="rounded-lg border border-white/8 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">{label}</p>
      <div className="mt-1 flex items-end justify-between text-white">
        <span className="text-lg font-semibold">{value}</span>
        <span className={`flex items-center gap-1 text-[11px] ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {positive ? <ArrowTrendingUpIcon className="h-3 w-3" /> : <ArrowTrendingDownIcon className="h-3 w-3" />}
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const SparkCard = ({ metric }: { metric: SparkMetric }) => {
  const gradientId = useId();
  const width = 120;
  const height = 60;
  const series = metric.series.length > 0 ? metric.series : [metric.value];
  const minValue = Math.min(...series);
  const maxValue = Math.max(...series);
  const range = maxValue - minValue || 1;

  const path = series
    .map((value, index) => {
      const x = (index / (series.length - 1 || 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/8 bg-white/5 p-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{metric.label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-white">{metric.value}%</span>
          <span className={`text-[11px] ${metric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-16 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const RadialSessionCard = ({
  averageSeconds,
  bounceRate,
}: {
  averageSeconds: number;
  bounceRate: number;
}) => {
  const circumference = 2 * Math.PI * 32;
  const bounceOffset = circumference * (1 - bounceRate / 100);
  const averageMinutes = Math.floor(averageSeconds / 60);
  const averageRemainingSeconds = averageSeconds % 60;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Session Health</p>
      <div className="mt-3 flex items-center gap-3">
        <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
          <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
          <circle
            cx="40"
            cy="40"
            r="32"
            stroke="url(#sessionGradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={bounceOffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
          <defs>
            <linearGradient id="sessionGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-white" fontSize="14">
            {bounceRate.toFixed(0)}%
          </text>
        </svg>
        <div className="space-y-1 text-xs text-white/60">
          <div>
            <p className="text-[11px] text-white/45">Average Session</p>
            <p className="text-sm font-semibold text-white">
              {averageMinutes}m {averageRemainingSeconds}s
            </p>
          </div>
          <p>Retention improved by 5.2% WoW.</p>
          <p>Bounce trending down by 3.4%.</p>
        </div>
      </div>
    </div>
  );
};

const MiniFunnelCard = ({ stages }: { stages: FunnelStage[] }) => {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Conversion Funnel</p>
      <div className="mt-4 space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{stage.label}</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ArrowTrendingUpIcon className="h-3 w-3" />
                +{stage.change.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"
                style={{ width: `${stage.rate}%` }}
              />
            </div>
            {index < stages.length - 1 && <div className="h-px bg-white/5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const CompactBarCard = ({ data }: { data: TrendPoint[] }) => {
  const maxClicks = Math.max(...data.map((point) => point.clicks), 1);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Click Density</p>
  <div className="mt-3 flex h-32 items-end gap-2">
        {data.map((point) => (
          <div key={point.label} className="flex w-full flex-col items-center gap-2">
            <div
              className="w-full rounded-full bg-gradient-to-t from-blue-500/20 via-purple-500/50 to-purple-500"
              style={{ height: `${Math.max((point.clicks / maxClicks) * 90, 10)}%` }}
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrafficSourcesCard = ({ sources }: { sources: TrafficSource[] }) => {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Traffic Mix</p>
      <div className="mt-3 space-y-3">
        {sources.map((source) => (
          <div key={source.source} className="flex items-center justify-between gap-3 text-xs text-white/60">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white">{source.source}</span>
                <span>{source.visitors.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-[11px] text-white/45">{source.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
