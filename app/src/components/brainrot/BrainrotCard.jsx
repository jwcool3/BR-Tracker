import { useState, useEffect } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { MUTATIONS, TRAITS, quickCalculateIncome } from '../../utils/incomeCalculator'

/**
 * Brainrot Card - Individual brainrot card in detail view
 * Shows ownership status and allows editing
 */
export default function BrainrotCard({
  brainrot,
  isOwned,
  collectionEntry,
  account,
  onToggleOwned,
  onUpdate
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showTraits, setShowTraits] = useState(false)

  // Calculate income when mutation or traits change
  useEffect(() => {
    if (isOwned && collectionEntry && brainrot.income_per_second) {
      const calculatedIncome = quickCalculateIncome(
        brainrot.income_per_second,
        collectionEntry.mutation || 'none',
        collectionEntry.traits || []
      )
      if (calculatedIncome !== collectionEntry.calculatedIncome) {
        onUpdate({ calculatedIncome })
      }
    }
  }, [isOwned, collectionEntry?.mutation, collectionEntry?.traits, brainrot.income_per_second])

  // Rarity colors
  const rarityColors = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
    mythic: 'border-pink-400',
    secret: 'border-orange-500',
    og: 'border-red-500',
    brainrot_god: 'border-cyan-400'
  }
  const rarityColor = rarityColors[brainrot.rarity] || 'border-gray-600'

  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 border-2 transition-all ${
        isOwned ? rarityColor : 'border-slate-700 opacity-60'
      }`}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm line-clamp-2 flex-1">{brainrot.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleOwned()
          }}
          className={`ml-2 p-1 rounded-full transition-colors ${
            isOwned
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {isOwned ? <Check size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Rarity */}
      <div className={`text-xs mb-2 ${rarityColors[brainrot.rarity]?.replace('border-', 'text-') || 'text-gray-400'}`}>
        {brainrot.rarity?.replace('_', ' ') || 'unknown'}
      </div>

      {/* Base Stats */}
      <div className="text-xs text-gray-400 space-y-0.5">
        {brainrot.cost && (
          <div>Cost: ${brainrot.cost.toLocaleString()}</div>
        )}
        {brainrot.income_per_second && (
          <div>Base: ${brainrot.income_per_second.toLocaleString()}/s</div>
        )}
      </div>

      {/* Owned Details */}
      {isOwned && collectionEntry && showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Floor Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Floor (Security)</label>
            <select
              value={collectionEntry.floor || 1}
              onChange={(e) => onUpdate({ floor: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
            >
              {[1, 2, 3, 4, 5].map(f => (
                <option key={f} value={f}>Floor {f} {f >= 3 ? '🔒' : ''}</option>
              ))}
            </select>
          </div>

          {/* Mutation Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mutation</label>
            <select
              value={collectionEntry.mutation || 'none'}
              onChange={(e) => onUpdate({ mutation: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
            >
              {Object.entries(MUTATIONS).map(([key, mut]) => (
                <option key={key} value={key}>
                  {mut.name} {mut.multiplier > 1 ? `(${mut.multiplier}x)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Traits Selection */}
          <div>
            <button
              onClick={() => setShowTraits(!showTraits)}
              className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-white transition-colors"
            >
              <span>Traits ({(collectionEntry.traits || []).length}/3)</span>
              {showTraits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showTraits && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1 p-2 bg-slate-900 rounded">
                {Object.entries(TRAITS).map(([key, trait]) => {
                  const isSelected = (collectionEntry.traits || []).includes(key)
                  const currentTraits = collectionEntry.traits || []
                  const canSelect = currentTraits.length < 3 || isSelected

                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 text-xs p-1 rounded cursor-pointer transition-colors ${
                        canSelect ? 'hover:bg-slate-700' : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!canSelect}
                        onChange={(e) => {
                          const newTraits = e.target.checked
                            ? [...currentTraits, key]
                            : currentTraits.filter(t => t !== key)
                          onUpdate({ traits: newTraits })
                        }}
                        className="w-3 h-3"
                      />
                      <span>{trait.icon}</span>
                      <span className="flex-1">{trait.name}</span>
                      <span className={`text-xs ${trait.multiplier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trait.multiplier > 0 ? '+' : ''}{trait.multiplier}x
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Calculated Income */}
          {brainrot.income_per_second && (
            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-gray-400 mb-1">Calculated Income</div>
              <div className="text-sm font-bold text-green-400">
                ${(collectionEntry.calculatedIncome || brainrot.income_per_second).toLocaleString()}/s
              </div>
              {(collectionEntry.mutation && collectionEntry.mutation !== 'none') || (collectionEntry.traits && collectionEntry.traits.length > 0) ? (
                <div className="text-xs text-gray-500 mt-1">
                  Base: ${brainrot.income_per_second.toLocaleString()}/s
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

