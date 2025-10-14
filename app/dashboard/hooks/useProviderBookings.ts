'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Booking } from '../types';

interface ProviderDashboardResponse {
  metrics?: {
    nextBooking?: {
      reference: string;
    } | null;
  };
  bookings?: Booking[];
}

export function useProviderBookings() {
  const [data, setData] = useState<ProviderDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/bookings/provider-dashboard');
        if (!res.ok) {
          const err = await res.json().catch(() => ({} as any));
          throw new Error(err?.details || err?.error || res.statusText);
        }
        const json = (await res.json()) as ProviderDashboardResponse;
        if (active) setData(json);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load bookings');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedBooking: Booking | null = useMemo(() => {
    const list = data?.bookings ?? [];
    if (!list.length) return null;

    // 1) Prefer API-indicated next booking by reference if present
    const ref = data?.metrics?.nextBooking?.reference;
    if (ref) {
      const match = list.find((b) => b.reference === ref);
      if (match) return match;
    }

    // 2) Otherwise, find upcoming pending/confirmed by soonest preferredDate/startDate/date
    const now = Date.now();
    const parse = (b: Booking) => {
      const d = b.preferredDate ?? b.startDate ?? b.date ?? null;
      const t = d ? Date.parse(d) : NaN;
      return Number.isFinite(t) ? t : NaN;
    };

    const upcoming = list
      .filter((b) => (b.status === 'pending' || b.status === 'confirmed'))
      .map((b) => ({ b, t: parse(b) }))
      .filter(({ t }) => Number.isFinite(t) && t >= now)
      .sort((a, b) => a.t - b.t);
    if (upcoming[0]?.b) return upcoming[0].b;

    // 3) If none upcoming, choose the most recent pending/confirmed (closest past)
    const recent = list
      .filter((b) => (b.status === 'pending' || b.status === 'confirmed'))
      .map((b) => ({ b, t: parse(b) }))
      .filter(({ t }) => Number.isFinite(t) && t < now)
      .sort((a, b) => b.t - a.t);
    if (recent[0]?.b) return recent[0].b;

    return null;
  }, [data]);

  return { upcomingBooking: selectedBooking, loading, error } as const;
}
