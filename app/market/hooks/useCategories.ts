/**
 * useCategories Hook
 * Fetches categories from the database
 */

'use client';

import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'service' | 'product' | 'both';
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  status: string;
  is_featured: boolean;
  listings_count: number;
  services_count: number;
  products_count: number;
  created_at: string;
  updated_at: string;
}

interface UseCategoriesOptions {
  type?: 'service' | 'product' | 'both';
  featured?: boolean;
  format?: 'flat' | 'grouped';
}

interface UseCategoriesReturn {
  categories: Category[];
  groups?: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.featured) params.append('featured', 'true');
      if (options.format) params.append('format', options.format);

      const response = await fetch(`/api/categories?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      if (options.format === 'grouped') {
        setGroups(data.groups || []);
        // Flatten groups to also have categories array
        const flatCategories: Category[] = [];
        (data.groups || []).forEach((group: any) => {
          flatCategories.push(group);
          if (group.children) {
            flatCategories.push(...group.children);
          }
        });
        setCategories(flatCategories);
      } else {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCategories([]);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.type, options.featured, options.format]);

  return {
    categories,
    groups,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
