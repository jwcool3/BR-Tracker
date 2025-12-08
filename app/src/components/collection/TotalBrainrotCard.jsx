/**
 * Total Brainrot Card - Shows brainrot ownership across all accounts
 */
export default function TotalBrainrotCard({ brainrot, accounts, collections, onViewAccount }) {
  const { ownedBy, ownedByCount, totalIncome } = brainrot

  // Rarity color
  const rarityColors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-pink-400',
    secret: 'text-orange-500',
    og: 'text-red-500',
    brainrot_god: 'text-cyan-400'
  }
  const rarityColor = rarityColors[brainrot.rarity] || 'text-gray-400'

  return (
    <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors">
      {/* Brainrot Name */}
      <h3 className="font-bold mb-1 line-clamp-2">{brainrot.name}</h3>
      <div className={`text-xs mb-3 ${rarityColor}`}>
        {brainrot.rarity?.replace('_', ' ') || 'unknown'}
      </div>

      {/* Base Stats */}
      <div className="text-xs text-gray-400 mb-3 space-y-1">
        {brainrot.cost && (
          <div>Cost: ${brainrot.cost.toLocaleString()}</div>
        )}
        {brainrot.income_per_second && (
          <div>Base: ${brainrot.income_per_second.toLocaleString()}/s</div>
        )}
      </div>

      {/* Ownership */}
      <div className="border-t border-slate-700 pt-3">
        {ownedByCount === 0 ? (
          <div className="text-sm text-gray-500">Not owned</div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-400">
              Owned by {ownedByCount} account{ownedByCount > 1 ? 's' : ''}
            </div>
            {ownedBy.map(account => {
              const entry = collections[account.id]?.find(c => c.brainrotId === brainrot.id)
              return (
                <button
                  key={account.id}
                  onClick={() => onViewAccount(account.id)}
                  className="w-full text-left bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-xs transition-colors"
                >
                  <div className="font-medium">{account.name}</div>
                  {entry?.calculatedIncome > 0 && (
                    <div className="text-gray-400">${entry.calculatedIncome.toLocaleString()}/s</div>
                  )}
                </button>
              )
            })}
            {totalIncome > 0 && (
              <div className="text-xs text-green-400 font-bold pt-1">
                Total: ${totalIncome.toLocaleString()}/s
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

