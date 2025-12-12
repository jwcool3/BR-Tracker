import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNavigation } from './hooks/useNavigation'
import { useToast } from './hooks/useToast'
import DashboardView from './views/DashboardView'
import AccountDetailView from './views/AccountDetailView'
import TotalCollectionView from './views/TotalCollectionView'
import OrganizationView from './views/OrganizationView'
import DataVerificationView from './views/DataVerificationView'
import Header from './components/common/Header'
import ToastContainer from './components/common/ToastContainer'
import { BulkSelectionProvider } from './contexts/BulkSelectionContext'

function App() {
  // Load brainrots data
  const [brainrots, setBrainrots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Load verification report
  const [verificationReport, setVerificationReport] = useState(null)

  // Load brainrots.json on mount
  useEffect(() => {
    console.log('Loading brainrots.json...')
    fetch('/brainrots.json')
      .then(response => {
        console.log('Brainrots response:', response.status, response.statusText)
        if (!response.ok) throw new Error(`Failed to load brainrots data: ${response.status}`)
        return response.json()
      })
      .then(data => {
        // Handle both array format and { brainrots: [...] } format
        const brainrotArray = Array.isArray(data) ? data : (data.brainrots || [])
        console.log('Brainrots loaded:', brainrotArray.length, 'items')
        setBrainrots(brainrotArray)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading brainrots:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])
  
  // Load verification report
  useEffect(() => {
    fetch('/verification_report.json')
      .then(response => {
        if (!response.ok) {
          console.warn('No verification report found')
          return null
        }
        return response.json()
      })
      .then(data => {
        if (data) {
          console.log('Verification report loaded:', data.total_issues, 'issues')
          setVerificationReport(data)
        }
      })
      .catch(err => {
        console.warn('Could not load verification report:', err)
      })
  }, [])
  
  // Account management
  const [accounts, setAccounts] = useLocalStorage('br-accounts', [
    {
      id: 'default',
      name: 'Main Account',
      rebirthLevel: 0,
      notes: '',
      tags: [],
      color: '#3b82f6',
      favorite: false,
      hidden: false,
      createdAt: new Date().toISOString()
    }
  ])
  
  // Collections per account
  const [collections, setCollections] = useLocalStorage('br-collections', {
    default: []
  })
  
  // Navigation state
  const { currentView, selectedAccount, viewAccount, viewTotalCollection, viewOrganization, viewVerification, backToDashboard } = useNavigation()

  // Drag and drop state
  const [activeDrag, setActiveDrag] = useState(null)
  
  // Toast notifications
  const { toasts, showToast, removeToast } = useToast()
  
  // Brainrot management (for verification view)
  const deleteBrainrot = (brainrotId) => {
    const brainrot = brainrots.find(br => br.id === brainrotId)
    // Remove from brainrots list
    const updatedBrainrots = brainrots.filter(br => br.id !== brainrotId)
    setBrainrots(updatedBrainrots)
    
    // Remove from all collections
    const updatedCollections = {}
    Object.entries(collections).forEach(([accountId, collection]) => {
      updatedCollections[accountId] = collection.filter(entry => entry.brainrotId !== brainrotId)
    })
    setCollections(updatedCollections)
    
    showToast({
      type: 'success',
      message: `🗑️ "${brainrot?.name || brainrotId}" deleted from database`,
      duration: 3000
    })
    console.log(`Deleted brainrot: ${brainrotId}`)
  }
  
  const updateBrainrotData = (brainrotId, updates) => {
    const updatedBrainrots = brainrots.map(br => 
      br.id === brainrotId ? { ...br, ...updates } : br
    )
    setBrainrots(updatedBrainrots)
    console.log(`Updated brainrot: ${brainrotId}`, updates)
  }
  
  const mergeBrainrots = (br1Id, br2Id, keepData) => {
    // Not implemented yet - would merge two brainrot entries
    console.log(`Merge brainrots: ${br1Id} + ${br2Id}`)
    alert('Merge functionality coming soon! For now, just delete one.')
  }

  // Account CRUD operations
  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: `acc-${Date.now()}`,
      tags: account.tags || [],
      color: account.color || '#3b82f6',
      favorite: account.favorite || false,
      hidden: account.hidden || false,
      createdAt: new Date().toISOString()
    }
    setAccounts([...accounts, newAccount])
    setCollections({ ...collections, [newAccount.id]: [] })
    showToast({
      type: 'success',
      message: `✅ Account "${account.name}" created!`,
      duration: 3000
    })
  }

  const updateAccount = (accountId, updates) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updates } : acc
    ))
  }

  const deleteAccount = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId)
    setAccounts(accounts.filter(acc => acc.id !== accountId))
    const newCollections = { ...collections }
    delete newCollections[accountId]
    setCollections(newCollections)
    if (selectedAccount === accountId) {
      backToDashboard()
    }
    showToast({
      type: 'success',
      message: `🗑️ Account "${account?.name || 'Unknown'}" deleted`,
      duration: 3000
    })
  }

  // Collection operations
  const updateCollection = (accountId, newCollection) => {
    setCollections({
      ...collections,
      [accountId]: newCollection
    })
  }

  // Transfer a brainrot from one account to another
  const handleTransferBrainrot = (collectionEntryId, sourceAccountId, targetAccountId) => {
    // Find the entry in source collection
    const sourceCollection = collections[sourceAccountId] || []
    const entryToTransfer = sourceCollection.find(entry => entry.id === collectionEntryId)
    
    if (!entryToTransfer) {
      console.error('Entry not found in source collection')
      showToast({
        type: 'error',
        message: '❌ Transfer failed - brainrot not found',
        duration: 3000
      })
      return
    }

    const brainrot = brainrots.find(br => br.id === entryToTransfer.brainrotId)
    const sourceAccount = accounts.find(a => a.id === sourceAccountId)
    const targetAccount = accounts.find(a => a.id === targetAccountId)

    // Remove from source
    const newSourceCollection = sourceCollection.filter(entry => entry.id !== collectionEntryId)
    
    // Add to target with new ID
    const targetCollection = collections[targetAccountId] || []
    const newEntry = {
      ...entryToTransfer,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate new ID
    }
    const newTargetCollection = [...targetCollection, newEntry]

    // Update both collections
    setCollections({
      ...collections,
      [sourceAccountId]: newSourceCollection,
      [targetAccountId]: newTargetCollection
    })

    showToast({
      type: 'success',
      message: `🔄 "${brainrot?.name || 'Brainrot'}" transferred to ${targetAccount?.name || 'account'}`,
      duration: 3000
    })
    console.log(`Transferred ${entryToTransfer.brainrotId} from ${sourceAccountId} to ${targetAccountId}`)
  }

  // Data management operations
  const handleImportData = (data) => {
    setAccounts(data.accounts)
    setCollections(data.collections)
    showToast({
      type: 'success',
      message: `📥 Data imported! ${data.accounts.length} accounts loaded`,
      duration: 4000
    })
  }

  const handleClearAllData = () => {
    setAccounts([])
    setCollections({})
    showToast({
      type: 'warning',
      message: '🗑️ All data cleared',
      duration: 3000
    })
  }

  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveDrag(event.active)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) {
      setActiveDrag(null)
      return
    }

    // Parse drag data
    const dragData = active.data.current
    const dropData = over.data.current

    if (!dragData || !dropData) {
      setActiveDrag(null)
      return
    }

    // Handle dropping brainrot(s) onto an account
    if (dragData.type === 'brainrot' && dropData.type === 'account') {
      const sourceAccountId = dragData.accountId
      const targetAccountId = dropData.accountId
      const brainrotIds = dragData.brainrotIds || [dragData.brainrotId]

      // Don't drop on same account
      if (sourceAccountId === targetAccountId) {
        setActiveDrag(null)
        return
      }

      // Copy brainrots from source to target
      const sourceCollection = collections[sourceAccountId] || []
      const targetCollection = collections[targetAccountId] || []

      const brainrotsToCopy = sourceCollection.filter(entry => 
        brainrotIds.includes(entry.brainrotId)
      )

      // Add to target (avoid duplicates)
      const existingIds = new Set(targetCollection.map(e => e.brainrotId))
      const newEntries = brainrotsToCopy.filter(entry => !existingIds.has(entry.brainrotId))

      if (newEntries.length > 0) {
        updateCollection(targetAccountId, [...targetCollection, ...newEntries])
        const targetAccount = accounts.find(a => a.id === targetAccountId)
        showToast({
          type: 'success',
          message: `🎉 ${newEntries.length} brainrot${newEntries.length > 1 ? 's' : ''} copied to ${targetAccount?.name || 'account'}`,
          duration: 3000
        })
      } else {
        const targetAccount = accounts.find(a => a.id === targetAccountId)
        showToast({
          type: 'info',
          message: `ℹ️ ${targetAccount?.name || 'Account'} already has these brainrots`,
          duration: 3000
        })
      }
    }

    setActiveDrag(null)
  }

  const handleDragCancel = () => {
    setActiveDrag(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-xl font-bold mb-2">Loading Brainrot Tracker...</div>
          <div className="text-gray-400">Fetching {brainrots.length || 439} brainrots</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2 text-red-400">Error Loading Data</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <BulkSelectionProvider>
      <DndContext 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="min-h-screen bg-slate-900">
          <Header 
            currentView={currentView}
            selectedAccount={accounts.find(a => a.id === selectedAccount)}
            onNavigate={{ viewTotalCollection, viewOrganization, viewVerification, backToDashboard }}
            accounts={accounts}
            collections={collections}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
            hasVerificationReport={!!verificationReport}
          />

          <main>
            {currentView === 'dashboard' && (
              <DashboardView
                accounts={accounts}
                collections={collections}
                brainrots={brainrots}
                onViewAccount={viewAccount}
                onAddAccount={addAccount}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
              />
            )}

            {currentView === 'detail' && selectedAccount && (
              <AccountDetailView
                account={accounts.find(a => a.id === selectedAccount)}
                brainrots={brainrots}
                collection={collections[selectedAccount] || []}
                onBack={backToDashboard}
                onUpdateCollection={(newCollection) => updateCollection(selectedAccount, newCollection)}
                onUpdateAccount={(updates) => updateAccount(selectedAccount, updates)}
              />
            )}

            {currentView === 'collection' && (
              <TotalCollectionView
                accounts={accounts}
                collections={collections}
                brainrots={brainrots}
                onBack={backToDashboard}
                onViewAccount={viewAccount}
              />
            )}

            {currentView === 'organization' && (
              <OrganizationView
                accounts={accounts}
                collections={collections}
                brainrots={brainrots}
                onBack={backToDashboard}
                onTransferBrainrot={handleTransferBrainrot}
              />
            )}

            {currentView === 'verification' && (
              <DataVerificationView
                verificationReport={verificationReport}
                brainrots={brainrots}
                onBack={backToDashboard}
                onDeleteBrainrot={deleteBrainrot}
                onUpdateBrainrot={updateBrainrotData}
                onMergeBrainrots={mergeBrainrots}
              />
            )}
          </main>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDrag && activeDrag.data.current && (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90">
              <div className="text-sm font-bold text-white">
                {activeDrag.data.current.brainrotIds 
                  ? `${activeDrag.data.current.brainrotIds.length} Brainrots` 
                  : activeDrag.data.current.brainrotName || 'Dragging...'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Drop on account to copy
              </div>
            </div>
          )}
        </DragOverlay>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </DndContext>
    </BulkSelectionProvider>
  )
}

export default App

