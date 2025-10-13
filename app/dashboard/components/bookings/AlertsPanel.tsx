import { memo } from 'react';

interface AlertsPanelProps {
  alerts: string[];
}

function AlertsPanelComponent({ alerts }: AlertsPanelProps) {
  return (
    <div className="space-y-2 text-xs text-white/70">
      {alerts.map((alert) => (
        <div
          key={alert}
          className="rounded-xl border border-amber-200/30 bg-amber-400/15 px-3 py-2 text-left text-[11px] text-amber-50"
        >
          {alert}
        </div>
      ))}
    </div>
  );
}

export const AlertsPanel = memo(AlertsPanelComponent);
