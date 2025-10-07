import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon, 
  BanknotesIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export const FinanceSidebar = () => {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <button className="w-full rounded-lg border border-white/15 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-3 text-left text-sm font-semibold text-white transition hover:from-blue-500/30 hover:to-purple-500/30">
              <CurrencyDollarIcon className="mr-2 inline-block h-5 w-5" />
              Send Money to User
            </button>
            <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
              <ArrowsRightLeftIcon className="mr-2 inline-block h-5 w-5" />
              Exchange BMC/ZAR
            </button>
            <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
              <BanknotesIcon className="mr-2 inline-block h-5 w-5" />
              Buy BMC Credits
            </button>
            <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
              <DocumentTextIcon className="mr-2 inline-block h-5 w-5" />
              Transaction History
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-300" />
          <h3 className="text-sm font-semibold text-white">About BMC Credits</h3>
        </div>
        <p className="text-xs leading-relaxed text-white/70">
          BMC (Bitcoin Mascot Credits) are platform credits used for premium features, boosting listings, and peer-to-peer transfers. Earn them for free or purchase as needed.
        </p>
        <button className="mt-3 text-xs font-semibold text-blue-300 hover:text-blue-200">
          Learn more →
        </button>
      </div>
    </div>
  );
};
