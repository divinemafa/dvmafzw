import {
  HomeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import type { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  // Ordered by business priority: Core operations first, supporting tools last
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: HomeIcon },
    { id: 'content' as TabType, label: 'Content', icon: DocumentTextIcon },
    { id: 'finance' as TabType, label: 'Finance', icon: BanknotesIcon },
    { id: 'bookings' as TabType, label: 'Bookings', icon: TicketIcon },
    { id: 'reviews' as TabType, label: 'Reviews', icon: StarIcon },
    { id: 'clients' as TabType, label: 'Clients', icon: UsersIcon },
    { id: 'analytics' as TabType, label: 'Analytics', icon: ChartBarIcon },
    { id: 'messages' as TabType, label: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'calendar' as TabType, label: 'Calendar', icon: CalendarIcon },
    { id: 'settings' as TabType, label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
      {/* Horizontal scroll container for mobile */}
      <div className="hide-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-2 p-2 lg:flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition lg:px-6 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
