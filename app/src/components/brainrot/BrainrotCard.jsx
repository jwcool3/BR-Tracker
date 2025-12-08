import { useState } from 'react'
import { Check, X } from 'lucide-react'

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
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Floor Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Floor</label>
            <select
              value={collectionEntry.floor || 1}
              onChange={(e) => onUpdate({ floor: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-xs"
            >
              {[1, 2, 3, 4, 5].map(f => (
                <option key={f} value={f}>Floor {f}</option>
              ))}
            </select>
          </div>

          {/* Mutation Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mutation</label>
            <select
              value={collectionEntry.mutation || 'none'}
              onChange={(e) => onUpdate({ mutation: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-xs"
            >
              <option value="none">None</option>
              <option value="gold">Gold (1.25x)</option>
              <option value="diamond">Diamond (1.5x)</option>
              <option value="rainbow">Rainbow (10x)</option>
            </select>
          </div>

          {/* Calculated Income */}
          {collectionEntry.calculatedIncome > 0 && (
            <div className="text-xs text-green-400 font-bold">
              Income: ${collectionEntry.calculatedIncome.toLocaleString()}/s
            </div>
          )}
        </div>
      )}
    </div>
  )
}

