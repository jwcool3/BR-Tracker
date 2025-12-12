import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import CompactAccountRow from './CompactAccountRow'
import { calculateSlots } from '../../utils/rebirthCalculator'

/**
 * Grouped Dashboard - Organizes accounts into collapsible sections
 * Sections: Favorites, All Accounts
 */
export default function GroupedDashboard({ 
  accounts, 
  collections,
  brainrots = [],
  onViewAccount,
  onUpdateAccount
}) {
  const [expandedSections, setExpandedSections] = useState({
    fusing: true,
    favorites: true,
    all: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Group accounts by status
  const groupedAccounts = accounts.reduce((groups, account) => {
    const collectionSize = collections[account.id]?.length || 0
    const totalSlots = calculateSlots(account.rebirthLevel)
    const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0

    // Skip hidden accounts
    if (account.hidden) return groups

    // Add to fusing
    if (account.isFusing) {
      groups.fusing.push({ account, collectionSize, percentFull })
    }

    // Add to favorites
    if (account.favorite) {
      groups.favorites.push({ account, collectionSize, percentFull })
    }

    // Add to all accounts
    groups.all.push({ account, collectionSize, percentFull })

    return groups
  }, {
    fusing: [],
    favorites: [],
    all: []
  })

  const Section = ({ title, count, emoji, items, sectionKey, defaultExpanded = true }) => {
    const isExpanded = expandedSections[sectionKey]
    
    if (items.length === 0) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <span className="font-bold">
              {emoji} {title} ({count})
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {items.map(({ account, collectionSize }) => (
              <CompactAccountRow
                key={account.id}
                account={account}
                collectionSize={collectionSize}
                collection={collections[account.id] || []}
                brainrots={brainrots}
                onView={() => onViewAccount(account.id)}
                onToggleFavorite={() => onUpdateAccount(account.id, { favorite: !account.favorite })}
                onEdit={(updates) => onUpdateAccount(account.id, updates)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fusing Accounts */}
      {groupedAccounts.fusing.length > 0 && (
        <Section
          title="Fusing"
          count={groupedAccounts.fusing.length}
          emoji="🔥"
          items={groupedAccounts.fusing}
          sectionKey="fusing"
        />
      )}

      {/* Favorites */}
      {groupedAccounts.favorites.length > 0 && (
        <Section
          title="Favorites"
          count={groupedAccounts.favorites.length}
          emoji="⭐"
          items={groupedAccounts.favorites}
          sectionKey="favorites"
        />
      )}

      {/* All Accounts */}
      <Section
        title="All Accounts"
        count={groupedAccounts.all.length}
        emoji="📋"
        items={groupedAccounts.all}
        sectionKey="all"
        defaultExpanded={true}
      />

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No accounts yet</p>
          <p className="text-sm">Click "Add Account" to get started</p>
        </div>
      )}
    </div>
  )
}

