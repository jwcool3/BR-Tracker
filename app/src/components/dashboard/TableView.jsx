import { useState } from 'react'
import { ArrowUp, ArrowDown, Star, Eye } from 'lucide-react'
import { calculateSlots } from '../../utils/rebirthCalculator'

/**
 * Table View - Compact table layout for many accounts
 * Sortable columns, bulk actions, pagination
 */
export default function TableView({ 
  accounts, 
  collections, 
  onViewAccount,
  onUpdateAccount
}) {
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Sort accounts
  const sortedAccounts = [...accounts].sort((a, b) => {
    const aSize = collections[a.id]?.length || 0
    const bSize = collections[b.id]?.length || 0
    const aSlots = calculateSlots(a.rebirthLevel)
    const bSlots = calculateSlots(b.rebirthLevel)
    const aPercent = aSlots > 0 ? (aSize / aSlots) * 100 : 0
    const bPercent = bSlots > 0 ? (bSize / bSlots) * 100 : 0

    let comparison = 0
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'rebirth') {
      comparison = a.rebirthLevel - b.rebirthLevel
    } else if (sortBy === 'slots') {
      comparison = aPercent - bPercent
    } else if (sortBy === 'brainrots') {
      comparison = aSize - bSize
    } else if (sortBy === 'status') {
      comparison = aPercent - bPercent
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Paginate
  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  const getStatusBadge = (percentFull) => {
    if (percentFull >= 100) return { label: 'FULL', color: 'bg-status-full' }
    if (percentFull >= 90) return { label: 'CRITICAL', color: 'bg-status-critical' }
    if (percentFull >= 75) return { label: 'HIGH', color: 'bg-status-high' }
    if (percentFull >= 50) return { label: 'MEDIUM', color: 'bg-status-medium' }
    return { label: 'LOW', color: 'bg-status-low' }
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="p-3 text-left">
                <div className="w-8"></div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Account Name
                  <SortIcon column="name" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('rebirth')}
              >
                <div className="flex items-center gap-2">
                  RB
                  <SortIcon column="rebirth" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('slots')}
              >
                <div className="flex items-center gap-2">
                  Slots
                  <SortIcon column="slots" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('brainrots')}
              >
                <div className="flex items-center gap-2">
                  Brainrots
                  <SortIcon column="brainrots" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAccounts.map(account => {
              const collectionSize = collections[account.id]?.length || 0
              const totalSlots = calculateSlots(account.rebirthLevel)
              const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0
              const status = getStatusBadge(percentFull)

              return (
                <tr 
                  key={account.id} 
                  className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  <td className="p-3">
                    <button
                      onClick={() => onUpdateAccount(account.id, { favorite: !account.favorite })}
                      className={`p-1 rounded ${
                        account.favorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                      }`}
                    >
                      <Star size={16} fill={account.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{account.name}</div>
                    {account.notes && (
                      <div className="text-xs text-gray-400">{account.notes}</div>
                    )}
                  </td>
                  <td className="p-3 text-gray-400">{account.rebirthLevel}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${status.color}`}
                          style={{ width: `${Math.min(100, percentFull)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {collectionSize}/{totalSlots}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400">{collectionSize}</td>
                  <td className="p-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onViewAccount(account.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAccounts.length)} of {sortedAccounts.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${
                  page === currentPage
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

