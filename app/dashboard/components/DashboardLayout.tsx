/**
 * Dashboard Layout - Three Column Structure
 * 
 * Left: Collapsible Navigation Sidebar (on mobile: bottom nav or drawer)
 * Center: Main Content Area
 * Right: Quick Actions & Stats Sidebar
 */

'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar?: React.ReactNode;
  showRightSidebar?: boolean;
}

export function DashboardLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
  showRightSidebar = true,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white/5 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10 lg:hidden"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {leftSidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 rounded-lg bg-white/10 p-2 backdrop-blur-xl hover:bg-white/20 lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          {mainContent}
        </div>
      </main>

      {/* Right Sidebar - Quick Actions/Stats */}
      {showRightSidebar && rightSidebar && (
        <aside className="hidden w-80 overflow-y-auto bg-white/5 backdrop-blur-xl lg:sticky lg:top-0 lg:block lg:h-screen xl:w-96">
          <div className="p-4">
            {rightSidebar}
          </div>
        </aside>
      )}
    </div>
  );
}
