import { SparklesIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface BalanceCardsProps {
  userData: UserData;
}

export const BalanceCards = ({ userData }: BalanceCardsProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* BMC Balance Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#BD24DF] to-[#2D6ADE] opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-blue-500/5 opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">BMC Balance</span>
            <div className="rounded-full bg-purple-500/20 p-2">
              <SparklesIcon className="h-5 w-5 text-purple-200" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{userData.bmcBalance.toLocaleString()}</span>
              <span className="text-xs text-white/60">BMC</span>
            </div>
            <p className="text-[11px] text-white/50">≈ R{(userData.bmcBalance * 2).toLocaleString()}</p>
          </div>
          <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20">
            Buy Credits
          </button>
        </div>
      </div>

      {/* Fiat Balance Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#2D6ADE] to-[#BD24DF] opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Fiat Balance</span>
            <div className="rounded-full bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-200" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">R{userData.fiatBalance.toLocaleString()}</span>
              <span className="text-xs text-white/60">{userData.currency}</span>
            </div>
            <p className="text-[11px] text-white/50">Available for withdrawal</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-wide">
            <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20">
              Deposit
            </button>
            <button className="rounded-lg border border-emerald-400/25 bg-emerald-500/15 px-3 py-2 text-emerald-200 transition hover:bg-emerald-500/25">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
