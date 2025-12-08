/**
 * Account Controls - Shows slot usage and quick actions
 */
export default function AccountControls({ account, collection, onUpdateAccount }) {
  // TODO: Import calculateSlots from utils
  const totalSlots = 10 + (account.rebirthLevel > 1 ? account.rebirthLevel - 1 : 0)
  const usedSlots = collection.length
  const freeSlots = Math.max(0, totalSlots - usedSlots)
  const percentFull = totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0
  
  let statusColor = 'bg-status-low'
  if (percentFull >= 100) statusColor = 'bg-status-full'
  else if (percentFull >= 90) statusColor = 'bg-status-critical'
  else if (percentFull >= 75) statusColor = 'bg-status-high'
  else if (percentFull >= 50) statusColor = 'bg-status-medium'

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Slot Usage */}
        <div>
          <h3 className="text-lg font-bold mb-3">Slot Usage</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 bg-slate-700 h-6 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${statusColor}`}
                style={{ width: `${Math.min(100, percentFull)}%` }}
              />
            </div>
            <span className="text-sm font-bold">{percentFull.toFixed(0)}%</span>
          </div>
          <div className="text-sm text-gray-400">
            {usedSlots}/{totalSlots} slots used • {freeSlots} free
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h3 className="text-lg font-bold mb-3">Account Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-gray-400 text-xs">Owned</div>
              <div className="text-xl font-bold">{usedSlots}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Completion</div>
              <div className="text-xl font-bold">{((usedSlots / 439) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Income/s</div>
              <div className="text-xl font-bold">$0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

