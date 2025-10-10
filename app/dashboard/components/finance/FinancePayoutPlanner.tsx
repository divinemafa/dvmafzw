import { BanknotesIcon, ClockIcon, ArrowUpRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface UpcomingPayout {
  id: string;
  amount: string;
  status: 'processing' | 'scheduled' | 'on-hold';
  eta: string;
  method: string;
  reference: string;
}

interface RecentWithdrawal {
  id: string;
  amount: string;
  completedAt: string;
  destination: string;
  hash?: string;
}

interface FinancePayoutPlannerProps {
  upcoming: UpcomingPayout[];
  history: RecentWithdrawal[];
}

const statusStyles: Record<UpcomingPayout['status'], { badge: string; label: string }> = {
  processing: {
    badge: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
    label: 'Processing',
  },
  scheduled: {
    badge: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    label: 'Scheduled',
  },
  'on-hold': {
    badge: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
    label: 'On Hold',
  },
};

export const FinancePayoutPlanner = ({ upcoming, history }: FinancePayoutPlannerProps) => {
  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Payout &amp; Withdrawals</h2>
          <p className="text-[11px] text-white/50">Manage scheduled releases and initiate on-demand withdrawals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:bg-white/15">
            <BanknotesIcon className="h-4 w-4" />
            New withdrawal
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:bg-white/15">
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/50">
          <span>Upcoming Releases</span>
          <span>ETA</span>
        </div>
        <div className="space-y-2">
          {upcoming.map((payout) => {
            const status = statusStyles[payout.status];
            return (
              <article
                key={payout.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white transition hover:border-white/25 hover:bg-white/10"
              >
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-white">{payout.amount}</span>
                  <span className="text-xs text-white/60">{payout.method}</span>
                  <span className="text-[11px] text-white/40">Ref {payout.reference}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.badge}`}>
                    {status.label}
                  </span>
                  <div className="text-right text-xs text-white/60">
                    <p className="font-semibold text-white/80">{payout.eta}</p>
                    <p>Estimated arrival</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Recent Withdrawals</h3>
          <button className="text-[11px] font-semibold uppercase tracking-wide text-white/60 transition hover:text-white">
            View all
          </button>
        </div>
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white">
              <div>
                <p className="text-sm font-semibold text-white">{item.amount}</p>
                <p className="text-xs text-white/60">{item.destination}</p>
              </div>
              <div className="text-right text-xs text-white/50">
                <p>{item.completedAt}</p>
                {item.hash && (
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 transition hover:text-blue-200"
                  >
                    View hash
                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
