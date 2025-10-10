/**
 * Dashboard Layout - Full-screen experience without external nav/footer
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Bitcoin Mascot',
  description: 'Manage your listings, bookings, and business on Bitcoin Mascot',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#2d2440] to-[#1a1a2e]">
      {children}
    </div>
  );
}
