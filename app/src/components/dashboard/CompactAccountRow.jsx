import { Star, Eye, EyeOff } from 'lucide-react'
import { calculateSlots } from '../../utils/rebirthCalculator'

/**
 * Compact Account Row - For grouped/table views
 * Shows account info in a single row
 */
export default function CompactAccountRow({ account, collectionSize, onView, onToggleFavorite, onToggleHidden }) {
  const totalSlots = calculateSlots(account.rebirthLevel)
  const freeSlots = Math.max(0, totalSlots - collectionSize)
  const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0
  
  // Determine status
  let status = 'LOW'
  let statusColor = 'text-status-low'
  let statusBg = 'bg-status-low'
  if (percentFull >= 100) {
    status = 'FULL'
    statusColor = 'text-status-full'
    statusBg = 'bg-status-full'
  } else if (percentFull >= 90) {
    status = 'CRITICAL'
    statusColor = 'text-status-critical'
    statusBg = 'bg-status-critical'
  } else if (percentFull >= 75) {
    status = 'HIGH'
    statusColor = 'text-status-high'
    statusBg = 'bg-status-high'
  } else if (percentFull >= 50) {
    status = 'MEDIUM'
    statusColor = 'text-status-medium'
    statusBg = 'bg-status-medium'
  }

  // TODO: Calculate total income from collection
  const totalIncome = 0

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
      {/* Favorite Star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite?.()
        }}
        className={`p-1 rounded transition-colors ${
          account.favorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
        }`}
        title={account.favorite ? 'Unfavorite' : 'Favorite'}
      >
        <Star size={16} fill={account.favorite ? 'currentColor' : 'none'} />
      </button>

      {/* Account Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold truncate">{account.name}</h3>
          {account.tags && account.tags.length > 0 && (
            <div className="flex gap-1">
              {account.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-700 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {account.notes && (
          <p className="text-xs text-gray-400 truncate">{account.notes}</p>
        )}
      </div>

      {/* Rebirth Level */}
      <div className="text-sm text-gray-400 hidden sm:block">
        RB {account.rebirthLevel}
      </div>

      {/* Slots */}
      <div className="hidden md:block">
        <div className="text-sm font-medium">
          {collectionSize}/{totalSlots}
        </div>
        <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${statusBg}`}
            style={{ width: `${Math.min(100, percentFull)}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className={`text-xs font-bold px-2 py-1 rounded ${statusBg}`}>
        {status}
      </div>

      {/* Income (hidden on mobile) */}
      {totalIncome > 0 && (
        <div className="text-sm text-gray-400 hidden lg:block">
          ${totalIncome.toLocaleString()}/s
        </div>
      )}

      {/* View Button */}
      <button
        onClick={onView}
        className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
      >
        View →
      </button>
    </div>
  )
}

