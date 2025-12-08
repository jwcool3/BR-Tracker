/**
 * Rebirth Calculator
 * Functions for calculating slots, floors, and rebirth requirements
 */

/**
 * Calculate total slots available at a given rebirth level
 * @param {number} rebirthLevel - Current rebirth level (0-17)
 * @returns {number} Total slots available
 */
export function calculateSlots(rebirthLevel) {
  // Base slots
  let baseSlots = 10
  
  // R1: 10 slots, R2: 11 slots, R3: 12 slots, etc.
  if (rebirthLevel >= 2) {
    baseSlots += (rebirthLevel - 1)
  }
  
  return baseSlots
}

/**
 * Calculate free space remaining
 * @param {number} rebirthLevel - Current rebirth level
 * @param {number} currentlyOwned - Number of brainrots currently owned
 * @returns {number} Free slots remaining
 */
export function calculateFreeSpace(rebirthLevel, currentlyOwned) {
  const totalSlots = calculateSlots(rebirthLevel)
  return Math.max(0, totalSlots - currentlyOwned)
}

/**
 * Get rebirth requirements for next level
 * @param {number} currentLevel - Current rebirth level (0-17)
 * @returns {object|null} Requirements or null if max level
 */
export function getRebirthRequirements(currentLevel) {
  // Requirements data (simplified - load from rebirths.json in production)
  const requirements = [
    { level: 1, cash: 100000, brainrots: 10 },
    { level: 2, cash: 500000, brainrots: 15 },
    { level: 3, cash: 2500000, brainrots: 20 },
    { level: 4, cash: 12500000, brainrots: 25 },
    { level: 5, cash: 62500000, brainrots: 30 },
    { level: 6, cash: 312500000, brainrots: 35 },
    { level: 7, cash: 1562500000, brainrots: 40 },
    { level: 8, cash: 7812500000, brainrots: 45 },
    { level: 9, cash: 39062500000, brainrots: 50 },
    { level: 10, cash: 195312500000, brainrots: 55 },
    { level: 11, cash: 976562500000, brainrots: 60 },
    { level: 12, cash: 4882812500000, brainrots: 65 },
    { level: 13, cash: 24414062500000, brainrots: 70 },
    { level: 14, cash: 122070312500000, brainrots: 75 },
    { level: 15, cash: 610351562500000, brainrots: 80 },
    { level: 16, cash: 3051757812500000, brainrots: 85 },
    { level: 17, cash: 15258789062500000, brainrots: 90 }
  ]
  
  const nextLevel = currentLevel + 1
  if (nextLevel > 17) return null
  
  return requirements[nextLevel - 1]
}

/**
 * Calculate floor placement by rebirth level
 * @param {number} rebirthLevel - Current rebirth level (0-17)
 * @returns {object} Floor configuration
 */
export function calculateFloorPlacement(rebirthLevel) {
  const totalSlots = calculateSlots(rebirthLevel)
  
  // Default distribution for R0-R1
  if (rebirthLevel <= 1) {
    return {
      1: totalSlots,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  }
  
  // R2+: Distribute evenly, with floor 1 getting remainder
  const floorsUnlocked = Math.min(5, rebirthLevel)
  const perFloor = Math.floor(totalSlots / floorsUnlocked)
  const remainder = totalSlots % floorsUnlocked
  
  const distribution = {}
  for (let i = 1; i <= 5; i++) {
    if (i <= floorsUnlocked) {
      distribution[i] = perFloor + (i === 1 ? remainder : 0)
    } else {
      distribution[i] = 0
    }
  }
  
  return distribution
}

/**
 * Format large cash values
 * @param {number} value - Cash value
 * @returns {string} Formatted string (e.g., "$1.5M", "$2.3B")
 */
export function formatCash(value) {
  if (value < 1000) return `$${value}`
  if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`
  if (value < 1000000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value < 1000000000000) return `$${(value / 1000000000).toFixed(1)}B`
  return `$${(value / 1000000000000).toFixed(1)}T`
}

