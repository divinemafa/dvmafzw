/**
 * Shared utility functions for dashboard tiles
 */

export const getCardBaseClasses = (compact: boolean) =>
  [
    // Richer, more colorful base similar to NextBooking card
    'rounded-2xl border border-white/15 bg-gradient-to-br from-indigo-500/15 via-slate-900/25 to-transparent shadow-[0_32px_80px_-40px_rgba(148,163,184,0.45)] backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
    compact ? 'p-4' : 'p-5',
  ].join(' ');

export const accentRing =
  'after:absolute after:-inset-px after:-z-10 after:pointer-events-none after:rounded-2xl after:opacity-0 after:transition after:content-[""] hover:after:opacity-100';

export const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatCurrency = (amount: number, currency = 'USD') =>
  amount.toLocaleString(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  });
