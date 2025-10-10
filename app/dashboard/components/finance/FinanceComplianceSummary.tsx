import { ShieldCheckIcon, ExclamationTriangleIcon, DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ComplianceStatus {
  title: string;
  state: 'complete' | 'attention' | 'pending';
  description: string;
  deadline?: string;
}

interface AuditItem {
  label: string;
  value: string;
  trend?: {
    direction: 'up' | 'down' | 'steady';
    label: string;
  };
}

interface FinanceComplianceSummaryProps {
  statuses: ComplianceStatus[];
  audits: AuditItem[];
}

const stateStyles: Record<ComplianceStatus['state'], { badge: string; text: string; icon: JSX.Element }> = {
  complete: {
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    text: 'text-emerald-200',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  attention: {
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    text: 'text-amber-200',
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
  },
  pending: {
    badge: 'border-white/20 bg-white/10 text-white/70',
    text: 'text-white/70',
    icon: <ClockIcon className="h-5 w-5" />,
  },
};

export const FinanceComplianceSummary = ({ statuses, audits }: FinanceComplianceSummaryProps) => {
  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl backdrop-blur-2xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Compliance &amp; Tax Center</h2>
          <p className="text-[11px] text-white/50">Stay ahead of obligations across KYC, tax, and payouts.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/30 hover:bg-white/15">
          <DocumentArrowDownIcon className="h-4 w-4" />
          Export log
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {statuses.map((status) => {
          const style = stateStyles[status.state];
          return (
            <article
              key={status.title}
              className="flex flex-col gap-2 rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${style.text}`}>
                  <span className="rounded-full border p-1.5 text-current">{style.icon}</span>
                  <h3 className="text-sm font-semibold text-white">{status.title}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                  {status.state === 'complete' ? 'Complete' : status.state === 'attention' ? 'Action' : 'Pending'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-white/60">{status.description}</p>
              {status.deadline && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Due {status.deadline}</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/15 bg-white/5 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Audit Snapshot</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {audits.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{item.label}</p>
              <p className="mt-1 text-base font-semibold text-white">{item.value}</p>
              {item.trend && (
                <span
                  className={`text-[11px] font-medium ${
                    item.trend.direction === 'up'
                      ? 'text-emerald-300'
                      : item.trend.direction === 'down'
                      ? 'text-red-300'
                      : 'text-white/50'
                  }`}
                >
                  {item.trend.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
