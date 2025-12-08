/**
 * Demo Data Generator
 * Creates realistic placeholder data for testing the UI
 */

// Sample brainrot IDs (from the actual 439 brainrots)
const sampleBrainrotIds = [
  'strawberry-elephant',
  'noobini-pizzanini',
  'graipuss-medussi',
  'los-tralaleritos',
  'la-grand-combination',
  'meowl',
  'girafa-celestre',
  'tralalero-tralala',
  'lucky-block',
  'taco-cat',
  'rainbow-unicorn',
  'pizza-steve',
  'banana-split',
  'disco-ball',
  'neon-dragon',
  'golden-chicken',
  'crystal-wolf',
  'fire-phoenix',
  'ice-bear',
  'thunder-tiger',
  'space-monkey',
  'cyber-panda',
  'diamond-dog',
  'ruby-rabbit',
  'sapphire-snake'
]

const mutations = ['none', 'gold', 'diamond', 'rainbow', 'bloodmoon', 'lava', 'galaxy']
const traits = ['zombie', 'firework', 'sleepy', 'galactic', 'paint', 'nyan', 'fire']

const accountNames = [
  { name: 'Main Account', tags: ['main', 'active'], favorite: true, color: '#3b82f6' },
  { name: 'Alt Storage 1', tags: ['storage'], favorite: false, color: '#8b5cf6' },
  { name: 'Alt Storage 2', tags: ['storage'], favorite: false, color: '#8b5cf6' },
  { name: 'Alt Storage 3', tags: ['storage'], favorite: false, color: '#8b5cf6' },
  { name: 'Grind Account 1', tags: ['grinding', 'active'], favorite: true, color: '#10b981' },
  { name: 'Grind Account 2', tags: ['grinding'], favorite: false, color: '#10b981' },
  { name: 'Grind Account 3', tags: ['grinding'], favorite: false, color: '#10b981' },
  { name: 'Trading Account', tags: ['trading'], favorite: true, color: '#f59e0b' },
  { name: 'Trading Alt', tags: ['trading'], favorite: false, color: '#f59e0b' },
  { name: 'Daily Claims', tags: ['utility'], favorite: false, color: '#6366f1' },
  { name: 'Event Farming', tags: ['events'], favorite: false, color: '#ec4899' },
  { name: 'Secret Hunting', tags: ['secrets'], favorite: false, color: '#ef4444' },
  { name: 'AFK Account', tags: ['afk'], favorite: false, color: '#64748b' },
  { name: 'Main Alt', tags: ['main'], favorite: true, color: '#3b82f6' },
  { name: 'Storage Overflow', tags: ['storage'], favorite: false, color: '#8b5cf6' },
  { name: 'Rebirth Test', tags: ['testing'], favorite: false, color: '#14b8a6' },
  { name: 'Legendary Hunter', tags: ['grinding', 'legendary'], favorite: false, color: '#f97316' },
  { name: 'Mythic Collector', tags: ['grinding', 'mythic'], favorite: false, color: '#ec4899' },
  { name: 'OG Showcase', tags: ['showcase'], favorite: false, color: '#ef4444' },
  { name: 'Backup Account', tags: ['backup'], favorite: false, color: '#64748b' }
]

/**
 * Generate demo accounts and collections
 * Creates 20 accounts with varying rebirth levels and slot usage
 */
export function generateDemoData() {
  const accounts = []
  const collections = {}
  const now = Date.now()

  accountNames.forEach((template, index) => {
    const accountId = `demo-acc-${now}-${index}`
    
    // Create account with varying rebirth levels
    const rebirthLevel = index < 5 ? [10, 8, 2, 2, 5][index] : Math.floor(Math.random() * 12)
    
    const account = {
      id: accountId,
      name: template.name,
      rebirthLevel,
      notes: `Demo account ${index + 1} - ${template.tags.join(', ')}`,
      tags: template.tags,
      color: template.color,
      favorite: template.favorite,
      hidden: false,
      createdAt: new Date(now - (20 - index) * 86400000).toISOString() // Stagger dates
    }
    
    accounts.push(account)

    // Calculate slots for this rebirth level
    const totalSlots = 10 + (rebirthLevel >= 2 ? rebirthLevel - 1 : 0)
    
    // Create collection with varying fullness to demonstrate status levels
    let targetSize
    if (index === 1) {
      // FULL account
      targetSize = totalSlots
    } else if (index === 2 || index === 6) {
      // CRITICAL accounts (90-99%)
      targetSize = Math.floor(totalSlots * 0.95)
    } else if (index === 0 || index === 4 || index === 7) {
      // HIGH accounts (75-89%)
      targetSize = Math.floor(totalSlots * 0.80)
    } else if (index === 3 || index === 8) {
      // MEDIUM accounts (50-74%)
      targetSize = Math.floor(totalSlots * 0.60)
    } else {
      // LOW accounts (0-49%)
      targetSize = Math.floor(totalSlots * Math.random() * 0.4)
    }

    // Generate brainrots for this account
    const collection = []
    const usedBrainrots = new Set()
    
    for (let i = 0; i < targetSize; i++) {
      // Pick a random brainrot that hasn't been used yet
      let brainrotId
      do {
        brainrotId = sampleBrainrotIds[Math.floor(Math.random() * sampleBrainrotIds.length)]
      } while (usedBrainrots.has(brainrotId) && usedBrainrots.size < sampleBrainrotIds.length)
      
      usedBrainrots.add(brainrotId)
      
      // Randomly assign mutation, traits, floor
      const mutation = mutations[Math.floor(Math.random() * mutations.length)]
      const numTraits = Math.floor(Math.random() * 3) // 0-2 traits
      const selectedTraits = []
      for (let j = 0; j < numTraits; j++) {
        const trait = traits[Math.floor(Math.random() * traits.length)]
        if (!selectedTraits.includes(trait)) {
          selectedTraits.push(trait)
        }
      }
      
      const floor = Math.min(5, Math.max(1, Math.floor(Math.random() * (rebirthLevel + 1))))
      const calculatedIncome = Math.floor(Math.random() * 1000000000) // Random income
      
      collection.push({
        brainrotId,
        mutation,
        traits: selectedTraits,
        floor,
        calculatedIncome
      })
    }
    
    collections[accountId] = collection
  })

  return { accounts, collections }
}

/**
 * Get demo data metadata
 */
export function getDemoDataInfo() {
  const { accounts, collections } = generateDemoData()
  
  const totalBrainrots = Object.values(collections).reduce((sum, coll) => sum + coll.length, 0)
  
  // Count by status
  const statusCounts = { full: 0, critical: 0, high: 0, medium: 0, low: 0 }
  accounts.forEach(account => {
    const collectionSize = collections[account.id]?.length || 0
    const totalSlots = 10 + (account.rebirthLevel >= 2 ? account.rebirthLevel - 1 : 0)
    const percentFull = totalSlots > 0 ? (collectionSize / totalSlots) * 100 : 0
    
    if (percentFull >= 100) statusCounts.full++
    else if (percentFull >= 90) statusCounts.critical++
    else if (percentFull >= 75) statusCounts.high++
    else if (percentFull >= 50) statusCounts.medium++
    else statusCounts.low++
  })
  
  return {
    totalAccounts: accounts.length,
    totalBrainrots,
    favorites: accounts.filter(a => a.favorite).length,
    statusCounts
  }
}

