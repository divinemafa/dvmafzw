import { BeakerIcon } from '@heroicons/react/24/outline';

export const AIContentBanner = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 shadow-xl backdrop-blur-2xl">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
          <BeakerIcon className="h-6 w-6 text-purple-300" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-base font-semibold text-white">AI Content Creation (Coming Soon)</h3>
          <p className="text-sm text-white/70">
            Soon you&apos;ll be able to generate listing descriptions, images, and optimize your content using AI. 
            Create professional listings in seconds without needing photos or writing skills.
          </p>
          <button className="mt-3 rounded-lg border border-purple-300/30 bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/30">
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
};
