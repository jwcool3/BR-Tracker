import { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useBulkSelection } from '../../contexts/BulkSelectionContext'
import { Check, X, ChevronDown, ChevronUp, Search, Plus, Minus, GripVertical, ArrowRight } from 'lucide-react'
import { MUTATIONS, TRAITS, quickCalculateIncome } from '../../utils/incomeCalculator'

/**
 * Brainrot Card - Individual brainrot card in detail view
 * Shows ownership status and allows editing
 */
export default function BrainrotCard({
  brainrot,
  isOwned,
  collectionEntry,
  collectionIndex = -1, // Index in collection array
  copyNumber = 0, // Which copy (1, 2, 3, etc.)
  totalCopies = 0, // Total number of copies owned
  account,
  accounts = [], // All accounts for transfer
  onToggleOwned,
  onUpdate,
  onTransfer // Transfer to another account
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showModifiers, setShowModifiers] = useState(false)
  const [modifierSearch, setModifierSearch] = useState('')
  const [addQuantity, setAddQuantity] = useState(1) // How many to add
  const [showAllMutations, setShowAllMutations] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferSearch, setTransferSearch] = useState('')
  
  // Bulk selection
  const { bulkMode, selectedBrainrots, toggleSelection, isSelected } = useBulkSelection()
  const selected = isSelected(brainrot.id)
  
  // Draggable setup (only for owned brainrots)
  const dragData = bulkMode && selectedBrainrots.size > 0 && selected
    ? {
        type: 'brainrot',
        accountId: account.id,
        brainrotIds: Array.from(selectedBrainrots),
        brainrotNames: Array.from(selectedBrainrots).slice(0, 3).join(', ')
      }
    : {
        type: 'brainrot',
        accountId: account.id,
        brainrotId: brainrot.id,
        brainrotName: brainrot.name
      }
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `brainrot-${account.id}-${brainrot.id}`,
    data: dragData,
    disabled: !isOwned || showDetails
  })
  
  // Most common modifiers to show by default
  const commonModifiers = ['zombie', 'firework', 'fire', 'paint', 'nyan', 'galactic', 'meowl', 'strawberry']
  
  // Filter modifiers based on search
  const filteredModifiers = modifierSearch 
    ? Object.entries(TRAITS).filter(([key, trait]) => 
        trait.name.toLowerCase().includes(modifierSearch.toLowerCase())
      )
    : Object.entries(TRAITS).filter(([key]) => commonModifiers.includes(key))

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
      ref={setNodeRef}
      className={`relative group bg-slate-800 rounded-lg p-4 border-2 transition-all duration-200 ${
        isOwned 
          ? `${rarityColor} hover:shadow-lg hover:scale-[1.02] hover:border-opacity-100 ${
              isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-pointer'
            } ${selected ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}` 
          : 'border-slate-700 opacity-50 hover:opacity-70 cursor-pointer'
      }`}
      onClick={(e) => {
        if (bulkMode && isOwned) {
          e.stopPropagation()
          toggleSelection(brainrot.id)
        } else if (!bulkMode) {
          setShowDetails(!showDetails)
        }
      }}
    >
      {/* Bulk Selection Checkbox */}
      {bulkMode && isOwned && (
        <div className="absolute top-2 left-2 z-20">
          <div 
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              selected 
                ? 'bg-purple-600 border-purple-600' 
                : 'bg-slate-700 border-slate-500'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              toggleSelection(brainrot.id)
            }}
          >
            {selected && <Check size={16} className="text-white" />}
          </div>
        </div>
      )}

      {/* Drag Handle */}
      {isOwned && !bulkMode && (
        <div
          {...listeners}
          {...attributes}
          className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-700 hover:bg-slate-600 rounded p-1">
            <GripVertical size={16} className="text-gray-400" />
          </div>
        </div>
      )}

      {/* Drag Handle (Bulk Mode) */}
      {isOwned && bulkMode && selected && (
        <div
          {...listeners}
          {...attributes}
          className="absolute top-2 left-10 z-20 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-purple-700 hover:bg-purple-600 rounded p-1">
            <GripVertical size={16} className="text-white" />
          </div>
        </div>
      )}
      {/* Thumbnail Image with Visual Indicators */}
      {brainrot.image && (
        <div className="mb-3 -mt-2 -mx-2 relative">
          <img 
            src={`/${brainrot.image}`}
            alt={brainrot.name}
            className="w-full h-32 object-contain rounded-t-lg bg-slate-900/30 p-2 transition-all"
            style={isOwned && collectionEntry?.mutation && collectionEntry.mutation !== 'none' 
              ? { 
                  boxShadow: `0 0 0 2px ${MUTATIONS[collectionEntry.mutation]?.color || '#888'}` 
                }
              : {}}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          
          {/* Mutation Badge on Image */}
          {isOwned && collectionEntry?.mutation && collectionEntry.mutation !== 'none' && (
            <div 
              className="absolute top-1 left-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: `${MUTATIONS[collectionEntry.mutation]?.color}40`,
                border: `1px solid ${MUTATIONS[collectionEntry.mutation]?.color}`,
                color: MUTATIONS[collectionEntry.mutation]?.color
              }}
            >
              {MUTATIONS[collectionEntry.mutation]?.name}
            </div>
          )}
          
          {/* Modifier Icons on Image (Bottom) */}
          {isOwned && collectionEntry?.traits && collectionEntry.traits.length > 0 && (
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 backdrop-blur-sm bg-black/60 rounded px-1 py-0.5">
              {collectionEntry.traits.slice(0, 6).map(traitKey => (
                <span 
                  key={traitKey}
                  className="text-sm"
                  title={`${TRAITS[traitKey]?.name} (+${TRAITS[traitKey]?.multiplier}x)`}
                >
                  {TRAITS[traitKey]?.icon}
                </span>
              ))}
              {collectionEntry.traits.length > 6 && (
                <span className="text-[10px] text-white font-bold">+{collectionEntry.traits.length - 6}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Owned Badge with Copy Number */}
      {isOwned && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded-full text-xs font-bold">
            <Check size={12} />
            <span>
              {totalCopies > 1 ? `Copy ${copyNumber} of ${totalCopies}` : 'Owned'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm line-clamp-2 flex-1 pr-16">{brainrot.name}</h3>
      </div>

      {/* Rarity Badge */}
      <div className="mb-3">
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${rarityColors[brainrot.rarity]?.replace('border-', 'bg-') || 'bg-gray-700'} bg-opacity-20`}>
          {brainrot.rarity?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      {/* Main Income Display (for owned brainrots) */}
      {isOwned && brainrot.income_per_second && collectionEntry && (
        <div className="mb-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-3 border border-green-500/20">
          <div className="text-[10px] text-gray-400 mb-1">Current Income</div>
          <div className="text-2xl font-bold text-green-400">
            ${((collectionEntry.calculatedIncome || brainrot.income_per_second) >= 1000000000 
              ? `${((collectionEntry.calculatedIncome || brainrot.income_per_second) / 1000000000).toFixed(2)}B` 
              : (collectionEntry.calculatedIncome || brainrot.income_per_second) >= 1000000
                ? `${((collectionEntry.calculatedIncome || brainrot.income_per_second) / 1000000).toFixed(2)}M`
                : (collectionEntry.calculatedIncome || brainrot.income_per_second).toLocaleString())}/s
          </div>
          {(collectionEntry.mutation && collectionEntry.mutation !== 'none') || (collectionEntry.traits && collectionEntry.traits.length > 0) ? (
            <div className="text-[9px] text-gray-500 mt-1">
              Base: ${brainrot.income_per_second >= 1000000 ? `${(brainrot.income_per_second / 1000000).toFixed(1)}M` : brainrot.income_per_second.toLocaleString()}/s
            </div>
          ) : null}
        </div>
      )}

      {/* Add/Remove/Transfer Buttons */}
      <div className="space-y-2">
        {/* Quantity Selector + Add/Remove */}
        <div className="flex items-center gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center bg-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAddQuantity(Math.max(1, addQuantity - 1))
              }}
              className="px-2 py-2 hover:bg-slate-600 transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="px-3 py-2 font-bold text-sm border-x border-slate-600 min-w-[40px] text-center">
              {addQuantity}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAddQuantity(addQuantity + 1)
              }}
              className="px-2 py-2 hover:bg-slate-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {/* Add Button (always shows - adds more even if owned) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleOwned(addQuantity) // Add quantity copies
              setAddQuantity(1) // Reset after adding
              setShowDetails(true)
            }}
            className="flex-1 py-2 rounded-lg font-medium transition-all text-sm bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white border border-green-600/50 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {isOwned ? `Add ${addQuantity} More` : `Add to Account`}
          </button>
        </div>

        {/* Remove/Transfer Row (only for owned) */}
        {isOwned && (
          <div className="flex items-center gap-2">
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleOwned(-1) // Remove one copy (negative quantity)
              }}
              className="flex-1 py-2 rounded-lg font-medium transition-all text-sm bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/50 flex items-center justify-center gap-2"
            >
              <Minus size={16} />
              {totalCopies > 1 ? `Remove Copy ${copyNumber}` : 'Remove'}
            </button>

            {/* Transfer Button */}
            {onTransfer && accounts.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTransferModal(true)
                }}
                className="flex-1 py-2 rounded-lg font-medium transition-all text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/50 flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} />
                Transfer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Owned Details - Compact Horizontal Layout */}
      {isOwned && collectionEntry && showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          
          {/* Top Row: Base Stats + Floor */}
          <div className="grid grid-cols-2 gap-3">
            {/* Base Stats */}
            <div className="bg-slate-900/30 rounded-lg p-2.5 border border-slate-700/50 space-y-1">
              <div className="text-[10px] text-gray-400">Base Stats</div>
              {brainrot.cost && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500">Cost:</span>
                  <span className="text-[10px] font-medium text-gray-300">${brainrot.cost >= 1000000 ? `${(brainrot.cost / 1000000).toFixed(1)}M` : brainrot.cost.toLocaleString()}</span>
                </div>
              )}
              {brainrot.income_per_second && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500">Base:</span>
                  <span className="text-[10px] font-medium text-blue-400">${brainrot.income_per_second >= 1000000 ? `${(brainrot.income_per_second / 1000000).toFixed(1)}M` : brainrot.income_per_second.toLocaleString()}/s</span>
                </div>
              )}
            </div>
            
            {/* Floor Selection */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-1">Floor</label>
              <select
                value={collectionEntry.floor || 1}
                onChange={(e) => onUpdate({ floor: parseInt(e.target.value) })}
                className="w-full px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map(f => (
                  <option key={f} value={f}>Floor {f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mutation Selection - Compact Horizontal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-medium text-gray-400">
                Mutation {collectionEntry.mutation && collectionEntry.mutation !== 'none' && (
                  <span className="text-purple-400 font-bold">
                    (×{MUTATIONS[collectionEntry.mutation]?.multiplier || 1})
                  </span>
                )}
              </label>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllMutations(!showAllMutations); }}
                className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showAllMutations ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showAllMutations ? 'Less' : 'More'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {/* Top-tier mutations (always visible) */}
              {['none', 'gold', 'diamond', 'rainbow', 'radioactive'].map(key => {
                const mut = MUTATIONS[key]
                if (!mut) return null
                const isSelected = collectionEntry.mutation === key
                return (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdate({ mutation: key })
                    }}
                    className={`relative px-1.5 py-1.5 rounded text-[10px] font-bold transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-offset-slate-800 scale-105'
                        : 'hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${mut.color || '#666'}30`,
                      border: `1.5px solid ${mut.color || '#666'}`,
                      color: mut.color || '#fff',
                      ringColor: mut.color
                    }}
                  >
                    <div>{mut.name}</div>
                    <div className="text-[8px] opacity-70">{mut.multiplier}x</div>
                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-800"></div>
                    )}
                  </button>
                )
              })}
              
              {/* Other mutations (collapsible) */}
              {showAllMutations && Object.entries(MUTATIONS)
                .filter(([key]) => !['none', 'gold', 'diamond', 'rainbow', 'radioactive'].includes(key))
                .map(([key, mut]) => {
                  const isSelected = collectionEntry.mutation === key
                  return (
                    <button
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate({ mutation: key })
                      }}
                      className={`relative px-1.5 py-1.5 rounded text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-offset-slate-800 scale-105'
                          : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: `${mut.color || '#666'}30`,
                        border: `1.5px solid ${mut.color || '#666'}`,
                        color: mut.color || '#fff',
                        ringColor: mut.color
                      }}
                    >
                      <div>{mut.name}</div>
                      <div className="text-[8px] opacity-70">{mut.multiplier}x</div>
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-800"></div>
                      )}
                    </button>
                  )
                })}
            </div>
            {!showAllMutations && (
              <div className="text-[9px] text-gray-500 mt-1">
                Showing popular • Click "More" to see all
              </div>
            )}
          </div>

          {/* Modifiers Section - Compact with Search */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-medium text-gray-400">
                Modifiers {collectionEntry.traits && collectionEntry.traits.length > 0 && (
                  <span className="text-green-400 font-bold">
                    (+{collectionEntry.traits.reduce((sum, t) => sum + (TRAITS[t]?.multiplier || 0), 0).toFixed(1)}x)
                  </span>
                )}
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModifiers(!showModifiers)
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showModifiers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {(collectionEntry.traits || []).length} Selected
              </button>
            </div>
            
            {/* Modifier Pills */}
            {showModifiers && (
              <div className="bg-slate-900/30 rounded-lg p-2 space-y-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search modifiers..."
                    value={modifierSearch}
                    onChange={(e) => {
                      e.stopPropagation()
                      setModifierSearch(e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                {/* Modifier Grid */}
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {filteredModifiers.map(([key, trait]) => {
                    const isSelected = (collectionEntry.traits || []).includes(key)
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation()
                          const newTraits = isSelected
                            ? (collectionEntry.traits || []).filter(t => t !== key)
                            : [...(collectionEntry.traits || []), key]
                          onUpdate({ traits: newTraits })
                        }}
                        className={`relative px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-1 ring-blue-400'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="text-xs mr-1">{trait.icon}</span>
                        <span>{trait.name}</span>
                        <span className={`ml-1 ${isSelected ? 'text-green-200' : 'text-green-400'}`}>
                          {trait.multiplier > 0 ? '+' : ''}{trait.multiplier}x
                        </span>
                        {isSelected && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-800"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
                
                {modifierSearch && filteredModifiers.length === 0 && (
                  <div className="text-center py-2 text-xs text-gray-500">
                    No modifiers found
                  </div>
                )}
                
                {!modifierSearch && (
                  <div className="text-[9px] text-gray-500 text-center">
                    Showing common modifiers • Search to see all
                  </div>
                )}
              </div>
            )}
            
            {/* Selected Modifiers Summary (when collapsed) */}
            {!showModifiers && collectionEntry.traits && collectionEntry.traits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {collectionEntry.traits.slice(0, 5).map(traitKey => (
                  <span 
                    key={traitKey}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded text-[9px] border border-blue-500/30"
                  >
                    <span className="text-xs">{TRAITS[traitKey]?.icon}</span>
                    <span>{TRAITS[traitKey]?.name}</span>
                  </span>
                ))}
                {collectionEntry.traits.length > 5 && (
                  <span className="text-[9px] text-gray-400 px-1.5 py-0.5">+{collectionEntry.traits.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTransferModal(false)}
        >
          <div 
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Transfer Brainrot</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                {brainrot.image && (
                  <img 
                    src={`/${brainrot.image}`} 
                    alt={brainrot.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div>
                  <div className="font-bold text-white">{brainrot.name}</div>
                  <div className="text-xs text-gray-400">
                    {collectionEntry?.mutation && collectionEntry.mutation !== 'none' && (
                      <span>{MUTATIONS[collectionEntry.mutation]?.name} • </span>
                    )}
                    {collectionEntry?.traits?.length > 0 && (
                      <span>+{collectionEntry.traits.length} modifiers</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Transfer to account:</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={transferSearch}
                  onChange={(e) => setTransferSearch(e.target.value)}
                  placeholder="Search accounts..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {accounts
                  .filter(acc => acc.id !== account.id) // Exclude current account
                  .filter(acc => !transferSearch || acc.name.toLowerCase().includes(transferSearch.toLowerCase()))
                  .map(targetAccount => (
                    <button
                      key={targetAccount.id}
                      onClick={() => {
                        if (onTransfer && collectionEntry) {
                          onTransfer(collectionEntry.id, account.id, targetAccount.id)
                          setShowTransferModal(false)
                        }
                      }}
                      className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-medium text-white">{targetAccount.name}</div>
                        <div className="text-xs text-gray-400">
                          Rebirth {targetAccount.rebirthLevel}
                          {targetAccount.tags && targetAccount.tags.length > 0 && (
                            <span> • {targetAccount.tags[0]}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))}
                {accounts.filter(acc => acc.id !== account.id && (!transferSearch || acc.name.toLowerCase().includes(transferSearch.toLowerCase()))).length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    {transferSearch ? 'No accounts found' : 'No other accounts available'}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowTransferModal(false)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

