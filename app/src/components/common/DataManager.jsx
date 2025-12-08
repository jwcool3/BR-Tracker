import { useState } from 'react'
import { Download, Upload, Trash2, X, AlertTriangle, Sparkles } from 'lucide-react'
import { generateDemoData, getDemoDataInfo } from '../../utils/demoData'

/**
 * Data Manager - Export/Import/Clear data
 * Allows users to backup and restore their data
 */
export default function DataManager({ accounts, collections, onImport, onClearAll }) {
  const [showModal, setShowModal] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Export data to JSON file
  const handleExport = () => {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      accounts,
      collections,
      metadata: {
        totalAccounts: accounts.length,
        totalBrainrots: Object.values(collections).reduce((sum, coll) => sum + coll.length, 0)
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brainrot-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowModal(false)
  }

  // Import data from JSON file
  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        // Validate data structure
        if (!data.accounts || !data.collections) {
          alert('Invalid backup file format!')
          return
        }

        // Ask for confirmation
        const totalAccounts = data.accounts.length
        const totalBrainrots = Object.values(data.collections).reduce((sum, coll) => sum + coll.length, 0)
        
        if (confirm(
          `Import ${totalAccounts} accounts with ${totalBrainrots} total brainrots?\n\n` +
          `This will REPLACE your current data.\n\n` +
          `Backup exported: ${new Date(data.exportDate).toLocaleString()}`
        )) {
          onImport(data)
          setShowModal(false)
          alert('✅ Data imported successfully!')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('❌ Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  // Clear all data
  const handleClearAll = () => {
    if (showClearConfirm) {
      onClearAll()
      setShowClearConfirm(false)
      setShowModal(false)
      alert('🗑️ All data cleared!')
    } else {
      setShowClearConfirm(true)
    }
  }

  // Load demo data
  const handleLoadDemo = () => {
    const demoInfo = getDemoDataInfo()
    
    if (confirm(
      `Load demo data with 20 accounts?\n\n` +
      `This includes:\n` +
      `• ${demoInfo.totalAccounts} accounts with different statuses\n` +
      `• ${demoInfo.totalBrainrots} total brainrots\n` +
      `• ${demoInfo.favorites} favorited accounts\n` +
      `• ${demoInfo.statusCounts.full} FULL, ${demoInfo.statusCounts.critical} CRITICAL, ${demoInfo.statusCounts.high} HIGH\n\n` +
      `This will REPLACE your current data.\n` +
      `(You can export first to backup!)`
    )) {
      const demoData = generateDemoData()
      onImport({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        accounts: demoData.accounts,
        collections: demoData.collections
      })
      setShowModal(false)
      alert('✨ Demo data loaded! Check out the different view modes!')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
        title="Manage Data"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Data</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">💾 Data Management</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setShowClearConfirm(false)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Current Data Info */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-2">Current Data</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• {accounts.length} accounts</div>
                <div>• {Object.values(collections).reduce((sum, coll) => sum + coll.length, 0)} total brainrots</div>
                <div className="text-xs text-gray-400 mt-2">
                  Data is auto-saved to browser localStorage
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Load Demo Data */}
              <button
                onClick={handleLoadDemo}
                className="w-full flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Sparkles size={20} />
                <div className="flex-1 text-left">
                  <div className="font-bold">✨ Load Demo Data</div>
                  <div className="text-xs opacity-90">20 accounts with placeholder data</div>
                </div>
              </button>

              {/* Export */}
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download size={20} />
                <div className="flex-1 text-left">
                  <div className="font-bold">Export Data</div>
                  <div className="text-xs opacity-90">Download backup as JSON file</div>
                </div>
              </button>

              {/* Import */}
              <label className="w-full flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer">
                <Upload size={20} />
                <div className="flex-1 text-left">
                  <div className="font-bold">Import Data</div>
                  <div className="text-xs opacity-90">Restore from backup file</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {/* Clear All */}
              <button
                onClick={handleClearAll}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
                  showClearConfirm
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-red-600/50 hover:bg-red-600'
                }`}
              >
                {showClearConfirm ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Trash2 size={20} />
                )}
                <div className="flex-1 text-left">
                  <div className="font-bold">
                    {showClearConfirm ? 'Click Again to Confirm' : 'Clear All Data'}
                  </div>
                  <div className="text-xs opacity-90">
                    {showClearConfirm
                      ? 'This cannot be undone!'
                      : 'Delete all accounts and collections'}
                  </div>
                </div>
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-sm font-bold mb-2">💡 Tips</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• ✨ Try demo data to see all UI features</li>
                <li>• Export regularly to backup your data</li>
                <li>• Import replaces all current data</li>
                <li>• Data auto-saves, but export for safety</li>
                <li>• Share exports with friends!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

