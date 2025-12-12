import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Edit2, Trash2, Package } from 'lucide-react'
import { MUTATIONS, TRAITS } from '../../utils/incomeCalculator'
import EditAccountModal from './EditAccountModal'

/**
 * Account Card - Shows account summary on dashboard
 * Displays rebirth level, slot usage, and quick stats with brainrot thumbnails
 */
export default function AccountCard({ account, collectionSize, collection, brainrots, onView, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Get brainrot details for thumbnails WITH collection entry data
  const brainrotsMap = new Map(brainrots?.map(br => [br.id, br]) || [])
  const collectionBrainrots = (collection || [])
    .map(entry => ({
      brainrot: brainrotsMap.get(entry.brainrotId),
      entry: entry // Keep entry for mutation/traits
    }))
    .filter(item => item.brainrot) // Show ALL brainrots

  // Droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: `account-${account.id}`,
    data: {
      type: 'account',
      accountId: account.id
    }
  })

  // TODO: Import calculateSlots and calculateFreeSpace from utils/rebirthCalculator.js
  // For now, mock values
  const totalSlots = 10 + (account.rebirthLevel > 1 ? account.rebirthLevel - 1 : 0)
  const freeSlots = Math.max(0, totalSlots - collectionSize)
  const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0
  
  // Determine status
  let status = 'LOW'
  let statusColor = 'bg-status-low'
  if (percentFull >= 100) {
    status = 'FULL'
    statusColor = 'bg-status-full'
  } else if (percentFull >= 90) {
    status = 'CRITICAL'
    statusColor = 'bg-status-critical'
  } else if (percentFull >= 75) {
    status = 'HIGH'
    statusColor = 'bg-status-high'
  } else if (percentFull >= 50) {
    status = 'MEDIUM'
    statusColor = 'bg-status-medium'
  }

  // TODO: Calculate total income from collection
  const totalIncome = 0

  return (
    <div 
      ref={setNodeRef}
      className={`bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all relative ${
        isOver ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-900/20' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drop Indicator */}
      {isOver && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-500 border-dashed flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-blue-600 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Package size={20} />
            <span className="font-bold">Drop to Copy Here</span>
          </div>
        </div>
      )}
      {/* Quick Actions */}
      {showActions && (
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowEditModal(true);
            }}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Edit account"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation();
              if (confirm(`Delete "${account.name}"? This cannot be undone.`)) {
                onDelete();
              }
            }}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Delete account"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Account Name */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1">{account.name}</h3>
        {account.notes && (
          <p className="text-sm text-gray-400">{account.notes}</p>
        )}
      </div>

      {/* Rebirth Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">
          Rebirth {account.rebirthLevel} | {totalSlots} total slots
        </div>
        {/* Fuse Checkbox */}
        <label 
          className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-600/30 px-2 py-1 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={account.isFusing || false}
            onChange={(e) => {
              e.stopPropagation();
              onEdit({ isFusing: e.target.checked });
            }}
            className="w-3.5 h-3.5 rounded cursor-pointer"
          />
          <span className="text-xs text-gray-300">🔥 Fusing</span>
        </label>
      </div>

      {/* Slot Usage Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${statusColor}`}
              style={{ width: `${Math.min(100, percentFull)}%` }}
            />
          </div>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${statusColor}`}>
            {status}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {collectionSize}/{totalSlots} used ({freeSlots} free)
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm mb-4">
        <div>
          <div className="text-gray-400">Brainrots</div>
          <div className="font-bold">{collectionSize}</div>
        </div>
        <div>
          <div className="text-gray-400">Income/s</div>
          <div className="font-bold">${totalIncome.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-400">Completion</div>
          <div className="font-bold">{((collectionSize / 439) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Brainrot Thumbnails Preview - All Brainrots */}
      {collectionBrainrots.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">Brainrots ({collectionBrainrots.length}):</div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {collectionBrainrots.map((item, idx) => {
              const { brainrot, entry } = item;
              const mutation = entry.mutation || 'none';
              const mutationData = MUTATIONS[mutation];
              const borderColor = mutation !== 'none' ? mutationData?.color || '#666' : '#475569'; // slate-600
              const traits = entry.traits || [];
              
              return (
                <div 
                  key={idx}
                  className="relative w-11 h-11 bg-slate-900 rounded overflow-hidden group"
                  style={{ 
                    border: `2px solid ${borderColor}`,
                    boxShadow: mutation !== 'none' ? `0 0 8px ${borderColor}40` : 'none'
                  }}
                  title={`${brainrot.name}${mutation !== 'none' ? ` (${mutationData?.name})` : ''}${traits.length > 0 ? ` +${traits.length} mods` : ''}`}
                >
                  {/* Image */}
                  {brainrot.image ? (
                    <img 
                      src={`/${brainrot.image}`} 
                      alt={brainrot.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      ?
                    </div>
                  )}
                  
                  {/* Modifier Icons (bottom) */}
                  {traits.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-0.5 py-0.5 px-0.5">
                      {traits.slice(0, 4).map((traitKey, tIdx) => (
                        <span 
                          key={tIdx}
                          className="text-[8px]"
                          title={TRAITS[traitKey]?.name}
                        >
                          {TRAITS[traitKey]?.icon}
                        </span>
                      ))}
                      {traits.length > 4 && (
                        <span className="text-[7px] text-white font-bold">+{traits.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Button */}
      <button
        onClick={onView}
        className="w-full btn-primary"
      >
        View Account →
      </button>

      {/* Edit Account Modal */}
      {showEditModal && (
        <EditAccountModal
          account={account}
          onSave={(updates) => {
            onEdit(updates);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

