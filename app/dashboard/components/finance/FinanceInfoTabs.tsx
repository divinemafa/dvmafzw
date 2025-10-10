import {
  BellAlertIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface FinanceInfoTabsProps {
  className?: string;
}

const cards = [
  {
    title: 'Performance Pulse',
    description: 'Weekly revenue trend insights tailored to your marketplace niche.',
    icon: PresentationChartLineIcon,
    accent: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    title: 'Smart Alerts',
    description: 'Get notified when balances hit thresholds or bookings spike.',
    icon: BellAlertIcon,
    accent: 'from-purple-500/20 to-pink-500/10',
  },
  {
    title: 'Customer Cohorts',
    description: 'Segment clients by loyalty, spend, and feedback sentiment.',
    icon: UserGroupIcon,
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    title: 'AI Recommendations',
    description: 'Suggested boosts and bundles curated by the BMC AI studio.',
    icon: SparklesIcon,
    accent: 'from-amber-400/25 to-orange-400/10',
  },
  {
    title: 'Expense Control',
    description: 'Forecast subscription and payout timings with automated limits.',
    icon: ChartPieIcon,
    accent: 'from-cyan-400/20 to-blue-400/10',
  },
  {
    title: 'Compliance Hub',
    description: 'Monitor verification tasks and document renewals at a glance.',
    icon: ShieldCheckIcon,
    accent: 'from-lime-400/20 to-emerald-400/10',
  },
  {
    title: 'Messaging Center',
    description: 'See open client threads and schedule follow-ups instantly.',
    icon: ChatBubbleLeftRightIcon,
    accent: 'from-fuchsia-400/20 to-purple-400/10',
  },
  {
    title: 'Automation Rules',
    description: 'Manage payout cadences, reminders, and upsell triggers.',
    icon: Cog6ToothIcon,
    accent: 'from-slate-400/20 to-slate-500/10',
  },
];

export const FinanceInfoTabs = ({ className }: FinanceInfoTabsProps) => {
  const containerClasses = [
    'flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-2xl',
    className || '',
  ].join(' ').trim();

  return (
    <section className={containerClasses}>
      <header className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Control Center</h2>
            <p className="text-[11px] text-white/50">Curated operational pods for blazing-fast actions.</p>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">8 pods</span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`group relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br ${card.accent} p-4 transition hover:border-white/25`}
            >
              <div className="absolute right-2 top-2 h-20 w-20 rounded-full bg-white/10 blur-2xl transition group-hover:scale-110" />
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-white/20 bg-white/10 p-2 text-white">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-white/70">{card.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
