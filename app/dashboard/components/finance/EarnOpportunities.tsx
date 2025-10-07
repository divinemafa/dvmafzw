import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { EarnOpportunity } from '../../types';

interface EarnOpportunitiesProps {
  opportunities: EarnOpportunity[];
}

export const EarnOpportunities = ({ opportunities }: EarnOpportunitiesProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Earn More Credits</h2>
        <p className="text-xs text-white/60">Complete tasks to earn BMC</p>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {opportunities.map((opportunity, idx) => (
            <button
              key={idx}
              disabled={opportunity.status === 'locked'}
              className={`w-full rounded-lg border p-3 text-left transition ${
                opportunity.status === 'available'
                  ? 'border-white/15 bg-white/10 hover:bg-white/20'
                  : 'border-white/5 bg-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      opportunity.status === 'available'
                        ? 'bg-purple-500/20'
                        : 'bg-white/5'
                    }`}
                  >
                    <opportunity.icon
                      className={`h-5 w-5 ${
                        opportunity.status === 'available'
                          ? 'text-purple-300'
                          : 'text-white/30'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{opportunity.title}</p>
                    <p className="text-xs text-emerald-300">+{opportunity.reward} BMC</p>
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
