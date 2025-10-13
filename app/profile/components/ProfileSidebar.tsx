/**
 * Profile Sidebar Navigation
 * 
 * Displays navigation menu for different profile sections
 */

import {
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  TruckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { ProfileSection } from '../types';

interface ProfileSidebarProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  unreadMessages: number;
  isVerified: boolean;
  onSignOut: () => void;
}

export function ProfileSidebar({
  activeSection,
  onSectionChange,
  unreadMessages,
  isVerified,
  onSignOut,
}: ProfileSidebarProps) {
  const navItems = [
    {
      id: 'profile' as ProfileSection,
      label: 'Profile Info',
      icon: UserCircleIcon,
      badge: null,
    },
    {
      id: 'messages' as ProfileSection,
      label: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      id: 'tracking' as ProfileSection,
      label: 'Tracking',
      icon: TruckIcon,
      badge: null,
    },
    {
      id: 'bookings' as ProfileSection,
      label: 'Bookings',
      icon: CalendarDaysIcon,
      badge: null,
    },
    {
      id: 'verification' as ProfileSection,
      label: 'Verification',
      icon: ShieldCheckIcon,
      badge: isVerified ? 'verified' : null,
    },
    {
      id: 'settings' as ProfileSection,
      label: 'Settings',
      icon: Cog6ToothIcon,
      badge: null,
    },
    {
      id: 'security' as ProfileSection,
      label: 'Security',
      icon: KeyIcon,
      badge: null,
    },
  ];

  return (
    <div className="sticky top-6 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
            activeSection === item.id
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
          {item.badge === 'verified' && (
            <CheckCircleIcon className="ml-auto h-4 w-4 text-emerald-400" />
          )}
          {typeof item.badge === 'number' && (
            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold">
              {item.badge}
            </span>
          )}
        </button>
      ))}

      <div className="border-t border-white/10 pt-2">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
