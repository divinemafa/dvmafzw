import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon, 
  BanknotesIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export const FinanceSidebar = () => {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          <p className="text-[11px] text-white/50">Move money in a couple of taps</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <div className="space-y-2 text-sm font-semibold text-white">
            <button className="w-full rounded-xl border border-white/15 bg-gradient-to-r from-[#BD24DF]/30 to-[#2D6ADE]/30 px-4 py-3 text-left transition hover:border-white/25 hover:shadow-lg">
              <CurrencyDollarIcon className="mr-2 inline-block h-5 w-5 align-middle" />
              Send Money to User
            </button>
            <button className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/15">
              <ArrowsRightLeftIcon className="mr-2 inline-block h-5 w-5 align-middle" />
              Exchange BMC/ZAR
            </button>
            <button className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/15">
              <BanknotesIcon className="mr-2 inline-block h-5 w-5 align-middle" />
              Buy BMC Credits
            </button>
            <button className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/15">
              <DocumentTextIcon className="mr-2 inline-block h-5 w-5 align-middle" />
              Transaction History
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent p-4 shadow-xl backdrop-blur-2xl">
        <div className="mb-2 flex items-center gap-2 text-white">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-300" />
          <h3 className="text-sm font-semibold">About BMC Credits</h3>
        </div>
        <p className="text-[11px] leading-relaxed text-white/70">
          BMC (Bitcoin Mascot Credits) fuel premium boosts, marketplace perks, and secure transfers. Earn them through tasks or top up instantly with fiat.
        </p>
        <button className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-blue-300 transition hover:text-blue-200">
          Learn more →
        </button>
      </div>
    </div>
  );
};
