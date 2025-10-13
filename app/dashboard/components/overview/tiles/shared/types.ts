/**
 * Shared TypeScript types for dashboard tiles
 */

export type TrendDirection = 'up' | 'down' | 'steady';

export interface TrendDescriptor {
  direction: TrendDirection;
  label: string;
}

export interface ActivityPoint {
  label: string;
  completed: number;
  cancelled: number;
  inProgress: number;
  total: number;
}
