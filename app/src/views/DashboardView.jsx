import { useState } from 'react'
import { Search, LayoutGrid, List, Table } from 'lucide-react'
import AccountCard from '../components/dashboard/AccountCard'
import GroupedDashboard from '../components/dashboard/GroupedDashboard'
import TableView from '../components/dashboard/TableView'
import GlobalStats from '../components/dashboard/GlobalStats'
import AddAccountButton from '../components/dashboard/AddAccountButton'

/**
 * Dashboard View - Overview of all accounts
 * Supports three view modes: cards, grouped, table
 */
export default function DashboardView({ 
  accounts, 
  collections, 
  onViewAccount, 
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount 
}) {
  const [viewMode, setViewMode] = useState('grouped') // 'cards', 'grouped', 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
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

      {/* Global Stats */}
      <GlobalStats accounts={filteredAccounts} collections={collections} />

      {/* Content based on view mode */}
      <div className="mt-6">
        {viewMode === 'grouped' && (
          <GroupedDashboard
            accounts={filteredAccounts}
            collections={collections}
            onViewAccount={onViewAccount}
            onUpdateAccount={onUpdateAccount}
          />
        )}

        {viewMode === 'cards' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                collectionSize={collections[account.id]?.length || 0}
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
      </div>
    </div>
  )
}

