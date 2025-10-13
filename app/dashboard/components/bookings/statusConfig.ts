import type { Booking } from '../../types';

export type BookingStatus = Booking['status'];

export const statusOrder: Record<BookingStatus, number> = {
  pending: 1,
  confirmed: 2,
  client_cancellation_requested: 3,
  provider_cancellation_requested: 4,
  completed: 5,
  cancelled: 6,
};

export const statusAccent: Record<BookingStatus, string> = {
  pending: 'border-amber-300/40 bg-amber-400/20 text-amber-100',
  confirmed: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100',
  completed: 'border-sky-300/40 bg-sky-400/20 text-sky-100',
  cancelled: 'border-rose-300/40 bg-rose-400/20 text-rose-100',
  client_cancellation_requested: 'border-orange-300/40 bg-orange-400/20 text-orange-100',
  provider_cancellation_requested: 'border-purple-300/40 bg-purple-400/20 text-purple-100',
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  client_cancellation_requested: 'Cancel Req',
  provider_cancellation_requested: 'Awaiting',
};

export const statusChipBaseClass =
  'whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]';
