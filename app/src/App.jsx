import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNavigation } from './hooks/useNavigation'
import DashboardView from './views/DashboardView'
import AccountDetailView from './views/AccountDetailView'
import TotalCollectionView from './views/TotalCollectionView'
import OrganizationView from './views/OrganizationView'
import Header from './components/common/Header'
import { BulkSelectionProvider } from './contexts/BulkSelectionContext'

function App() {
  // Load brainrots data
  const [brainrots, setBrainrots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  const { currentView, selectedAccount, viewAccount, viewTotalCollection, viewOrganization, backToDashboard } = useNavigation()

  // Drag and drop state
  const [activeDrag, setActiveDrag] = useState(null)

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
  }

  const updateAccount = (accountId, updates) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updates } : acc
    ))
  }

  const deleteAccount = (accountId) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId))
    const newCollections = { ...collections }
    delete newCollections[accountId]
    setCollections(newCollections)
    if (selectedAccount === accountId) {
      backToDashboard()
    }
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
      return
    }

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

    console.log(`Transferred ${entryToTransfer.brainrotId} from ${sourceAccountId} to ${targetAccountId}`)
  }

  // Data management operations
  const handleImportData = (data) => {
    setAccounts(data.accounts)
    setCollections(data.collections)
  }

  const handleClearAllData = () => {
    setAccounts([])
    setCollections({})
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
            onNavigate={{ viewTotalCollection, viewOrganization, backToDashboard }}
            accounts={accounts}
            collections={collections}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
          />

          <main>
            {currentView === 'dashboard' && (
              <DashboardView
                accounts={accounts}
                collections={collections}
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
      </DndContext>
    </BulkSelectionProvider>
  )
}

export default App

