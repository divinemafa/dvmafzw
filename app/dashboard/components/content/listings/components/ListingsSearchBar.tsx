import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilterToggle: () => void;
  showFilters: boolean;
  filteredCount?: number;
  totalCount?: number;
}

export const ListingsSearchBar = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onFilterToggle,
  showFilters,
  filteredCount,
  totalCount,
}: SearchBarProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search listings by title, category, or tags..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 shadow-lg backdrop-blur-xl transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
        />
        {filteredCount !== undefined && totalCount !== undefined && filteredCount < totalCount && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#BD24DF]/20 px-2 py-0.5 text-xs font-semibold text-[#BD24DF]">
            {filteredCount} of {totalCount}
          </div>
        )}
      </div>

      {/* Filter toggle button */}
      <button
        type="button"
        onClick={onFilterToggle}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
          showFilters
            ? 'border-[#BD24DF]/40 bg-[#BD24DF]/10 text-[#BD24DF] shadow-[0_4px_24px_-8px_rgba(189,36,223,0.5)]'
            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
        }`}
      >
        <FunnelIcon className="h-4 w-4" aria-hidden />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`rounded-lg px-3 py-2 transition ${
            viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'
          }`}
          aria-label="Grid view"
        >
          <Squares2X2Icon className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`rounded-lg px-3 py-2 transition ${
            viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'
          }`}
          aria-label="List view"
        >
          <ListBulletIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
};
