/**
 * InboxResponseCard - Shows response rate and messaging metrics
 * Displays response rate gauge, average response time, and instant wins tip
 */

'use client';

import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import type { MarketplaceStats } from '../../../types';
import type { TrendDescriptor } from './shared/types';

interface InboxResponseCardProps {
  compact: boolean;
  stats: MarketplaceStats;
  responseRateValue: number;
  gaugeRadius: number;
  gaugeCircumference: number;
  gaugeOffset: number;
  responseGoalHours: number;
  responseTrend?: TrendDescriptor;
  nextUnread?: { senderName: string; preview: string } | null;
  onOpenMessages: () => void;
}

export const InboxResponseCard = ({
  compact,
  stats,
  responseRateValue,
  gaugeRadius,
  gaugeCircumference,
  gaugeOffset,
  responseGoalHours,
  responseTrend,
  nextUnread,
  onOpenMessages,
}: InboxResponseCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Inbox & Response"
      subtitle="Keep your response rate high"
      icon={EnvelopeIcon}
      actionLabel="Open messages"
      onAction={onOpenMessages}
    >
      <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-5'} text-sm text-white/80 md:flex-row md:items-center md:justify-between`}>
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center md:mx-0">
          <svg viewBox="0 0 80 80" className="h-full w-full" role="presentation" aria-hidden>
            <defs>
              <linearGradient id="responseGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={6} />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#responseGradient)"
              strokeWidth={6}
              strokeDasharray={gaugeCircumference.toFixed(2)}
              strokeDashoffset={gaugeOffset.toFixed(2)}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Rate</p>
            <p className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-white`}>{responseRateValue}%</p>
            {responseTrend ? <p className="text-[10px] font-medium text-emerald-200/80">{responseTrend.label}</p> : null}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Avg. response time</p>
            <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{stats.responseTime}</p>
            <p className="text-[11px] text-white/60">Target: &lt;{responseGoalHours} hour{responseGoalHours > 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Instant wins</p>
            <p className="text-[11px] text-white/70">Reply to unread messages within 60 minutes to stay eligible for boosted placement.</p>
          </div>
          {nextUnread ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/80">Next unread</p>
              <p className="text-[11px] font-medium text-amber-100/90">{nextUnread.senderName}</p>
              <p className="text-[11px] text-amber-200/70">{nextUnread.preview}</p>
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
};
