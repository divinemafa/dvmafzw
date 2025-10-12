'use client';

import { Fragment, useState, useEffect } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'service' | 'product' | 'both';
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  is_featured: boolean;
  listings_count: number;
}

interface CategorySelectorProps {
  /** Currently selected category ID */
  value: string | null;
  /** Callback when category is selected */
  onChange: (categoryId: string | null, category: Category | null) => void;
  /** Filter categories by type (service/product/both) */
  type?: 'service' | 'product' | 'both';
  /** Whether selection is required */
  required?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Whether to show custom category option */
  allowCustom?: boolean;
  /** Callback when custom category is requested */
  onCustomCategory?: (categoryName: string) => void;
}

/**
 * CategorySelector - Hierarchical category selection component
 * 
 * Features:
 * - Two-level hierarchy (parent → children)
 * - Real-time search/filtering
 * - Featured category quick-select
 * - Keyboard navigation support
 * - Custom category creation
 * 
 * Usage:
 * ```tsx
 * <CategorySelector
 *   value={selectedCategoryId}
 *   onChange={(id, category) => setSelectedCategoryId(id)}
 *   type="service"
 *   required
 * />
 * ```
 */
export function CategorySelector({
  value,
  onChange,
  type = 'service',
  required = false,
  placeholder = 'Search categories...',
  allowCustom = true,
  onCustomCategory,
}: CategorySelectorProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected category object from ID
  const selectedCategory = [...parentCategories, ...childCategories].find(
    (cat) => cat.id === value
  ) || null;

  /**
   * Fetch top-level (parent) categories
   */
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setIsLoadingParents(true);
        setError(null);

        const params = new URLSearchParams({
          type,
          parent_id: 'null', // Only top-level categories
        });

        const response = await fetch(`/api/categories?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setParentCategories(data.categories || []);
        } else {
          setError(data.error || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching parent categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setIsLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, [type]);

  /**
   * Fetch child categories when parent is selected
   */
  useEffect(() => {
    const fetchChildCategories = async () => {
      if (!selectedParent) {
        setChildCategories([]);
        return;
      }

      try {
        setIsLoadingChildren(true);
        setError(null);

        const params = new URLSearchParams({
          type,
          parent_id: selectedParent.id,
        });

        const response = await fetch(`/api/categories?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setChildCategories(data.categories || []);
        } else {
          setError(data.error || 'Failed to load sub-categories');
        }
      } catch (err) {
        console.error('Error fetching child categories:', err);
        setError('Failed to load sub-categories. Please try again.');
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildCategories();
  }, [selectedParent, type]);

  /**
   * Filter categories based on search query
   */
  const getFilteredCategories = (): Category[] => {
    const query = searchQuery.toLowerCase().trim();

    // If no search query, show hierarchy (parent → children if parent selected)
    if (!query) {
      if (selectedParent && childCategories.length > 0) {
        return childCategories;
      }
      return parentCategories.filter((cat) => cat.is_featured).slice(0, 8);
    }

    // Search across all categories (both parent and child)
    const allCategories = [...parentCategories, ...childCategories];
    return allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  };

  const filteredCategories = getFilteredCategories();
  const featuredCategories = parentCategories.filter((cat) => cat.is_featured).slice(0, 4);

  /**
   * Handle category selection
   */
  const handleSelect = (category: Category | null) => {
    if (!category) {
      onChange(null, null);
      setSelectedParent(null);
      return;
    }

    // If selecting a parent category that has children, expand it
    if (category.parent_id === null) {
      setSelectedParent(category);
      onChange(category.id, category); // Still allow selecting parent
    } else {
      // Child category selected - this is the final selection
      onChange(category.id, category);
    }
  };

  /**
   * Handle custom category request
   */
  const handleCustomCategory = () => {
    if (onCustomCategory && searchQuery.trim()) {
      onCustomCategory(searchQuery.trim());
    }
  };

  /**
   * Reset to parent view
   */
  const handleBackToParents = () => {
    setSelectedParent(null);
    setSearchQuery('');
  };

  return (
    <Combobox value={selectedCategory} onChange={handleSelect}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon 
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" 
            aria-hidden="true" 
          />
          <Combobox.Input
            required={required}
            className="w-full rounded-xl border border-white/10 bg-slate-900/95 py-3 pl-10 pr-10 text-white placeholder-white/40 backdrop-blur-xl transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20 [color-scheme:dark]"
            displayValue={(category: Category | null) => category?.name || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isLoadingParents ? 'Loading categories...' : placeholder}
            disabled={isLoadingParents}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-white/40" aria-hidden="true" />
          </Combobox.Button>
        </div>

        {/* Featured Categories Quick Select */}
        {!selectedCategory && !searchQuery && featuredCategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-white/50">Popular:</span>
            {featuredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Breadcrumb Navigation */}
        {selectedParent && !searchQuery && (
          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
            <button
              type="button"
              onClick={handleBackToParents}
              className="hover:text-white transition"
            >
              All Categories
            </button>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="font-semibold text-white">
              {selectedParent.icon && `${selectedParent.icon} `}
              {selectedParent.name}
            </span>
            {isLoadingChildren && (
              <div className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
            )}
          </div>
        )}

        {/* Dropdown Options */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setSearchQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 py-1 shadow-2xl backdrop-blur-xl">
            {/* Loading State */}
            {isLoadingParents ? (
              <div className="px-4 py-3 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
                  Loading categories...
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            ) : filteredCategories.length === 0 ? (
              /* Empty State */
              <div className="px-4 py-3 text-sm">
                <p className="mb-2 text-white/60">
                  No categories match &quot;{searchQuery}&quot;
                </p>
                {allowCustom && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomCategory}
                    className="w-full rounded-lg bg-cyan-500/10 px-3 py-2 text-left text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    ➕ Add &quot;{searchQuery}&quot; as custom category
                  </button>
                )}
              </div>
            ) : (
              /* Category List */
              <>
                {selectedParent && !searchQuery && (
                  <div className="border-b border-white/10 px-4 py-2">
                    <button
                      type="button"
                      onClick={handleBackToParents}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      ← Back to all categories
                    </button>
                  </div>
                )}

                {filteredCategories.map((category) => (
                  <Combobox.Option
                    key={category.id}
                    value={category}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 transition ${
                        active ? 'bg-[#BD24DF]/20 text-white' : 'text-white/90'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {category.icon && (
                              <span className="text-lg">{category.icon}</span>
                            )}
                            <div>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {category.name}
                              </span>
                              {category.description && (
                                <span className="block text-xs text-white/50 truncate">
                                  {category.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {category.is_featured && (
                              <span className="text-xs text-cyan-400">★</span>
                            )}
                            {category.parent_id === null && (
                              <ChevronRightIcon className="h-4 w-4 text-white/40" />
                            )}
                          </div>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}

                {/* Footer Info */}
                <div className="border-t border-white/10 px-4 py-2 text-xs text-white/50">
                  {searchQuery
                    ? `Showing ${filteredCategories.length} results`
                    : selectedParent && childCategories.length > 0
                      ? `${childCategories.length} sub-categories`
                      : `${parentCategories.length} categories`}
                </div>

                {/* Custom Category Option */}
                {allowCustom && !selectedParent && (
                  <button
                    type="button"
                    onClick={handleCustomCategory}
                    className="w-full border-t border-white/10 px-4 py-2 text-left text-sm font-semibold text-cyan-300 transition hover:bg-white/5"
                  >
                    ➕ Add Custom Category
                  </button>
                )}
              </>
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
