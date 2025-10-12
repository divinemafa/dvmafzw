import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClearFilters: () => void;
  onClose?: () => void;
}

const categories = [
  'Tech Support',
  'Creative Services',
  'Business Consulting',
  'Marketing & SEO',
  'Writing & Translation',
  'Education & Training',
];

export const ListingsFilterPanel = ({
  selectedCategories,
  onCategoryToggle,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
  onClose,
}: FilterPanelProps) => {
  const hasActiveFilters = selectedCategories.length > 0 || minPrice !== '' || maxPrice !== '';

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Filters</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 transition hover:text-white/80"
            aria-label="Close filters"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Category</p>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 text-sm text-white/80 transition hover:text-white">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#BD24DF] focus:ring-2 focus:ring-[#BD24DF]/40 focus:ring-offset-0"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Price Range (BTC)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minPrice" className="mb-1 block text-xs text-white/60">
              Min
            </label>
            <input
              id="minPrice"
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0.0001"
              step="0.0001"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="mb-1 block text-xs text-white/60">
              Max
            </label>
            <input
              id="maxPrice"
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="1.0000"
              step="0.0001"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};
