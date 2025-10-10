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
  const stats = [
    { label: 'Week Earnings', value: 'R1,850', icon: '💰', color: 'text-emerald-400' },
    { label: 'Messages', value: '7', icon: '📩', color: 'text-blue-400' },
    { label: 'Views', value: '342', icon: '👁️', color: 'text-purple-400' },
    { label: 'BMC', value: `${bmcBalance.toLocaleString()}`, icon: '💎', color: 'text-yellow-400' },
  ];

  return (
    <div className="overflow-hidden bg-white/5 backdrop-blur-xl">
      <div className="bg-white/5 px-2 py-1.5">
        <h2 className="text-xs font-bold text-white">Quick Stats</h2>
      </div>
      <div className="p-1.5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-1.5 transition hover:bg-white/5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-[10px] text-white/70">{stat.label}</span>
            </div>
            <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickActions = () => {
  const actions = [
    {
      label: 'New Listing',
      icon: PlusCircleIcon,
      href: '/dashboard?tab=content',
      primary: true,
    },
    {
      label: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard?tab=messages',
      primary: false,
    },
    {
      label: 'Calendar',
      icon: CalendarIcon,
      href: '/dashboard?tab=calendar',
      primary: false,
    },
    {
      label: 'Analytics',
      icon: ChartBarIcon,
      href: '/dashboard?tab=analytics',
      primary: false,
    },
  ];

  return (
    <div className="overflow-hidden bg-white/5 backdrop-blur-xl">
      <div className="bg-white/5 px-2 py-1.5">
        <h2 className="text-xs font-bold text-white">Quick Actions</h2>
      </div>
      <div className="space-y-1 p-1.5">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`group relative w-full overflow-hidden px-2 py-1.5 text-left font-semibold transition ${
              action.primary
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <div className="relative flex items-center gap-2">
              <action.icon className="h-3 w-3" />
              <span className="text-[10px]">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
