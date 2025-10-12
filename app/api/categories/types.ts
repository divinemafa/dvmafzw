/**
 * Category Types
 * TypeScript interfaces matching the database schema
 */

export type CategoryType = 'service' | 'product' | 'both';
export type CategoryStatus = 'active' | 'inactive' | 'draft';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  status: CategoryStatus;
  is_featured: boolean;
  created_by: string | null;
  listings_count: number;
  services_count: number;
  products_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children: Category[];
}
