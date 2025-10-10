import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

interface InsightMetric {
  label: string;
  value: string;
  delta: {
    direction: 'up' | 'down' | 'steady';
    label: string;
  };
}

interface AlertItem {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

interface FinanceTransactionInsightsProps {
  metrics: InsightMetric[];
  alerts: AlertItem[];
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaIcon?: ComponentType<{ className?: string }>;
}

const severityStyles: Record<AlertItem['severity'], string> = {
  info: 'border-white/20 bg-white/10 text-white/70',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  critical: 'border-red-400/30 bg-red-400/10 text-red-100',
};

export const FinanceTransactionInsights = ({
  metrics,
  alerts,
  title = 'Transaction Insights',
  subtitle = 'Monitor inflows, refunds, and volatility in real-time.',
  ctaLabel = 'Manage alerts',
  ctaIcon,
}: FinanceTransactionInsightsProps) => {
  const CTAIcon = ctaIcon ?? BellAlertIcon;

  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-[11px] text-white/50">{subtitle}</p>
        </div>
        {ctaLabel && (
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:bg-white/15">
            <CTAIcon className="h-4 w-4" />
            {ctaLabel}
          </button>
        )}
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{metric.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-lg font-semibold text-white">{metric.value}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                  metric.delta.direction === 'up'
                    ? 'bg-emerald-400/10 text-emerald-200'
                    : metric.delta.direction === 'down'
                    ? 'bg-red-400/10 text-red-200'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {metric.delta.direction === 'up' && <ArrowTrendingUpIcon className="h-4 w-4" />} 
                {metric.delta.direction === 'down' && <ArrowTrendingDownIcon className="h-4 w-4" />} 
                {metric.delta.label}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-xl border px-3 py-3 text-sm ${severityStyles[alert.severity]} transition hover:border-white/30 hover:bg-white/15`}
          >
            <p className="font-semibold text-white">{alert.title}</p>
            <p className="text-[12px] text-white/70">{alert.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
