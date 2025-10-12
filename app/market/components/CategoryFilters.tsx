/**
 * CategoryFilters Component
 * Beautiful metadata-based filtering for services and products
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Category } from '../hooks/useCategories';

interface CategoryFiltersProps {
  categories: Category[];
  selectedType: 'all' | 'service' | 'product';
  selectedGroup: string | null;
  selectedCategory: string | null;
  onTypeChange: (type: 'all' | 'service' | 'product') => void;
  onGroupChange: (groupId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilters({
  categories,
  selectedType,
  selectedGroup,
  selectedCategory,
  onTypeChange,
  onGroupChange,
  onCategoryChange,
}: CategoryFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get parent categories (groups)
  const parentCategories = categories.filter(cat => cat.parent_id === null);
  
  // Get child categories for a parent
  const getChildren = (parentId: string) => 
    categories.filter(cat => cat.parent_id === parentId);

  // Filter categories by type and search query
  const { filteredParents, matchedParentIds } = useMemo(() => {
    let parents = selectedType === 'all' 
      ? parentCategories 
      : parentCategories.filter(cat => cat.type === selectedType || cat.type === 'both');
    
    const matchedParents = new Set<string>();
    
    // Apply search filter using debounced search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      
      // Search in all categories (parents and children)
      categories.forEach(cat => {
        const matches = 
          cat.name.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query));
        
        if (matches) {
          if (cat.parent_id === null) {
            // It's a parent that matches
            matchedParents.add(cat.id);
          } else {
            // It's a child that matches - include its parent
            if (cat.parent_id) {
              matchedParents.add(cat.parent_id);
            }
          }
        }
      });
      
      // Filter parents to only those that match or have matching children
      parents = parents.filter(p => matchedParents.has(p.id));
    }
    
    return { filteredParents: parents, matchedParentIds: matchedParents };
  }, [categories, selectedType, debouncedSearch, parentCategories]);

  // Auto-expand parents that have matching children (separate effect to avoid re-render loop)
  useEffect(() => {
    if (debouncedSearch.trim() && matchedParentIds.size > 0) {
      setExpandedGroups(new Set(matchedParentIds));
    }
  }, [debouncedSearch, matchedParentIds]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Calculate counts
  const serviceCategoriesCount = parentCategories.filter(
    cat => cat.type === 'service' || cat.type === 'both'
  ).length;
  
  const productCategoriesCount = parentCategories.filter(
    cat => cat.type === 'product' || cat.type === 'both'
  ).length;

  // Filter children by search query (use debounced search)
  const getFilteredChildren = (parentId: string) => {
    const children = getChildren(parentId);
    if (!debouncedSearch.trim()) return children;
    
    const query = debouncedSearch.toLowerCase().trim();
    return children.filter(child =>
      child.name.toLowerCase().includes(query) ||
      child.slug.toLowerCase().includes(query) ||
      (child.description && child.description.toLowerCase().includes(query))
    );
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  return (
    <div className="space-y-3">
      {/* Live Search */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="p-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-lg bg-white/5 pl-8 pr-8 py-2 text-[11px] text-white placeholder:text-white/40 border border-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-3.5 w-3.5 text-white/60 hover:text-white" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-1.5 text-[9px] text-white/50 font-thin">
              {searchQuery !== debouncedSearch ? (
                <span className="text-blue-400 flex items-center gap-1">
                  <span className="inline-block animate-pulse">⏳</span>
                  Searching...
                </span>
              ) : filteredParents.length === 0 ? (
                <span className="text-orange-400">No categories found</span>
              ) : (
                <span>Found {filteredParents.length} categor{filteredParents.length === 1 ? 'y' : 'ies'}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Type Filter - Services/Products */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-3 py-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/90">Filter By Type</h3>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onTypeChange('all');
                onGroupChange(null);
                onCategoryChange(null);
              }}
              className={`rounded-lg px-2 py-2 text-center transition-all ${
                selectedType === 'all'
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="text-base mb-0.5">✨</div>
              <div className="text-[10px] font-bold">All</div>
              <div className="text-[9px] font-thin text-white/40">
                {categories.length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onTypeChange('service');
                onGroupChange(null);
                onCategoryChange(null);
              }}
              className={`rounded-lg px-2 py-2 text-center transition-all ${
                selectedType === 'service'
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-white shadow-lg shadow-green-500/20 ring-1 ring-green-400/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="text-base mb-0.5">🛠️</div>
              <div className="text-[10px] font-bold">Services</div>
              <div className="text-[9px] font-thin text-white/40">
                {serviceCategoriesCount}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onTypeChange('product');
                onGroupChange(null);
                onCategoryChange(null);
              }}
              className={`rounded-lg px-2 py-2 text-center transition-all ${
                selectedType === 'product'
                  ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-white shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="text-base mb-0.5">📦</div>
              <div className="text-[10px] font-bold">Products</div>
              <div className="text-[9px] font-thin text-white/40">
                {productCategoriesCount}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Category Groups */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-3 py-2 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/90">
            {selectedType === 'service' ? 'Service Categories' : 
             selectedType === 'product' ? 'Product Categories' : 
             'Browse Categories'}
          </h3>
          {selectedGroup && (
            <button
              type="button"
              onClick={() => {
                onGroupChange(null);
                onCategoryChange(null);
              }}
              className="text-[9px] font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <nav className="max-h-[500px] overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <ul className="space-y-0.5">
              {/* All Option */}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onGroupChange(null);
                    onCategoryChange(null);
                  }}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-all flex items-center gap-2 ${
                    selectedGroup === null && selectedCategory === null
                      ? 'bg-white/10 text-white shadow-md'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-xs">🌐</span>
                  <span className="flex-1 text-[11px] font-semibold">
                    All {selectedType === 'service' ? 'Services' : 
                         selectedType === 'product' ? 'Products' : 'Categories'}
                  </span>
                </button>
              </li>

              {/* No Results Message */}
              {debouncedSearch && filteredParents.length === 0 && (
                <li className="text-center py-8">
                  <div className="text-white/40 text-[11px] mb-1">No categories found</div>
                  <div className="text-white/30 text-[9px] font-thin">
                    Try different keywords or{' '}
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      clear search
                    </button>
                  </div>
                </li>
              )}

              {/* Parent Categories (Groups) */}
              {filteredParents.map((parent) => {
                const children = getFilteredChildren(parent.id);
                const isExpanded = expandedGroups.has(parent.id);
                const isSelected = selectedGroup === parent.id;
                const hasChildren = children.length > 0;
                
                // Highlight matching search terms (use debounced search)
                const highlightMatch = (text: string) => {
                  if (!debouncedSearch.trim()) return text;
                  const query = debouncedSearch.trim();
                  // Escape special regex characters
                  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escapedQuery})`, 'gi');
                  return text.replace(regex, '<mark class="bg-yellow-400/30 text-white">$1</mark>');
                };

                return (
                  <li key={parent.id}>
                    {/* Parent Category */}
                    <div className="flex items-stretch gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onGroupChange(parent.id);
                          onCategoryChange(null);
                          if (hasChildren) {
                            toggleGroup(parent.id);
                          }
                        }}
                        className={`flex-1 rounded-lg px-2.5 py-1.5 text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-white font-semibold shadow-md ring-1 ring-blue-400/20'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{parent.icon || '📁'}</span>
                        <span 
                          className="flex-1 text-[11px] font-semibold line-clamp-1"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(parent.name) }}
                        />
                        {parent.listings_count > 0 && (
                          <span className="text-[9px] font-thin text-white/40">
                            {parent.listings_count}
                          </span>
                        )}
                      </button>
                      
                      {/* Expand/Collapse Button */}
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(parent.id)}
                          className={`w-7 rounded-lg transition-all flex items-center justify-center ${
                            isExpanded
                              ? 'bg-white/10 text-white'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div
                            className={`text-[10px] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                          >
                            ▼
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Child Categories */}
                    {hasChildren && isExpanded && (
                      <ul className="mt-0.5 ml-4 space-y-0.5 overflow-hidden border-l border-white/10 pl-2 animate-slide-down">
                        {children.map((child) => (
                          <li key={child.id}>
                            <button
                              type="button"
                              onClick={() => {
                                onGroupChange(parent.id);
                                onCategoryChange(child.id);
                              }}
                              className={`w-full rounded-md px-2 py-1 text-left transition-all flex items-center gap-1.5 ${
                                selectedCategory === child.id
                                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="text-[10px]">{child.icon || '•'}</span>
                              <span 
                                className="flex-1 text-[10px] line-clamp-1"
                                dangerouslySetInnerHTML={{ __html: highlightMatch(child.name) }}
                              />
                              {child.listings_count > 0 && (
                                <span className="text-[8px] font-thin text-white/30">
                                  {child.listings_count}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Fade effect at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a1532] via-[#0a1532]/80 to-transparent" />
        </div>
      </div>
    </div>
  );
}
