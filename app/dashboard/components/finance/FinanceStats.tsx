import { GiftIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface FinanceStatsProps {
  userData: UserData;
}

export const FinanceStats = ({ userData }: FinanceStatsProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Pending Rewards</span>
          <GiftIcon className="h-5 w-5 text-yellow-300" />
        </div>
        <p className="text-xl font-bold text-white">{userData.pendingRewards} BMC</p>
        <button className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-blue-300 transition hover:text-blue-200">Claim Now →</button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Total Earned</span>
          <ChartBarIcon className="h-5 w-5 text-emerald-300" />
        </div>
        <p className="text-xl font-bold text-white">{userData.totalEarned.toLocaleString()} BMC</p>
        <p className="mt-2 text-[11px] text-emerald-300">+12.5% this month</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Member Level</span>
          <ShieldCheckIcon className="h-5 w-5 text-purple-300" />
        </div>
        <p className="text-xl font-bold text-white">{userData.level}</p>
        <p className="mt-2 text-[11px] text-white/50">Since {userData.joinDate}</p>
      </div>
    </div>
  );
};
