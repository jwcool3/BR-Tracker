import { Search } from 'lucide-react'

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

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search all brainrots..."
            className="input-primary pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ownership</label>
          <select
            value={ownershipFilter}
            onChange={(e) => onOwnershipChange(e.target.value)}
            className="input-primary"
          >
            <option value="all">All Brainrots</option>
            <option value="owned">Owned Somewhere</option>
            <option value="not-owned">Not Owned Anywhere</option>
            <option value="duplicates">Duplicates (2+)</option>
            <option value="unique">Unique (1 only)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rarity</label>
          <select
            value={rarityFilter}
            onChange={(e) => onRarityChange(e.target.value)}
            className="input-primary"
          >
            {rarities.map(r => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Rarities' : r.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="input-primary"
          >
            <option value="name">Name</option>
            <option value="rarity">Rarity</option>
            <option value="ownership">Ownership Count</option>
            <option value="income">Total Income</option>
          </select>
        </div>
      </div>
    </div>
  )
}

