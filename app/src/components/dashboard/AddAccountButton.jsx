import { useState } from 'react'
import { Plus, X } from 'lucide-react'

/**
 * Add Account Button - Opens modal to create new account
 */
export default function AddAccountButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [rebirthLevel, setRebirthLevel] = useState(0)
  const [tags, setTags] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [color, setColor] = useState('#3b82f6')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onAdd({
      name: name.trim(),
      notes: notes.trim(),
      rebirthLevel: parseInt(rebirthLevel) || 0,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()) : [],
      favorite,
      color
    })
    
    // Reset form
    setName('')
    setNotes('')
    setRebirthLevel(0)
    setTags('')
    setFavorite(false)
    setColor('#3b82f6')
    setShowModal(false)
  }

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={20} />
        Add Account
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Account</h2>
          <button
            onClick={() => setShowModal(false)}
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
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
              />
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

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">⭐ Mark as favorite</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 btn-primary">
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
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

