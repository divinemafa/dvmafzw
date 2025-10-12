import { BoltIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface QuickActionsProps {
  pausedCount: number;
  draftCount: number;
}

const statsCardClasses =
  'rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_40px_120px_-90px_rgba(120,113,198,0.5)] backdrop-blur-xl';

export const QuickActionsSidebar = ({ pausedCount, draftCount }: QuickActionsProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Optimization Card */}
      <div className={statsCardClasses}>
        <div className="flex items-start justify-between gap-2 text-white">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Optimization</p>
            <p className="text-base font-semibold">Update performance</p>
            <p className="text-[11px] text-white/60">
              Edit copy, adjust pricing, or refresh imagery to stay on trend.
            </p>
          </div>
          <BoltIcon className="h-6 w-6 text-amber-300" aria-hidden />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/70">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Paused leads</p>
            <p className="mt-1 text-lg font-semibold text-white">{pausedCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Draft ideas</p>
            <p className="mt-1 text-lg font-semibold text-white">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Playbook Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70 shadow-[0_40px_120px_-110px_rgba(59,130,246,0.65)]">
        <div className="flex items-start justify-between gap-2 text-white">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Playbook</p>
            <p className="text-sm font-semibold text-white">Polish top performer</p>
            <p className="text-[11px] text-white/60">
              Duplicate your best listing and tweak the angle for new market segments.
            </p>
          </div>
          <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-300" aria-hidden />
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
        >
          Duplicate top listing
        </button>
      </div>
    </div>
  );
};
