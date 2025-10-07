import { HomeIcon, DocumentTextIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import type { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: HomeIcon },
    { id: 'content' as TabType, label: 'Content Management', icon: DocumentTextIcon },
    { id: 'finance' as TabType, label: 'Finance', icon: BanknotesIcon },
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
      <div className="flex flex-wrap gap-2 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
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
  );
};
