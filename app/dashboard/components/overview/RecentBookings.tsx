import { CalendarIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../../types';

interface RecentBookingsProps {
  bookings: Booking[];
}

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            >
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-white">{booking.service}</h3>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span>{booking.client}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {booking.date} at {booking.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">R{booking.amount}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
