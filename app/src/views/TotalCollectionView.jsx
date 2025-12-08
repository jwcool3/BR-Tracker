import { useState } from 'react'
import CollectionHeader from '../components/collection/CollectionHeader'
import CollectionFilters from '../components/collection/CollectionFilters'
import TotalBrainrotCard from '../components/collection/TotalBrainrotCard'

/**
 * Total Collection View - See all brainrots across all accounts
 * Shows cross-account ownership, duplicates, and gaps
 */
export default function TotalCollectionView({
  accounts,
  collections,
  brainrots,
  onBack,
  onViewAccount
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [ownershipFilter, setOwnershipFilter] = useState('all')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Calculate ownership for each brainrot
  const brainrotsWithOwnership = brainrots.map(br => {
    const ownedBy = accounts.filter(acc =>
      collections[acc.id]?.some(c => c.brainrotId === br.id)
    )
    return {
      ...br,
      ownedBy,
      ownedByCount: ownedBy.length,
      totalIncome: ownedBy.reduce((sum, acc) => {
        const entry = collections[acc.id]?.find(c => c.brainrotId === br.id)
        return sum + (entry?.calculatedIncome || 0)
      }, 0)
    }
  })

  // Apply filters
  let filtered = brainrotsWithOwnership.filter(br => {
    // Search
    if (searchTerm && !br.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Rarity
    if (rarityFilter !== 'all' && br.rarity !== rarityFilter) {
      return false
    }
    
    // Ownership
    if (ownershipFilter === 'owned' && br.ownedByCount === 0) return false
    if (ownershipFilter === 'not-owned' && br.ownedByCount > 0) return false
    if (ownershipFilter === 'duplicates' && br.ownedByCount < 2) return false
    if (ownershipFilter === 'unique' && br.ownedByCount !== 1) return false
    
    return true
  })

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'rarity') return (a.rarity || '').localeCompare(b.rarity || '')
    if (sortBy === 'ownership') return b.ownedByCount - a.ownedByCount
    if (sortBy === 'income') return b.totalIncome - a.totalIncome
    return 0
  })

  // Calculate stats
  const totalOwned = brainrotsWithOwnership.filter(br => br.ownedByCount > 0).length
  const duplicates = brainrotsWithOwnership.filter(br => br.ownedByCount >= 2).length
  const totalIncome = brainrotsWithOwnership.reduce((sum, br) => sum + br.totalIncome, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <CollectionHeader 
        totalOwned={totalOwned}
        totalBrainrots={brainrots.length}
        duplicates={duplicates}
        totalIncome={totalIncome}
        onBack={onBack}
      />

      <CollectionFilters
        searchTerm={searchTerm}
        ownershipFilter={ownershipFilter}
        rarityFilter={rarityFilter}
        sortBy={sortBy}
        onSearchChange={setSearchTerm}
        onOwnershipChange={setOwnershipFilter}
        onRarityChange={setRarityFilter}
        onSortChange={setSortBy}
      />

      <div className="mb-4 text-sm text-gray-400">
        Showing {filtered.length} of {brainrots.length} brainrots
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(brainrot => (
          <TotalBrainrotCard
            key={brainrot.id}
            brainrot={brainrot}
            accounts={accounts}
            collections={collections}
            onViewAccount={onViewAccount}
          />
        ))}
      </div>
    </div>
  )
}

