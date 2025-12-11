import { Users, TrendingUp, DollarSign } from 'lucide-react'
import { MUTATIONS, TRAITS } from '../../utils/incomeCalculator'

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
    <div className={`relative group bg-slate-800 rounded-lg p-4 transition-all duration-200 border-2 ${
      ownedByCount > 0 
        ? `${rarityBorderColor} hover:shadow-xl hover:scale-[1.02]` 
        : 'border-slate-700 opacity-50'
    }`}>
      
      {/* Thumbnail Image with Visual Indicators */}
      {brainrot.image && (
        <div className="mb-3 -mt-2 -mx-2 relative">
          <img 
            src={`/${brainrot.image}`}
            alt={brainrot.name}
            className="w-full h-36 object-contain rounded-t-lg bg-slate-900/30 p-2"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          
          {/* Collect all unique mutations & modifiers from accounts that own this */}
          {ownedByCount > 0 && (() => {
            const uniqueMutations = new Set()
            const uniqueModifiers = new Set()
            
            ownedBy.forEach(account => {
              const entry = collections[account.id]?.find(c => c.brainrotId === brainrot.id)
              if (entry) {
                if (entry.mutation && entry.mutation !== 'none') {
                  uniqueMutations.add(entry.mutation)
                }
                if (entry.traits && entry.traits.length > 0) {
                  entry.traits.forEach(t => uniqueModifiers.add(t))
                }
              }
            })
            
            return (
              <>
                {/* Mutation Indicators (Top-Left) */}
                {uniqueMutations.size > 0 && (
                  <div className="absolute top-1 left-1 flex gap-1">
                    {Array.from(uniqueMutations).slice(0, 3).map(mutKey => MUTATIONS[mutKey] && (
                      <div 
                        key={mutKey}
                        className="w-6 h-6 rounded-full shadow-lg border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold"
                        style={{
                          backgroundColor: MUTATIONS[mutKey].color,
                          color: '#000'
                        }}
                        title={`${MUTATIONS[mutKey].name} (${MUTATIONS[mutKey].multiplier}x)`}
                      >
                        {MUTATIONS[mutKey].name.charAt(0)}
                      </div>
                    ))}
                    {uniqueMutations.size > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
                        +{uniqueMutations.size - 3}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Modifier Icons (Bottom) */}
                {uniqueModifiers.size > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 backdrop-blur-sm bg-black/70 rounded px-1 py-0.5">
                    {Array.from(uniqueModifiers).slice(0, 8).map(traitKey => TRAITS[traitKey] && (
                      <span 
                        key={traitKey}
                        className="text-sm"
                        title={`${TRAITS[traitKey].name} (+${TRAITS[traitKey].multiplier}x)`}
                      >
                        {TRAITS[traitKey].icon}
                      </span>
                    ))}
                    {uniqueModifiers.size > 8 && (
                      <span className="text-[10px] text-white font-bold">+{uniqueModifiers.size - 8}</span>
                    )}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Status Badge - Top Right */}
      <div className="absolute top-3 right-3">
        {statusBadge}
      </div>

      {/* Header */}
      <div className="mb-3 pr-20">
        <h3 className="font-bold text-sm line-clamp-2">{brainrot.name}</h3>
      </div>

      {/* Rarity Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded ${rarityColors[brainrot.rarity]?.replace('text-', 'bg-') || 'bg-gray-700'} bg-opacity-20`}>
          <span className={rarityColor}>{brainrot.rarity?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</span>
          {ownedByCount > 0 && (
            <>
              <span className="text-gray-500">•</span>
              <span className="flex items-center gap-1 text-gray-300">
                <Users size={12} />
                {ownedByCount}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Base Stats */}
      <div className="text-xs text-gray-300 space-y-1.5 mb-4">
        {brainrot.cost && (
          <div className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1">
            <div className="flex items-center gap-1 text-gray-400">
              <DollarSign size={12} />
              <span>Cost</span>
            </div>
            <span className="font-medium">${brainrot.cost >= 1000000 ? `${(brainrot.cost / 1000000).toFixed(1)}M` : brainrot.cost.toLocaleString()}</span>
          </div>
        )}
        {brainrot.income_per_second && (
          <div className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1">
            <div className="flex items-center gap-1 text-gray-400">
              <TrendingUp size={12} />
              <span>Base</span>
            </div>
            <span className="font-medium text-blue-400">${brainrot.income_per_second >= 1000000 ? `${(brainrot.income_per_second / 1000000).toFixed(1)}M` : brainrot.income_per_second.toLocaleString()}/s</span>
          </div>
        )}
      </div>

      {/* Ownership Details */}
      <div className="border-t border-slate-700/50 pt-3">
        {ownedByCount === 0 ? (
          <div className="text-center py-3 bg-red-900/10 rounded-lg border border-red-500/20">
            <div className="text-sm text-red-400 font-medium mb-1">❌ Not Owned</div>
            <div className="text-xs text-gray-500">Not on any account</div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header with Total Income */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/50 rounded">
              <span className="text-xs text-gray-400 font-medium">
                On {ownedByCount} account{ownedByCount > 1 ? 's' : ''}
              </span>
              {totalIncome > 0 && (
                <span className="text-xs text-green-400 font-bold">
                  Total: ${totalIncome >= 1000000000 ? `${(totalIncome / 1000000000).toFixed(2)}B` : totalIncome >= 1000000 ? `${(totalIncome / 1000000).toFixed(2)}M` : totalIncome.toLocaleString()}/s
                </span>
              )}
            </div>
            
            {/* Account List */}
            {ownedBy.map((account, index) => {
              const entry = collections[account.id]?.find(c => c.brainrotId === brainrot.id)
              return (
                <button
                  key={account.id}
                  onClick={() => onViewAccount(account.id)}
                  className="w-full text-left bg-gradient-to-r from-slate-700/50 to-slate-700/30 hover:from-slate-600 hover:to-slate-600/50 rounded-lg px-3 py-2.5 transition-all group border border-slate-600/30 hover:border-blue-500/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <span className="truncate">{account.name}</span>
                        <span className="text-gray-500 text-xs">→</span>
                      </div>
                      {entry && (entry.mutation !== 'none' || (entry.traits && entry.traits.length > 0)) && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {entry.mutation && entry.mutation !== 'none' && MUTATIONS[entry.mutation] && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold shadow-sm"
                              style={{
                                backgroundColor: `${MUTATIONS[entry.mutation].color}20`,
                                border: `1px solid ${MUTATIONS[entry.mutation].color}60`,
                                color: MUTATIONS[entry.mutation].color
                              }}
                            >
                              {MUTATIONS[entry.mutation].name} ({MUTATIONS[entry.mutation].multiplier}x)
                            </span>
                          )}
                          {entry.traits && entry.traits.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {entry.traits.slice(0, 3).map(traitKey => TRAITS[traitKey] && (
                                <span 
                                  key={traitKey}
                                  className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded text-[10px] font-medium border border-blue-500/30"
                                  title={`${TRAITS[traitKey].name} (+${TRAITS[traitKey].multiplier}x)`}
                                >
                                  {TRAITS[traitKey].icon}
                                </span>
                              ))}
                              {entry.traits.length > 3 && (
                                <span className="text-[10px] text-gray-400">+{entry.traits.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {entry?.calculatedIncome > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">
                          ${entry.calculatedIncome >= 1000000000 
                            ? `${(entry.calculatedIncome / 1000000000).toFixed(2)}B` 
                            : entry.calculatedIncome >= 1000000 
                              ? `${(entry.calculatedIncome / 1000000).toFixed(2)}M` 
                              : entry.calculatedIncome.toLocaleString()}/s
                        </div>
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

