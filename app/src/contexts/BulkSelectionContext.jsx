import { createContext, useContext, useState } from 'react'

/**
 * Bulk Selection Context
 * Manages bulk selection state for drag and drop operations
 */
const BulkSelectionContext = createContext()

export function BulkSelectionProvider({ children }) {
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedBrainrots, setSelectedBrainrots] = useState(new Set())

  const toggleBulkMode = () => {
    setBulkMode(prev => !prev)
    if (bulkMode) {
      // Clear selection when exiting bulk mode
      setSelectedBrainrots(new Set())
    }
  }

  const toggleSelection = (brainrotId) => {
    setSelectedBrainrots(prev => {
      const newSet = new Set(prev)
      if (newSet.has(brainrotId)) {
        newSet.delete(brainrotId)
      } else {
        newSet.add(brainrotId)
      }
      return newSet
    })
  }

  const selectAll = (brainrotIds) => {
    setSelectedBrainrots(new Set(brainrotIds))
  }

  const clearSelection = () => {
    setSelectedBrainrots(new Set())
  }

  const isSelected = (brainrotId) => {
    return selectedBrainrots.has(brainrotId)
  }

  return (
    <BulkSelectionContext.Provider value={{
      bulkMode,
      selectedBrainrots,
      toggleBulkMode,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected
    }}>
      {children}
    </BulkSelectionContext.Provider>
  )
}

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext)
  if (!context) {
    throw new Error('useBulkSelection must be used within BulkSelectionProvider')
  }
  return context
}

