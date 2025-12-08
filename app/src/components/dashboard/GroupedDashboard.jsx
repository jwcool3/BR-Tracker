import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import CompactAccountRow from './CompactAccountRow'
import { calculateSlots } from '../../utils/rebirthCalculator'

/**
 * Grouped Dashboard - Organizes accounts into collapsible sections
 * Sections: FULL, CRITICAL, HIGH, Favorites, All Accounts
 */
export default function GroupedDashboard({ 
  accounts, 
  collections, 
  onViewAccount,
  onUpdateAccount
}) {
  const [expandedSections, setExpandedSections] = useState({
    full: true,
    critical: true,
    high: true,
    favorites: true,
    all: false
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

    // Add to favorites
    if (account.favorite) {
      groups.favorites.push({ account, collectionSize, percentFull })
    }

    // Add to status groups
    if (percentFull >= 100) {
      groups.full.push({ account, collectionSize, percentFull })
    } else if (percentFull >= 90) {
      groups.critical.push({ account, collectionSize, percentFull })
    } else if (percentFull >= 75) {
      groups.high.push({ account, collectionSize, percentFull })
    } else {
      groups.all.push({ account, collectionSize, percentFull })
    }

    return groups
  }, {
    full: [],
    critical: [],
    high: [],
    favorites: [],
    all: []
  })

  // Calculate needs attention count
  const needsAttentionCount = groupedAccounts.full.length + groupedAccounts.critical.length + groupedAccounts.high.length

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
                onView={() => onViewAccount(account.id)}
                onToggleFavorite={() => onUpdateAccount(account.id, { favorite: !account.favorite })}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Needs Attention Summary */}
      {needsAttentionCount > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">🚨 Needs Attention ({needsAttentionCount})</h2>
          <p className="text-sm text-gray-400">
            Accounts with FULL, CRITICAL, or HIGH slot usage
          </p>
        </div>
      )}

      {/* FULL Accounts */}
      <Section
        title="FULL Slots"
        count={groupedAccounts.full.length}
        emoji="🔴"
        items={groupedAccounts.full}
        sectionKey="full"
      />

      {/* CRITICAL Accounts */}
      <Section
        title="CRITICAL Slots (90-99%)"
        count={groupedAccounts.critical.length}
        emoji="🟠"
        items={groupedAccounts.critical}
        sectionKey="critical"
      />

      {/* HIGH Accounts */}
      <Section
        title="HIGH Slots (75-89%)"
        count={groupedAccounts.high.length}
        emoji="🟡"
        items={groupedAccounts.high}
        sectionKey="high"
      />

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

      {/* All Other Accounts */}
      <Section
        title="All Accounts"
        count={groupedAccounts.all.length}
        emoji="📋"
        items={groupedAccounts.all}
        sectionKey="all"
        defaultExpanded={false}
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

