import { ArrowTrendingUpIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface FinanceOverviewTallCardProps {
  userData: UserData;
}

export const FinanceOverviewTallCard = ({ userData }: FinanceOverviewTallCardProps) => {
  const fiatValue = `R${userData.fiatBalance.toLocaleString()}`;
  const bmcValue = `${userData.bmcBalance.toLocaleString()} BMC`;

  return (
    <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1023] via-white/5 to-transparent p-6 shadow-2xl backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-40%] top-[-20%] h-64 w-64 rounded-full bg-[#BD24DF]/20 blur-3xl transition-all duration-500 group-hover:scale-110" />
        <div className="absolute right-[-20%] bottom-[-10%] h-72 w-72 rounded-full bg-[#2D6ADE]/30 blur-3xl transition-all duration-500 group-hover:scale-110" />
      </div>

      <header className="relative z-10 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">Portfolio Snapshot</span>
        <h2 className="text-2xl font-bold text-white">Stability &amp; Growth</h2>
        <p className="text-sm text-white/60">Track balances, momentum, and safety in one consolidated view.</p>
      </header>

      <div className="relative z-10 mt-6 grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/20" />
              <div className="absolute inset-1 rounded-full border border-purple-400/60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/40 via-purple-600/20 to-transparent" />
              <div className="relative flex flex-col items-center justify-center gap-1">
                <SparklesIcon className="h-5 w-5 text-purple-200" />
                <span className="text-lg font-bold text-white">{userData.bmcBalance.toLocaleString()}</span>
                <span className="text-[11px] uppercase tracking-widest text-purple-200/80">BMC</span>
              </div>
            </div>
            <p className="text-xs text-white/60">Token Credits</p>
          </div>

          <div className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/20" />
              <div className="absolute inset-1 rounded-full border border-emerald-400/60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/40 via-emerald-600/20 to-transparent" />
              <div className="relative flex flex-col items-center justify-center gap-1">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-200" />
                <span className="text-lg font-bold text-white">{fiatValue}</span>
                <span className="text-[11px] uppercase tracking-widest text-emerald-200/80">Available</span>
              </div>
            </div>
            <p className="text-xs text-white/60">Fiat Balance</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">Member Level</p>
              <p className="text-base font-semibold text-white">{userData.level}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheckIcon className="h-5 w-5 text-blue-200" />
              <span>Verified since {userData.joinDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide text-white/60">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">+12.5% growth</span>
            <span className="rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-purple-200">Response 95%</span>
            <span className="rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-blue-200">Average 2h</span>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mt-6 flex flex-col gap-3 rounded-2xl border border-yellow-300/40 bg-yellow-400/20 p-4 shadow-inner shadow-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1330]">Boost your earnings momentum</p>
            <p className="text-xs text-[#1a1330]/70">Activate premium boosts and climb the leaderboard faster.</p>
          </div>
          <span className="rounded-full border border-[#1a1330]/20 bg-[#1a1330]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1a1330]/90">Hot</span>
        </div>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-4 py-2 text-sm font-semibold text-[#1a1330] shadow-lg shadow-amber-500/40 transition hover:from-amber-300 hover:to-yellow-300">
          Launch Boost Center
        </button>
      </footer>
    </section>
  );
};
