import { GiftIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface FinanceStatsProps {
  userData: UserData;
}

export const FinanceStats = ({ userData }: FinanceStatsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Pending Rewards</span>
          <GiftIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <p className="text-2xl font-bold text-white">{userData.pendingRewards} BMC</p>
        <button className="mt-2 text-xs font-semibold text-blue-300 hover:text-blue-200">Claim Now →</button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Total Earned</span>
          <ChartBarIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-white">{userData.totalEarned.toLocaleString()} BMC</p>
        <p className="mt-2 text-xs text-emerald-300">+12.5% this month</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/60">Member Level</span>
          <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
        </div>
        <p className="text-2xl font-bold text-white">{userData.level}</p>
        <p className="mt-2 text-xs text-white/50">Since {userData.joinDate}</p>
      </div>
    </div>
  );
};
