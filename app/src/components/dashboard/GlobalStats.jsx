/**
 * Global Stats - Shows aggregate stats across all accounts
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
  
  // TODO: Calculate total income across all accounts
  const totalIncome = 0

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">📊 Global Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
      </div>
      
      {totalIncome > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-gray-400 text-sm">Total Income Across All Accounts</div>
          <div className="text-2xl font-bold text-green-400">${totalIncome.toLocaleString()}/s</div>
        </div>
      )}
    </div>
  )
}

