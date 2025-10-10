/**
 * DashboardSidebar - Collapsible Navigation Sidebar
 * Integrated navigation for full-screen dashboard experience
 */

'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { TabType } from '../types';

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
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

  const globalNavigationLinks: Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }> = [
    { href: '/', label: 'Home', icon: GlobeAltIcon },
    { href: '/market', label: 'Marketplace', icon: BuildingStorefrontIcon },
    { href: '/exchange', label: 'Exchange', icon: CurrencyDollarIcon },
    { href: '/profile', label: 'Profile', icon: UserCircleIcon },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:bg-white/10 lg:hidden"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-gradient-to-b from-[#0a0a1a] to-[#050814] backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? 'w-14' : 'w-52'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex h-12 items-center justify-between px-2">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                ₿
              </div>
              <div>
                <div className="text-[10px] font-bold text-white">Bitcoin Mascot</div>
                <div className="text-[9px] text-white/60">Dashboard</div>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="flex h-7 w-7 items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
              ₿
            </div>
          )}
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden p-1 transition hover:bg-white/10 lg:block"
          >
            <Bars3Icon className="h-3 w-3 text-white/60" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-1">
          <div className="space-y-0">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={`group relative flex w-full items-center gap-2 px-2 py-2 transition ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-gradient-to-b from-purple-500 to-blue-500" />
                )}

                <item.icon className="h-3.5 w-3.5 shrink-0" />
                
                {!isCollapsed && (
                  <span className="text-[10px] font-medium">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-1 hidden bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:block">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/5 p-1">
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Quick links
            </p>
          )}
          <div className="space-y-0">
            {globalNavigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="group relative flex items-center gap-2 px-2 py-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {!isCollapsed && (
                    <span className="text-[10px] font-medium">{link.label}</span>
                  )}
                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-full ml-1 hidden rounded bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:block">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Exit Dashboard */}
        <div className="p-1">
          <Link
            href="/"
            className="flex w-full items-center gap-2 bg-white/5 px-2 py-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftOnRectangleIcon className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-medium">Exit</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
