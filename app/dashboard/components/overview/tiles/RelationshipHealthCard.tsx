/**
 * RelationshipHealthCard - Client loyalty and relationship metrics
 * Shows new clients, returning clients, loyalty ratio, and average ticket value
 */

'use client';

import Link from 'next/link';
import { UserGroupIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SectionCard } from './SectionCard';
import { formatCurrency } from './shared/utils';

interface RelationshipHealthCardProps {
  compact: boolean;
  newClientsThisWeek: number;
  returningClients: number;
  loyaltyRatio: number;
  averageTicketValue: number;
  bookingCurrency: string;
}

export const RelationshipHealthCard = ({
  compact,
  newClientsThisWeek,
  returningClients,
  loyaltyRatio,
  averageTicketValue,
  bookingCurrency,
}: RelationshipHealthCardProps) => {
  return (
    <SectionCard
      compact={compact}
      title="Relationship Health"
      subtitle="Where your client loyalty sits right now"
      icon={UserGroupIcon}
    >
      <div className={`grid ${compact ? 'gap-2.5' : 'gap-3'} text-sm text-white/80 sm:grid-cols-2`}>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">New clients (7d)</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{newClientsThisWeek}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Returning clients</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{returningClients}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Loyalty ratio</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>{loyaltyRatio}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Avg. ticket</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>
            {formatCurrency(averageTicketValue, bookingCurrency)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-white/60">
        Top tip: send a personalised follow-up within 24 hours to new clients to nudge them into a repeat booking cycle.
      </p>
      <Link
        href="/dashboard?tab=clients&view=saved"
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 transition hover:text-cyan-100"
      >
        Manage relationships
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </SectionCard>
  );
};
