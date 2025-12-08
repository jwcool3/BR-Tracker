import { Search } from 'lucide-react'

/**
 * Filter Bar - Search and filter controls for brainrot list
 */
export default function FilterBar({
  searchTerm,
  rarityFilter,
  ownershipFilter,
  floorFilter,
  sortBy,
  onSearchChange,
  onRarityChange,
  onOwnershipChange,
  onFloorChange,
  onSortChange
}) {
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic', 'secret', 'og', 'brainrot_god']
  const floors = ['all', '1', '2', '3', '4', '5']

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
            placeholder="Search brainrots..."
            className="input-primary pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-medium mb-1">Ownership</label>
          <select
            value={ownershipFilter}
            onChange={(e) => onOwnershipChange(e.target.value)}
            className="input-primary"
          >
            <option value="all">All</option>
            <option value="owned">Owned</option>
            <option value="not-owned">Not Owned</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Floor</label>
          <select
            value={floorFilter}
            onChange={(e) => onFloorChange(e.target.value)}
            className="input-primary"
          >
            {floors.map(f => (
              <option key={f} value={f}>
                {f === 'all' ? 'All Floors' : `Floor ${f}`}
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
            <option value="income">Income</option>
            <option value="cost">Cost</option>
          </select>
        </div>
      </div>
    </div>
  )
}

