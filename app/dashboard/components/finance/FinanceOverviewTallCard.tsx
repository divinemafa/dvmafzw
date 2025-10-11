import { ArrowTrendingUpIcon, SparklesIcon, ShieldCheckIcon, RocketLaunchIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import type { UserData } from '../../types';

interface FinanceOverviewTallCardProps {
  userData: UserData;
}

const formatCurrency = (value: number, currency = 'ZAR') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const FinanceOverviewTallCard = ({ userData }: FinanceOverviewTallCardProps) => {
  const chips = [
    { label: '+12.5% growth', accent: 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200' },
    { label: 'Response 95%', accent: 'border-purple-300/40 bg-purple-500/15 text-purple-200' },
    { label: 'Average 2h', accent: 'border-blue-300/40 bg-blue-500/15 text-blue-200' },
  ];

  const balanceBlocks = [
    {
      label: 'Token Credits',
      value: userData.bmcBalance.toLocaleString(),
      suffix: 'BMC',
      icon: SparklesIcon,
      accent: 'from-[#BD24DF]/35 via-[#7c3aed]/25 to-transparent',
      hint: `≈ ${formatCurrency(userData.bmcBalance * 2)}`,
    },
    {
      label: 'Fiat Balance',
      value: formatCurrency(userData.fiatBalance, userData.currency),
      suffix: userData.currency,
      icon: BanknotesIcon,
      accent: 'from-emerald-400/35 via-teal-400/25 to-transparent',
      hint: 'Available to withdraw',
    },
  ] as const;

  return (
    <section className="relative flex flex-col gap-6 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60 p-6 shadow-[0_60px_160px_-110px_rgba(79,70,229,0.65)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-1/3 top-[-15%] h-80 w-80 rounded-full bg-[#BD24DF]/25 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-20%] h-96 w-96 rounded-full bg-[#2D6ADE]/30 blur-3xl" />
      </div>

      <header className="relative z-10 space-y-2 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Portfolio Snapshot</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold leading-tight">Stability &amp; Growth</h2>
            <p className="text-sm text-white/65">
              Monitor balances, release cadence, and safety posture in one console optimized for fast decisions.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
          >
            <RocketLaunchIcon className="h-4 w-4" aria-hidden />
            Launch earnings plan
          </button>
        </div>
      </header>

      <div className="relative z-10 grid gap-4 md:grid-cols-2">
        {balanceBlocks.map(({ label, value, suffix, icon: Icon, accent, hint }) => (
          <article
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 text-white shadow-[0_45px_140px_-110px_rgba(56,189,248,0.55)] transition hover:border-white/25"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition group-hover:opacity-100`} aria-hidden />
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
                  <span className="text-xs text-white/60">{suffix}</span>
                </div>
                <p className="text-xs text-white/60">{hint}</p>
              </div>
              <span className="rounded-2xl border border-white/20 bg-white/10 p-3 text-white/80">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="relative z-10 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">Member Level</p>
            <p className="text-base font-semibold">{userData.level}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <ShieldCheckIcon className="h-5 w-5 text-cyan-200" aria-hidden />
            <span>Verified since {userData.joinDate}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide">
          {chips.map((chip) => (
            <span key={chip.label} className={`rounded-full border px-3 py-1 font-medium ${chip.accent}`}>
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-transparent to-transparent p-5 text-white shadow-[0_40px_120px_-110px_rgba(251,191,36,0.55)]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">Boost momentum</p>
              <h3 className="text-lg font-semibold leading-tight">Activate premium boosts</h3>
              <p className="text-xs text-white/65">Accelerate discovery, unlock higher-tier clients, and keep payouts flowing.</p>
            </div>
            <span className="rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100">Hot</span>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
          >
            Launch boost center
          </button>
        </div>
        <div className="grid gap-3 text-sm text-white/70">
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">Next action</p>
            <p className="mt-1 font-semibold text-white">Schedule payout review</p>
            <p className="text-xs text-white/60">Reconcile tomorrow’s release and approve pending documents.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">Safety score</p>
            <p className="mt-1 font-semibold text-white">92 / 100</p>
            <p className="text-xs text-white/60">Add 2FA withdrawal approval to reach 95.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
