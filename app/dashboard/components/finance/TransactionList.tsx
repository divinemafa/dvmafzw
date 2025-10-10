import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import type { Activity } from '../../types';

interface TransactionListProps {
  activities: Activity[];
  className?: string;
}

export const TransactionList = ({ activities, className }: TransactionListProps) => {
  const containerClasses = [
    'flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-2xl',
    className || '',
  ].join(' ').trim();

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <p className="text-[11px] text-white/50">Track your credits movement at a glance</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="space-y-2">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    activity.type === 'earn'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {activity.type === 'earn' ? (
                    <ArrowDownIcon className="h-5 w-5" />
                  ) : (
                    <ArrowUpIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold leading-tight">{activity.action}</p>
                  <p className="text-[11px] text-white/50">{activity.time}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  activity.type === 'earn' ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {activity.amount > 0 ? '+' : ''}{activity.amount} BMC
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
