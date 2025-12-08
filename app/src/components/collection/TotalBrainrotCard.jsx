import { Users, TrendingUp, DollarSign } from 'lucide-react'

/**
 * Total Brainrot Card - Shows brainrot ownership across all accounts
 */
export default function TotalBrainrotCard({ brainrot, accounts, collections, onViewAccount }) {
  const { ownedBy, ownedByCount, totalIncome } = brainrot

  // Rarity colors
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
  
  // Border colors
  const rarityBorderColors = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
    mythic: 'border-pink-400',
    secret: 'border-orange-500',
    og: 'border-red-500',
    brainrot_god: 'border-cyan-400'
  }
  const rarityBorderColor = rarityBorderColors[brainrot.rarity] || 'border-gray-600'
  
  // Status badge based on ownership
  let statusBadge = null
  if (ownedByCount === 0) {
    statusBadge = <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded">Missing</span>
  } else if (ownedByCount >= 3) {
    statusBadge = <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded">Duplicate x{ownedByCount}</span>
  } else if (ownedByCount === 2) {
    statusBadge = <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded">Duplicate</span>
  } else {
    statusBadge = <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded">Unique</span>
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-all border-2 ${
      ownedByCount > 0 ? rarityBorderColor : 'border-slate-700'
    }`}>
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm line-clamp-2 flex-1 pr-2">{brainrot.name}</h3>
        {statusBadge}
      </div>

      {/* Rarity */}
      <div className={`text-xs mb-3 ${rarityColor} flex items-center gap-2`}>
        <span>{brainrot.rarity?.replace('_', ' ') || 'unknown'}</span>
        {ownedByCount > 0 && (
          <span className="flex items-center gap-1 text-gray-400">
            <Users size={12} />
            {ownedByCount}
          </span>
        )}
      </div>

      {/* Base Stats */}
      <div className="text-xs text-gray-400 mb-3 space-y-1">
        {brainrot.cost && (
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            Cost: ${brainrot.cost >= 1000000 ? `${(brainrot.cost / 1000000).toFixed(1)}M` : brainrot.cost.toLocaleString()}
          </div>
        )}
        {brainrot.income_per_second && (
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            Base: ${brainrot.income_per_second >= 1000000 ? `${(brainrot.income_per_second / 1000000).toFixed(1)}M` : brainrot.income_per_second.toLocaleString()}/s
          </div>
        )}
      </div>

      {/* Ownership Details */}
      <div className="border-t border-slate-700 pt-3">
        {ownedByCount === 0 ? (
          <div className="text-center py-2">
            <div className="text-sm text-red-400 mb-1">❌ Not Owned</div>
            <div className="text-xs text-gray-500">Not on any account</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Owned by {ownedByCount} account{ownedByCount > 1 ? 's' : ''}</span>
              {totalIncome > 0 && (
                <span className="text-green-400 font-bold">
                  ${totalIncome >= 1000000000 ? `${(totalIncome / 1000000000).toFixed(1)}B` : totalIncome >= 1000000 ? `${(totalIncome / 1000000).toFixed(1)}M` : totalIncome.toLocaleString()}/s
                </span>
              )}
            </div>
            
            {ownedBy.map(account => {
              const entry = collections[account.id]?.find(c => c.brainrotId === brainrot.id)
              return (
                <button
                  key={account.id}
                  onClick={() => onViewAccount(account.id)}
                  className="w-full text-left bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 text-xs transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-blue-400 transition-colors">
                        {account.name}
                      </div>
                      {entry && (
                        <div className="text-gray-400 mt-0.5">
                          {entry.mutation && entry.mutation !== 'none' && (
                            <span className="text-purple-400 mr-2">
                              {entry.mutation}
                            </span>
                          )}
                          {entry.traits && entry.traits.length > 0 && (
                            <span className="text-cyan-400">
                              +{entry.traits.length} trait{entry.traits.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {entry?.calculatedIncome > 0 && (
                      <div className="text-green-400 font-bold ml-2">
                        ${entry.calculatedIncome >= 1000000000 ? `${(entry.calculatedIncome / 1000000000).toFixed(1)}B` : entry.calculatedIncome >= 1000000 ? `${(entry.calculatedIncome / 1000000).toFixed(1)}M` : entry.calculatedIncome.toLocaleString()}/s
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

