import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNavigation } from './hooks/useNavigation'
import DashboardView from './views/DashboardView'
import AccountDetailView from './views/AccountDetailView'
import TotalCollectionView from './views/TotalCollectionView'
import Header from './components/common/Header'

function App() {
  // Load brainrots data
  const [brainrots, setBrainrots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load brainrots.json on mount
  useEffect(() => {
    fetch('/brainrots.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load brainrots data')
        return response.json()
      })
      .then(data => {
        setBrainrots(data)
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
  const { currentView, selectedAccount, viewAccount, viewTotalCollection, backToDashboard } = useNavigation()

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
    <div className="min-h-screen bg-slate-900">
      <Header 
        currentView={currentView}
        selectedAccount={accounts.find(a => a.id === selectedAccount)}
        onNavigate={{ viewTotalCollection, backToDashboard }}
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
      </main>
    </div>
  )
}

export default App

