import { calculateSlots } from '../../utils/rebirthCalculator'

/**
 * Global Stats - Shows aggregate stats across all accounts
 * Includes status breakdown and attention alerts
 */
export default function GlobalStats({ accounts, collections }) {
  const totalBrainrots = Object.values(collections).reduce((sum, coll) => sum + coll.length, 0)
  const totalAccounts = accounts.length
  const avgPerAccount = totalAccounts > 0 ? (totalBrainrots / totalAccounts).toFixed(1) : 0
  
  // Calculate unique brainrots (no duplicates)
  const uniqueBrainrotIds = new Set()
  Object.values(collections).forEach(coll => {
    coll.forEach(entry => uniqueBrainrotIds.add(entry.brainrotId))
  })
  const uniqueCount = uniqueBrainrotIds.size
  
  // Calculate fusing accounts
  const fusingCount = accounts.filter(acc => acc.isFusing).length
  
  // Calculate status breakdown
  const statusBreakdown = accounts.reduce((acc, account) => {
    const collectionSize = collections[account.id]?.length || 0
    const totalSlots = calculateSlots(account.rebirthLevel)
    const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0

    if (percentFull >= 100) acc.full++
    else if (percentFull >= 90) acc.critical++
    else if (percentFull >= 75) acc.high++
    else if (percentFull >= 50) acc.medium++
    else acc.low++

    return acc
  }, { full: 0, critical: 0, high: 0, medium: 0, low: 0 })

  const needsAttention = statusBreakdown.full + statusBreakdown.critical + statusBreakdown.high
  
  // TODO: Calculate total income across all accounts
  const totalIncome = 0

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">📊 Global Stats</h2>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div>
          <div className="text-gray-400 text-sm mb-1">Total Accounts</div>
          <div className="text-3xl font-bold">{totalAccounts}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Total Brainrots</div>
          <div className="text-3xl font-bold">{totalBrainrots}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Unique Owned</div>
          <div className="text-3xl font-bold">{uniqueCount}<span className="text-sm text-gray-400">/439</span></div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Avg Per Account</div>
          <div className="text-3xl font-bold">{avgPerAccount}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">🔥 Fusing</div>
          <div className="text-3xl font-bold text-orange-400">
            {fusingCount}<span className="text-sm text-gray-400">/{totalAccounts}</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {totalAccounts > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Status Breakdown</div>
            {needsAttention > 0 && (
              <div className="text-sm text-red-400 font-bold">
                🚨 {needsAttention} need attention
              </div>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-status-full rounded p-2 text-center">
              <div className="text-xs text-gray-300 mb-1">FULL</div>
              <div className="text-xl font-bold">{statusBreakdown.full}</div>
            </div>
            <div className="bg-status-critical rounded p-2 text-center">
              <div className="text-xs text-gray-300 mb-1">CRITICAL</div>
              <div className="text-xl font-bold">{statusBreakdown.critical}</div>
            </div>
            <div className="bg-status-high rounded p-2 text-center">
              <div className="text-xs text-gray-300 mb-1">HIGH</div>
              <div className="text-xl font-bold">{statusBreakdown.high}</div>
            </div>
            <div className="bg-status-medium rounded p-2 text-center">
              <div className="text-xs text-gray-300 mb-1">MEDIUM</div>
              <div className="text-xl font-bold">{statusBreakdown.medium}</div>
            </div>
            <div className="bg-status-low rounded p-2 text-center">
              <div className="text-xs text-gray-300 mb-1">LOW</div>
              <div className="text-xl font-bold">{statusBreakdown.low}</div>
            </div>
          </div>
        </div>
      )}
      
      {totalIncome > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-gray-400 text-sm">Total Income Across All Accounts</div>
          <div className="text-2xl font-bold text-green-400">${totalIncome.toLocaleString()}/s</div>
        </div>
      )}
    </div>
  )
}

