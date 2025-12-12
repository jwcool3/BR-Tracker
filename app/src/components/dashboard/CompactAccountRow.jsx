import { useState } from 'react'
import { Star, Eye, EyeOff, Edit2 } from 'lucide-react'
import { calculateSlots } from '../../utils/rebirthCalculator'
import { MUTATIONS, TRAITS } from '../../utils/incomeCalculator'
import EditAccountModal from './EditAccountModal'

/**
 * Compact Account Row - For grouped/table views
 * Shows account info in a single row with brainrot thumbnails
 */
export default function CompactAccountRow({ account, collectionSize, collection, brainrots, onView, onToggleFavorite, onToggleHidden, onEdit }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const totalSlots = calculateSlots(account.rebirthLevel)
  const freeSlots = Math.max(0, totalSlots - collectionSize)
  const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0

  // Get brainrot details for thumbnails WITH collection entry data
  const brainrotsMap = new Map(brainrots?.map(br => [br.id, br]) || [])
  const collectionBrainrots = (collection || [])
    .map(entry => ({
      brainrot: brainrotsMap.get(entry.brainrotId),
      entry: entry // Keep entry for mutation/traits
    }))
    .filter(item => item.brainrot)
    .slice(0, 12) // Show first 12 in compact view (space limitation)
  
  const remainingCount = Math.max(0, collectionSize - 12)
  
  // Determine status
  let status = 'LOW'
  let statusColor = 'text-status-low'
  let statusBg = 'bg-status-low'
  if (percentFull >= 100) {
    status = 'FULL'
    statusColor = 'text-status-full'
    statusBg = 'bg-status-full'
  } else if (percentFull >= 90) {
    status = 'CRITICAL'
    statusColor = 'text-status-critical'
    statusBg = 'bg-status-critical'
  } else if (percentFull >= 75) {
    status = 'HIGH'
    statusColor = 'text-status-high'
    statusBg = 'bg-status-high'
  } else if (percentFull >= 50) {
    status = 'MEDIUM'
    statusColor = 'text-status-medium'
    statusBg = 'bg-status-medium'
  }

  // TODO: Calculate total income from collection
  const totalIncome = 0

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
      {/* Favorite Star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite?.()
        }}
        className={`p-1 rounded transition-colors ${
          account.favorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
        }`}
        title={account.favorite ? 'Unfavorite' : 'Favorite'}
      >
        <Star size={16} fill={account.favorite ? 'currentColor' : 'none'} />
      </button>

      {/* Account Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold truncate">{account.name}</h3>
          {account.tags && account.tags.length > 0 && (
            <div className="flex gap-1">
              {account.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-700 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {account.notes && (
          <p className="text-xs text-gray-400 truncate">{account.notes}</p>
        )}
      </div>

      {/* Brainrot Thumbnails */}
      {collectionBrainrots.length > 0 && (
        <div className="hidden lg:flex items-center gap-1">
          {collectionBrainrots.map((item, idx) => {
            const { brainrot, entry } = item;
            const mutation = entry.mutation || 'none';
            const mutationData = MUTATIONS[mutation];
            const borderColor = mutation !== 'none' ? mutationData?.color || '#666' : '#475569'; // slate-600
            const traits = entry.traits || [];
            
            return (
              <div 
                key={idx}
                className="relative w-8 h-8 bg-slate-900 rounded overflow-hidden flex-shrink-0"
                style={{ 
                  border: `2px solid ${borderColor}`,
                  boxShadow: mutation !== 'none' ? `0 0 6px ${borderColor}40` : 'none'
                }}
                title={`${brainrot.name}${mutation !== 'none' ? ` (${mutationData?.name})` : ''}${traits.length > 0 ? ` +${traits.length}` : ''}`}
              >
                {brainrot.image ? (
                  <img 
                    src={`/${brainrot.image}`} 
                    alt={brainrot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                    ?
                  </div>
                )}
                
                {/* Modifier Count Badge */}
                {traits.length > 0 && (
                  <div className="absolute bottom-0 right-0 bg-cyan-600 text-white text-[7px] font-bold px-0.5 rounded-tl">
                    {traits.length}
                  </div>
                )}
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="w-8 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-gray-300">+{remainingCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Rebirth Level */}
      <div className="text-sm text-gray-400 hidden sm:block">
        RB {account.rebirthLevel}
      </div>

      {/* Slots */}
      <div className="hidden md:block">
        <div className="text-sm font-medium">
          {collectionSize}/{totalSlots}
        </div>
        <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${statusBg}`}
            style={{ width: `${Math.min(100, percentFull)}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className={`text-xs font-bold px-2 py-1 rounded ${statusBg}`}>
        {status}
      </div>

      {/* Income (hidden on mobile) */}
      {totalIncome > 0 && (
        <div className="text-sm text-gray-400 hidden lg:block">
          ${totalIncome.toLocaleString()}/s
        </div>
      )}

      {/* Fuse Checkbox */}
      <label 
        className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-600/30 px-2 py-1.5 rounded transition-colors"
        onClick={(e) => e.stopPropagation()}
        title={account.isFusing ? "Fusing active" : "Not fusing"}
      >
        <input
          type="checkbox"
          checked={account.isFusing || false}
          onChange={(e) => {
            e.stopPropagation();
            onEdit?.({ isFusing: e.target.checked });
          }}
          className="w-3.5 h-3.5 rounded cursor-pointer"
        />
        <span className="text-xs text-gray-300 hidden md:inline">🔥 Fusing</span>
        <span className="text-xs md:hidden">🔥</span>
      </label>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(true);
          }}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          title="Edit account"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onView}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          View →
        </button>
      </div>

      {/* Edit Account Modal */}
      {showEditModal && (
        <EditAccountModal
          account={account}
          onSave={(updates) => {
            onEdit?.(updates);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

