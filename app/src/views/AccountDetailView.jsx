import { useState } from 'react'
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
  brainrots,
  collection,
  onBack,
  onUpdateCollection,
  onUpdateAccount
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [ownershipFilter, setOwnershipFilter] = useState('all')
  const [floorFilter, setFloorFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Create set of owned brainrot IDs for quick lookup
  const ownedIds = new Set(collection.map(c => c.brainrotId))

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
    
    // Ownership filter
    if (ownershipFilter === 'owned' && !ownedIds.has(br.id)) {
      return false
    }
    if (ownershipFilter === 'not-owned' && ownedIds.has(br.id)) {
      return false
    }
    
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

  // Toggle ownership
  const toggleOwned = (brainrotId) => {
    if (ownedIds.has(brainrotId)) {
      // Remove
      onUpdateCollection(collection.filter(c => c.brainrotId !== brainrotId))
    } else {
      // Add
      onUpdateCollection([...collection, {
        brainrotId,
        mutation: null,
        traits: [],
        floor: 1,
        calculatedIncome: 0
      }])
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

      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredBrainrots.length} of {brainrots.length} brainrots
      </div>

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

