import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import type { Booking } from '../../types';
import { statusAccent, statusChipBaseClass, statusLabels } from './statusConfig';

export interface TimelineRow {
  id: string | number;
  status: Booking['status'];
  title: string;
  client: string;
  windowLabel: string;
  location?: string | null;
  amountLabel: string;
}

interface TimelineSectionProps {
  rows: TimelineRow[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRowSelect: (id: string | number) => void;
}

function TimelineSectionComponent({ rows, searchQuery, onSearchChange, onRowSelect }: TimelineSectionProps) {
  return (
    <div className="space-y-3 text-xs text-white/70">
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          aria-hidden
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search client or booking"
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-[11px] text-white placeholder-white/35 transition focus:border-white/25 focus:bg-white/10 focus:outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[minmax(0,1.4fr),minmax(0,1fr),minmax(0,0.9fr),72px] items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
          <span>Booking</span>
          <span>Schedule</span>
          <span>Location</span>
          <span className="text-right">Value</span>
        </div>
        <div className="divide-y divide-white/5">
          {rows.length ? (
            rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onRowSelect(row.id)}
                className="grid w-full grid-cols-[minmax(0,1.4fr),minmax(0,1fr),minmax(0,0.9fr),72px] items-center gap-3 px-4 py-3.5 text-left text-xs text-white/70 transition hover:bg-white/5"
              >
                <span className="min-w-0 overflow-hidden">
                  <span className="block truncate font-semibold text-white" title={row.title}>{row.title}</span>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] text-white/55">
                    <span className={`${statusChipBaseClass} ${statusAccent[row.status]}`}>
                      {statusLabels[row.status]}
                    </span>
                    <span className="truncate text-white/50" title={row.client}>{row.client}</span>
                  </span>
                </span>
                <span className="truncate text-[11px] text-white/55" title={row.windowLabel}>{row.windowLabel}</span>
                <span className="truncate text-[11px] text-white/55" title={row.location ?? '—'}>{row.location ?? '—'}</span>
                <span className="text-right text-[11px] text-white/70">{row.amountLabel}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-[11px] text-white/45">
              No bookings match your filters right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const TimelineSection = memo(TimelineSectionComponent);
