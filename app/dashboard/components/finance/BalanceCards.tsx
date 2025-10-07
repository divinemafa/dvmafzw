import { SparklesIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface BalanceCardsProps {
  userData: UserData;
}

export const BalanceCards = ({ userData }: BalanceCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* BMC Balance Card */}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60">BMC Balance</span>
            <div className="rounded-full bg-purple-500/20 p-2">
              <SparklesIcon className="h-5 w-5 text-purple-300" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{userData.bmcBalance.toLocaleString()}</span>
            <span className="text-sm text-white/60">BMC</span>
          </div>
          <p className="text-xs text-white/50">≈ R{(userData.bmcBalance * 2).toLocaleString()}</p>
          <button className="mt-4 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20">
            Buy More Credits
          </button>
        </div>
      </div>

      {/* Fiat Balance Card */}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60">Fiat Balance</span>
            <div className="rounded-full bg-emerald-500/20 p-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">R{userData.fiatBalance.toLocaleString()}</span>
            <span className="text-sm text-white/60">{userData.currency}</span>
          </div>
          <p className="text-xs text-white/50">Available for withdrawal</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20">
              Deposit
            </button>
            <button className="rounded-lg border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
