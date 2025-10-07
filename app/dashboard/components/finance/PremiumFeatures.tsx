import type { PremiumFeature } from '../../types';

interface PremiumFeaturesProps {
  features: PremiumFeature[];
}

export const PremiumFeatures = ({ features }: PremiumFeaturesProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Premium Features</h2>
        <p className="text-xs text-white/60">Unlock advanced tools with your credits</p>
      </div>
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${feature.color} p-4 backdrop-blur-2xl transition hover:border-white/20`}
            >
              <div className="mb-3 flex items-center justify-between">
                <feature.icon className="h-6 w-6 text-white" />
                <span className="text-xs text-white/60">{feature.period}</span>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{feature.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{feature.cost}</span>
                <span className="text-xs text-white/60">BMC</span>
              </div>
              <button className="mt-3 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                Activate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
