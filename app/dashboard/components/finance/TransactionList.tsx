import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import type { Activity } from '../../types';

interface TransactionListProps {
  activities: Activity[];
}

export const TransactionList = ({ activities }: TransactionListProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.type === 'earn'
                      ? 'bg-emerald-500/20'
                      : 'bg-red-500/20'
                  }`}
                >
                  {activity.type === 'earn' ? (
                    <ArrowDownIcon className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <ArrowUpIcon className="h-5 w-5 text-red-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{activity.action}</p>
                  <p className="text-xs text-white/60">{activity.time}</p>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
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
