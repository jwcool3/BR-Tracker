import { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, Table, ArrowUpDown } from 'lucide-react'
import AccountCard from '../components/dashboard/AccountCard'
import GroupedDashboard from '../components/dashboard/GroupedDashboard'
import TableView from '../components/dashboard/TableView'
import GlobalStats from '../components/dashboard/GlobalStats'
import AddAccountButton from '../components/dashboard/AddAccountButton'
import { calculateSlots } from '../utils/rebirthCalculator'

/**
 * Dashboard View - Overview of all accounts
 * Supports three view modes: cards, grouped, table
 */
export default function DashboardView({ 
  accounts, 
  collections,
  brainrots = [],
  onViewAccount, 
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount
}) {
  const [viewMode, setViewMode] = useState('grouped') // 'cards', 'grouped', 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name') // 'name', 'storage', 'rebirth', 'brainrots'

  // Filter and sort accounts
  const filteredAccounts = useMemo(() => {
    let filtered = accounts.filter(account => {
      // Search filter
      if (searchTerm && !account.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'favorites' && !account.favorite) return false
        if (statusFilter === 'hidden' && !account.hidden) return false
      }
      
      return true
    })

    // Sort accounts
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'storage': {
          const aSlots = calculateSlots(a.rebirthLevel)
          const bSlots = calculateSlots(b.rebirthLevel)
          const aSize = collections[a.id]?.length || 0
          const bSize = collections[b.id]?.length || 0
          const aPercent = aSlots > 0 ? (aSize / aSlots) * 100 : 0
          const bPercent = bSlots > 0 ? (bSize / bSlots) * 100 : 0
          return bPercent - aPercent // Highest first
        }
        case 'rebirth':
          return b.rebirthLevel - a.rebirthLevel // Highest first
        case 'brainrots': {
          const aSize = collections[a.id]?.length || 0
          const bSize = collections[b.id]?.length || 0
          return bSize - aSize // Most first
        }
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [accounts, searchTerm, statusFilter, sortBy, collections])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Accounts</h1>
          <p className="text-gray-400">
            {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        <AddAccountButton onAdd={onAddAccount} />
      </div>

      {/* Search and View Controls */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts..."
            className="input-primary pl-10"
          />
        </div>

        {/* View Mode and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              All ({accounts.length})
            </button>
            <button
              onClick={() => setStatusFilter('favorites')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                statusFilter === 'favorites'
                  ? 'bg-blue-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              ⭐ Favorites ({accounts.filter(a => a.favorite).length})
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 text-white rounded px-3 py-1 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort: Name</option>
                <option value="storage">Sort: Storage %</option>
                <option value="rebirth">Sort: Rebirth Level</option>
                <option value="brainrots">Sort: # Brainrots</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex gap-2 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600'
                    : 'hover:bg-slate-600'
                }`}
                title="Grouped View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-600'
                    : 'hover:bg-slate-600'
                }`}
                title="Card View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600'
                    : 'hover:bg-slate-600'
                }`}
                title="Table View"
              >
                <Table size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <GlobalStats accounts={filteredAccounts} collections={collections} />

      {/* Content based on view mode */}
      <div className="mt-6">
        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
            <div className="text-7xl mb-6 animate-bounce">🎮</div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome to Brainrot Tracker!</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Get started by creating your first account or loading demo data to explore
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={onAddAccount}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <span className="text-2xl">+</span>
                Create Account
              </button>
            </div>

            <div className="mt-12 text-sm text-gray-500">
              <p>💡 Tip: Use the "Data" button above to load demo data or import existing data</p>
            </div>
          </div>
        )}

        {/* Normal Views */}
        {accounts.length > 0 && (
          <>
            {viewMode === 'grouped' && (
              <GroupedDashboard
                accounts={filteredAccounts}
                collections={collections}
                brainrots={brainrots}
                onViewAccount={onViewAccount}
                onUpdateAccount={onUpdateAccount}
                sortBy={sortBy}
              />
            )}

            {viewMode === 'cards' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAccounts.map(account => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    collectionSize={collections[account.id]?.length || 0}
                    collection={collections[account.id] || []}
                    brainrots={brainrots}
                    onView={() => onViewAccount(account.id)}
                    onEdit={(updates) => onUpdateAccount(account.id, updates)}
                    onDelete={() => onDeleteAccount(account.id)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <TableView
                accounts={filteredAccounts}
                collections={collections}
                onViewAccount={onViewAccount}
                onUpdateAccount={onUpdateAccount}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

