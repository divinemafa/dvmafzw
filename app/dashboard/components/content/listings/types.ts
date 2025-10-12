// Re-export Listing type from dashboard types for consistency
export type { Listing } from '../../../types';

export interface StatsData {
  total: number;
  active: number;
  paused: number;
  draft: number;
}

export type ViewMode = 'grid' | 'list';
