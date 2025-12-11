import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useBulkSelection } from '../contexts/BulkSelectionContext'
import { CheckSquare, Square, Copy, Trash2 } from 'lucide-react'
import DetailHeader from '../components/detail/DetailHeader'
import AccountControls from '../components/detail/AccountControls'
import FilterBar from '../components/detail/FilterBar'
import BrainrotGrid from '../components/detail/BrainrotGrid'

/**
 * Account Detail View - Manage one account's brainrots
 * Shows all 439 brainrots with ownership tracking
 */
export default function AccountDetailView({
  account,
  brainrots = [],
  collection,
  onBack,
  onUpdateCollection,
  onUpdateAccount
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [ownershipFilter, setOwnershipFilter] = useState('owned') // Default to showing only owned
  const [floorFilter, setFloorFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showHighTierOnly, setShowHighTierOnly] = useState(true) // Default to high-tier when adding
  const [showOnlyWithThumbnails, setShowOnlyWithThumbnails] = useState(false) // Show all by default (thumbnails re-enabled)
  
  // Bulk selection
  const {
    bulkMode,
    selectedBrainrots,
    toggleBulkMode,
    selectAll,
    clearSelection
  } = useBulkSelection()
  
  // Show loading state if brainrots aren't loaded yet
  if (!brainrots || brainrots.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-xl font-bold mb-2">Loading Brainrots...</div>
          <div className="text-gray-400">Please wait while we load the brainrot data</div>
        </div>
      </div>
    )
  }

  // Create map of owned brainrot IDs to quantities
  const ownedCounts = collection.reduce((acc, c) => {
    acc[c.brainrotId] = (acc[c.brainrotId] || 0) + 1
    return acc
  }, {})

  // High-tier rarities (best brainrots)
  const highTierRarities = ['brainrot_god', 'og', 'secret', 'mythic']
  
  // Filter and sort brainrots
  let filteredBrainrots = brainrots.filter(br => {
    // Search filter
    if (searchTerm && !br.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Rarity filter
    if (rarityFilter !== 'all' && br.rarity !== rarityFilter) {
      return false
    }
    
    // High-tier filter (when adding brainrots)
    if (ownershipFilter === 'not-owned' && showHighTierOnly) {
      if (!highTierRarities.includes(br.rarity)) {
        return false
      }
    }
    
    // Thumbnail filter (when adding brainrots)
    if (ownershipFilter === 'not-owned' && showOnlyWithThumbnails) {
      if (!br.image || br.image.trim() === '') {
        return false
      }
    }
    
    // Ownership filter
    if (ownershipFilter === 'owned' && !ownedCounts[br.id]) {
      return false
    }
    // Note: Removed the 'not-owned' filter to allow adding duplicates
    
    // Floor filter
    if (floorFilter !== 'all') {
      const entry = collection.find(c => c.brainrotId === br.id)
      if (!entry || entry.floor !== parseInt(floorFilter)) {
        return false
      }
    }
    
    return true
  })

  // Sort
  filteredBrainrots.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'rarity') return (a.rarity || '').localeCompare(b.rarity || '')
    if (sortBy === 'income') return (b.income_per_second || 0) - (a.income_per_second || 0)
    if (sortBy === 'cost') return (b.cost || 0) - (a.cost || 0)
    return 0
  })

  // Toggle ownership (now handles quantities)
  const toggleOwned = (brainrotId, quantity = 1) => {
    if (ownedCounts[brainrotId]) {
      // Remove one copy (or all if only 1)
      const firstIndex = collection.findIndex(c => c.brainrotId === brainrotId)
      if (firstIndex !== -1) {
        const newCollection = [...collection]
        newCollection.splice(firstIndex, 1)
        onUpdateCollection(newCollection)
      }
    } else {
      // Add new copies
      const newEntries = Array(quantity).fill(null).map(() => ({
        brainrotId,
        mutation: null,
        traits: [],
        floor: 1,
        calculatedIncome: 0
      }))
      onUpdateCollection([...collection, ...newEntries])
    }
  }

  // Update brainrot in collection
  const updateBrainrot = (brainrotId, updates) => {
    onUpdateCollection(collection.map(c =>
      c.brainrotId === brainrotId ? { ...c, ...updates } : c
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DetailHeader account={account} onBack={onBack} onUpdateAccount={onUpdateAccount} />
      
      <AccountControls account={account} collection={collection} onUpdateAccount={onUpdateAccount} />
      
      <FilterBar
        searchTerm={searchTerm}
        rarityFilter={rarityFilter}
        ownershipFilter={ownershipFilter}
        floorFilter={floorFilter}
        sortBy={sortBy}
        onSearchChange={setSearchTerm}
        onRarityChange={setRarityFilter}
        onOwnershipChange={setOwnershipFilter}
        onFloorChange={setFloorFilter}
        onSortChange={setSortBy}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          Showing {filteredBrainrots.length} of {brainrots.length} brainrots
          {ownershipFilter === 'owned' && filteredBrainrots.length > 0 && (
            <span className="ml-2 text-green-400">• Owned by this account</span>
          )}
          {ownershipFilter === 'owned' && filteredBrainrots.length === 0 && (
            <span className="ml-2 text-yellow-400">• No brainrots owned yet</span>
          )}
          {ownershipFilter === 'not-owned' && (
            <>
              {showHighTierOnly && (
                <span className="ml-2 text-purple-400">• High-tier (Mythic+)</span>
              )}
              {showOnlyWithThumbnails && (
                <span className="ml-2 text-cyan-400">• With images</span>
              )}
              {!showHighTierOnly && !showOnlyWithThumbnails && (
                <span className="ml-2 text-blue-400">• All brainrots</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {ownershipFilter === 'owned' && (
            <>
              <button
                onClick={toggleBulkMode}
                className={`text-sm px-3 py-1 rounded transition-colors flex items-center gap-2 ${
                  bulkMode 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {bulkMode ? <CheckSquare size={16} /> : <Square size={16} />}
                {bulkMode ? 'Exit Bulk Mode' : 'Bulk Mode'}
              </button>
              {!bulkMode && (
                <button
                  onClick={() => setOwnershipFilter('not-owned')}
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  + Add Brainrots
                </button>
              )}
            </>
          )}
          {ownershipFilter === 'not-owned' && (
            <>
              <button
                onClick={() => setShowHighTierOnly(!showHighTierOnly)}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  showHighTierOnly
                    ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/50'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {showHighTierOnly ? '⭐ High-Tier' : '📋 All Tiers'}
              </button>
              <button
                onClick={() => setShowOnlyWithThumbnails(!showOnlyWithThumbnails)}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  showOnlyWithThumbnails
                    ? 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/50'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {showOnlyWithThumbnails ? '🖼️ With Images' : '📄 All'}
              </button>
              <button
                onClick={() => setOwnershipFilter('owned')}
                className="text-sm px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition-colors border border-green-500/50"
              >
                ✓ Show Owned
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {bulkMode && selectedBrainrots.size > 0 && (
        <div className="mb-4 bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-purple-400">
                {selectedBrainrots.size} selected
              </span>
              <button
                onClick={() => selectAll(filteredBrainrots.filter(br => ownedCounts[br.id]).map(br => br.id))}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Select All ({filteredBrainrots.filter(br => ownedCounts[br.id]).length})
              </button>
              <button
                onClick={clearSelection}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Copy size={14} />
                Drag selected to account to copy
              </div>
              <button
                onClick={() => {
                  // Delete selected brainrots
                  const newCollection = collection.filter(entry => !selectedBrainrots.has(entry.brainrotId))
                  onUpdateCollection(newCollection)
                  clearSelection()
                }}
                className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={14} />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <BrainrotGrid
        brainrots={filteredBrainrots}
        collection={collection}
        account={account}
        onToggleOwned={toggleOwned}
        onUpdateBrainrot={updateBrainrot}
      />
    </div>
  )
}

