import { memo } from 'react';

export interface InsightMetric {
  label: string;
  value: string;
  note: string;
}

interface InsightsPanelProps {
  metrics: InsightMetric[];
}

function InsightsPanelComponent({ metrics }: InsightsPanelProps) {
  return (
    <div className="space-y-2 text-xs text-white/70">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">{metric.label}</p>
            <p className="text-[11px] text-white/55">{metric.note}</p>
          </div>
          <p className="text-sm font-semibold text-white">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

export const InsightsPanel = memo(InsightsPanelComponent);
