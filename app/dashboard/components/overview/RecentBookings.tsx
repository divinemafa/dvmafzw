import { CalendarIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../../types';

interface RecentBookingsProps {
  bookings: Booking[];
}

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          icon: '✅',
          border: 'border-emerald-500/30',
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          icon: '⏳',
          border: 'border-yellow-500/30',
        };
      case 'completed':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          icon: '✓',
          border: 'border-blue-500/30',
        };
      default:
        return {
          bg: 'bg-white/10',
          text: 'text-white/60',
          icon: '•',
          border: 'border-white/10',
        };
    }
  };

  return (
    <div className="overflow-hidden bg-white/5 backdrop-blur-xl">
      <div className="bg-white/5 px-2 py-1.5">
        <h2 className="text-xs font-bold text-white">Recent Bookings</h2>
      </div>
      <div className="p-2">
        <div className="space-y-1">
          {bookings.slice(0, 3).map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            return (
              <div
                key={booking.id}
                className="group relative overflow-hidden bg-white/5 p-2 transition hover:bg-white/10"
              >
                <div className="relative flex items-center gap-2">
                  {/* Avatar Circle */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-[10px] font-bold text-white">
                    {booking.client?.charAt(0) || 'U'}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] font-semibold text-white truncate">
                      {booking.service}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <span className="truncate">{booking.client}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 whitespace-nowrap">
                        <CalendarIcon className="h-2.5 w-2.5" />
                        {booking.date}
                      </span>
                    </div>
                  </div>

                  {/* Price and Status */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs font-bold text-white">
                      R{booking.amount}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 ${statusConfig.bg} px-1.5 py-0.5 text-[10px] font-semibold ${statusConfig.text}`}
                    >
                      <span>{statusConfig.icon}</span>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
