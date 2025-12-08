import { Search, Filter, SortAsc, X } from 'lucide-react'

/**
 * Collection Filters - Filter and sort for total collection view
 */
export default function CollectionFilters({
  searchTerm,
  ownershipFilter,
  rarityFilter,
  sortBy,
  onSearchChange,
  onOwnershipChange,
  onRarityChange,
  onSortChange
}) {
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic', 'secret', 'og', 'brainrot_god']
  
  // Count active filters
  const activeFilters = [
    ownershipFilter !== 'all',
    rarityFilter !== 'all',
    searchTerm.length > 0
  ].filter(Boolean).length

  // Clear all filters
  const clearFilters = () => {
    onSearchChange('')
    onOwnershipChange('all')
    onRarityChange('all')
    onSortChange('name')
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      {/* Header with Clear */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="font-medium">Filters & Search</span>
          {activeFilters > 0 && (
            <span className="text-xs px-2 py-0.5 bg-blue-600 rounded">
              {activeFilters} active
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by brainrot name..."
            className="input-primary pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Quick Filters:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOwnershipChange('not-owned')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              ownershipFilter === 'not-owned'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            ❌ Missing
          </button>
          <button
            onClick={() => onOwnershipChange('duplicates')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              ownershipFilter === 'duplicates'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            📋 Duplicates
          </button>
          <button
            onClick={() => onOwnershipChange('unique')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              ownershipFilter === 'unique'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            ✓ Unique
          </button>
          <button
            onClick={() => onOwnershipChange('owned')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              ownershipFilter === 'owned'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            📊 All Owned
          </button>
        </div>
      </div>

      {/* Detailed Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Filter size={14} />
            Ownership Status
          </label>
          <select
            value={ownershipFilter}
            onChange={(e) => onOwnershipChange(e.target.value)}
            className="input-primary"
          >
            <option value="all">All Brainrots ({rarities.length === 'all' ? '439' : ''})</option>
            <option value="owned">Owned Somewhere</option>
            <option value="not-owned">Not Owned Anywhere</option>
            <option value="duplicates">Duplicates (2+)</option>
            <option value="unique">Unique (1 only)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Filter size={14} />
            Rarity
          </label>
          <select
            value={rarityFilter}
            onChange={(e) => onRarityChange(e.target.value)}
            className="input-primary"
          >
            {rarities.map(r => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Rarities' : r.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <SortAsc size={14} />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="input-primary"
          >
            <option value="name">Name (A-Z)</option>
            <option value="rarity">Rarity (Low-High)</option>
            <option value="ownership">Ownership (Most First)</option>
            <option value="income">Total Income (Highest First)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

