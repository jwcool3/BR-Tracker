import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'

/**
 * Account Card - Shows account summary on dashboard
 * Displays rebirth level, slot usage, and quick stats
 */
export default function AccountCard({ account, collectionSize, onView, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)

  // TODO: Import calculateSlots and calculateFreeSpace from utils/rebirthCalculator.js
  // For now, mock values
  const totalSlots = 10 + (account.rebirthLevel > 1 ? account.rebirthLevel - 1 : 0)
  const freeSlots = Math.max(0, totalSlots - collectionSize)
  const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0
  
  // Determine status
  let status = 'LOW'
  let statusColor = 'bg-status-low'
  if (percentFull >= 100) {
    status = 'FULL'
    statusColor = 'bg-status-full'
  } else if (percentFull >= 90) {
    status = 'CRITICAL'
    statusColor = 'bg-status-critical'
  } else if (percentFull >= 75) {
    status = 'HIGH'
    statusColor = 'bg-status-high'
  } else if (percentFull >= 50) {
    status = 'MEDIUM'
    statusColor = 'bg-status-medium'
  }

  // TODO: Calculate total income from collection
  const totalIncome = 0

  return (
    <div 
      className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Quick Actions */}
      {showActions && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); /* TODO: onEdit */ }}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
            title="Edit account"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); /* TODO: onDelete */ }}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
            title="Delete account"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Account Name */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1">{account.name}</h3>
        {account.notes && (
          <p className="text-sm text-gray-400">{account.notes}</p>
        )}
      </div>

      {/* Rebirth Info */}
      <div className="text-sm text-gray-400 mb-3">
        Rebirth {account.rebirthLevel} | {totalSlots} total slots
      </div>

      {/* Slot Usage Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${statusColor}`}
              style={{ width: `${Math.min(100, percentFull)}%` }}
            />
          </div>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${statusColor}`}>
            {status}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {collectionSize}/{totalSlots} used ({freeSlots} free)
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm mb-4">
        <div>
          <div className="text-gray-400">Brainrots</div>
          <div className="font-bold">{collectionSize}</div>
        </div>
        <div>
          <div className="text-gray-400">Income/s</div>
          <div className="font-bold">${totalIncome.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-400">Completion</div>
          <div className="font-bold">{((collectionSize / 439) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* View Button */}
      <button
        onClick={onView}
        className="w-full btn-primary"
      >
        View Account →
      </button>
    </div>
  )
}

