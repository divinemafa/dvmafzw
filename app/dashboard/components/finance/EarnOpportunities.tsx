import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { EarnOpportunity } from '../../types';

interface EarnOpportunitiesProps {
  opportunities: EarnOpportunity[];
  className?: string;
}

export const EarnOpportunities = ({ opportunities, className }: EarnOpportunitiesProps) => {
  const containerClasses = [
    'flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-2xl',
    className || '',
  ].join(' ').trim();

  return (
    <div className={containerClasses}>
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Earn More Credits</h2>
        <p className="text-[11px] text-white/50">Complete quick tasks to top up BMC</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="space-y-2">
          {opportunities.map((opportunity, idx) => (
            <button
              key={idx}
              disabled={opportunity.status === 'locked'}
              className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                opportunity.status === 'available'
                  ? 'border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/15'
                  : 'cursor-not-allowed border-white/5 bg-white/5 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      opportunity.status === 'available'
                        ? 'bg-purple-500/20 text-purple-200'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    <opportunity.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{opportunity.title}</p>
                    <p className="text-[11px] text-emerald-300">+{opportunity.reward} BMC</p>
                  </div>
                </div>
                {opportunity.status === 'locked' ? (
                  <LockClosedIcon className="h-5 w-5 text-white/30" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-white/60" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
