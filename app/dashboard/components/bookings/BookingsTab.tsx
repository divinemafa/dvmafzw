/**
 * Bookings Tab - Manage service bookings and appointments
 */

'use client';

import { TicketIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../../types';

interface BookingsTabProps {
  bookings?: Booking[];
}

export function BookingsTab({ bookings = [] }: BookingsTabProps) {
  // Mock stats until real data wired
  const stats = {
    pending: 12,
    confirmed: 45,
    completed: 230,
    cancelled: 8,
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={CheckCircleIcon}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={TicketIcon}
          color="green"
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircleIcon}
          color="red"
        />
      </div>

      {/* Bookings List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          <p className="mt-1 text-sm text-white/60">Manage your service bookings</p>
        </div>

        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <TicketIcon className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-4 text-lg font-semibold text-white">No bookings yet</h3>
              <p className="mt-2 text-sm text-white/60">
                Your service bookings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{booking.listingTitle || booking.service || 'Booking'}</h4>
                      <p className="mt-1 text-sm text-white/60">
                        {booking.startDate && booking.endDate ? (
                          `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                        ) : (
                          booking.date && booking.time ? `${booking.date} at ${booking.time}` : 'Date TBD'
                        )}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'yellow' | 'blue' | 'green' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
