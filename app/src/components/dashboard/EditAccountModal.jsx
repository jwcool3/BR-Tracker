import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

/**
 * Edit Account Modal - Edit existing account settings
 */
export default function EditAccountModal({ account, onSave, onClose }) {
  const [name, setName] = useState(account.name)
  const [notes, setNotes] = useState(account.notes || '')
  const [rebirthLevel, setRebirthLevel] = useState(account.rebirthLevel || 0)
  const [tags, setTags] = useState(account.tags?.join(', ') || '')
  const [favorite, setFavorite] = useState(account.favorite || false)
  const [color, setColor] = useState(account.color || '#3b82f6')
  const [isFusing, setIsFusing] = useState(account.isFusing || false)

  // Update state if account changes
  useEffect(() => {
    setName(account.name)
    setNotes(account.notes || '')
    setRebirthLevel(account.rebirthLevel || 0)
    setTags(account.tags?.join(', ') || '')
    setFavorite(account.favorite || false)
    setColor(account.color || '#3b82f6')
    setIsFusing(account.isFusing || false)
  }, [account])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSave({
      name: name.trim(),
      notes: notes.trim(),
      rebirthLevel: parseInt(rebirthLevel) || 0,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()) : [],
      favorite,
      color,
      isFusing
    })
    
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-primary"
              placeholder="e.g., Main Account"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rebirth Level</label>
              <input
                type="number"
                value={rebirthLevel}
                onChange={(e) => setRebirthLevel(e.target.value)}
                className="input-primary"
                min="0"
                max="17"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                />
                <div 
                  className="flex-1 h-10 rounded-lg border border-slate-700"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-primary"
              placeholder="e.g., storage, grinding, trading"
            />
            <div className="text-xs text-gray-400 mt-1">
              Use tags to organize accounts (e.g., "main", "storage", "grind")
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-primary"
              rows="2"
              placeholder="e.g., Alt Storage, Grind Account"
            />
          </div>

          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">⭐ Mark as favorite</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFusing}
                onChange={(e) => setIsFusing(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">🔥 Currently fusing</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Save size={16} />
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

