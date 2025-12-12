import { useState } from 'react'

/**
 * Hook for managing navigation between four views:
 * - dashboard: Overview of all accounts
 * - detail: Manage one account's brainrots
 * - collection: Total collection across all accounts
 * - organization: Smart organization recommendations
 */
export function useNavigation() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedAccount, setSelectedAccount] = useState(null)

  const viewAccount = (accountId) => {
    setSelectedAccount(accountId)
    setCurrentView('detail')
  }

  const viewTotalCollection = () => {
    setSelectedAccount(null)
    setCurrentView('collection')
  }

  const viewOrganization = () => {
    setSelectedAccount(null)
    setCurrentView('organization')
  }

  const backToDashboard = () => {
    setSelectedAccount(null)
    setCurrentView('dashboard')
  }

  return {
    currentView,
    selectedAccount,
    viewAccount,
    viewTotalCollection,
    viewOrganization,
    backToDashboard,
  }
}

