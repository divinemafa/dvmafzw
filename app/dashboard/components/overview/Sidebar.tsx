import { 
  PlusCircleIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface QuickStatsProps {
  bmcBalance: number;
}

export const QuickStats = ({ bmcBalance }: QuickStatsProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Quick Stats</h2>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">This Week&apos;s Earnings</span>
          <span className="text-sm font-bold text-emerald-300">R1,850</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">New Messages</span>
          <span className="text-sm font-bold text-blue-300">7</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Profile Views</span>
          <span className="text-sm font-bold text-purple-300">342</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">BMC Balance</span>
          <span className="text-sm font-bold text-yellow-300">{bmcBalance.toLocaleString()} BMC</span>
        </div>
      </div>
    </div>
  );
};

export const QuickActions = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="p-4 space-y-2">
        <button className="w-full rounded-lg border border-white/15 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-3 text-left text-sm font-semibold text-white transition hover:from-purple-500/30 hover:to-blue-500/30">
          <PlusCircleIcon className="mr-2 inline-block h-5 w-5" />
          Create New Listing
        </button>
        <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
          <ChatBubbleLeftRightIcon className="mr-2 inline-block h-5 w-5" />
          View Messages
        </button>
        <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
          <CalendarIcon className="mr-2 inline-block h-5 w-5" />
          Manage Calendar
        </button>
        <button className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/20">
          <ChartBarIcon className="mr-2 inline-block h-5 w-5" />
          View Analytics
        </button>
      </div>
    </div>
  );
};
