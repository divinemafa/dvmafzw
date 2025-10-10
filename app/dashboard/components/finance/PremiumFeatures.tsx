import type { PremiumFeature } from '../../types';

interface PremiumFeaturesProps {
  features: PremiumFeature[];
  className?: string;
}

export const PremiumFeatures = ({ features, className }: PremiumFeaturesProps) => {
  const containerClasses = [
    'flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-2xl',
    className || '',
  ].join(' ').trim();

  return (
    <div className={containerClasses}>
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Premium Features</h2>
        <p className="text-[11px] text-white/50">Unlock advanced tools with your credits</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br ${feature.color} p-4 text-white backdrop-blur-2xl transition hover:border-white/25`}
            >
              <div className="mb-3 flex items-center justify-between text-xs text-white/80">
                <feature.icon className="h-6 w-6 text-white" />
                <span>{feature.period}</span>
              </div>
              <h3 className="mb-1 text-sm font-semibold leading-tight">{feature.title}</h3>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-xl font-bold">{feature.cost}</span>
                <span className="text-[11px] uppercase tracking-wide">BMC</span>
              </div>
              <button className="mt-3 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15">
                Activate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
