import { memo } from 'react';
import type { Booking } from '../../types';
import { statusAccent, statusChipBaseClass, statusLabels } from './statusConfig';

export interface PipelineRow {
  id: string | number;
  status: Booking['status'];
  title: string;
  client?: string;
  windowLabel: string;
  amountLabel: string;
  isPlaceholder?: boolean;
}

interface PipelineBoardProps {
  rows: PipelineRow[];
  activeFilter: Booking['status'] | 'all';
  onFilterChange: (status: Booking['status']) => void;
  onRowSelect: (rowId: string | number) => void;
}

const filterOptions: Booking['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];

function PipelineBoardComponent({ rows, activeFilter, onFilterChange, onRowSelect }: PipelineBoardProps) {
  return (
    <div className="space-y-3 text-xs text-white/70">
      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onFilterChange(status)}
            className={`${statusChipBaseClass} transition ${
              activeFilter === status
                ? `${statusAccent[status]} border-opacity-80`
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[110px,minmax(0,1.4fr),minmax(0,1fr),72px] items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
          <span>Status</span>
          <span>Booking</span>
          <span>Window</span>
          <span className="text-right">Value</span>
        </div>
        <div className="divide-y divide-white/5">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => !row.isPlaceholder && onRowSelect(row.id)}
              disabled={row.isPlaceholder}
              className={`grid w-full grid-cols-[110px,minmax(0,1.4fr),minmax(0,1fr),72px] items-center gap-3 px-4 py-3.5 text-xs text-left transition ${
                row.isPlaceholder
                  ? 'cursor-default italic text-white/45'
                  : 'cursor-pointer text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="flex flex-wrap gap-1">
                <span className={`${statusChipBaseClass} ${statusAccent[row.status]}`}>
                  {statusLabels[row.status]}
                </span>
              </span>
              <span className="min-w-0 overflow-hidden">
                <span
                  className={`block truncate font-semibold text-white ${row.isPlaceholder ? 'text-white/50' : ''}`}
                  title={row.title}
                >
                  {row.title}
                </span>
                {row.client ? <span className="block truncate text-[11px] text-white/50" title={row.client}>{row.client}</span> : null}
              </span>
              <span className="truncate text-[11px] text-white/55" title={row.windowLabel}>{row.windowLabel}</span>
              <span className="text-right text-[11px] text-white/70">{row.amountLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const PipelineBoard = memo(PipelineBoardComponent);
