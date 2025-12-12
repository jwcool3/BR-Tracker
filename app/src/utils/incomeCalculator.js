/**
 * Income Calculator
 * Handles mutations and traits multiplier calculations
 */

// All mutations with multipliers
export const MUTATIONS = {
  none: { name: 'None', multiplier: 1.0, color: null },
  gold: { name: 'Gold', multiplier: 1.25, color: '#FFD700' },
  diamond: { name: 'Diamond', multiplier: 1.5, color: '#B9F2FF' },
  bloodmoon: { name: 'Bloodmoon', multiplier: 2.0, color: '#8B0000' },
  celestial: { name: 'Celestial', multiplier: 4.0, color: '#4B0082' },
  candy: { name: 'Candy', multiplier: 4.0, color: '#FF69B4' },
  lava: { name: 'Lava', multiplier: 6.0, color: '#FF4500' },
  galaxy: { name: 'Galaxy', multiplier: 6.0, color: '#9370DB' },
  yin_yang: { name: 'Yin Yang', multiplier: 7.5, color: '#808080' },
  radioactive: { name: 'Radioactive', multiplier: 8.5, color: '#00FF00' },
  rainbow: { name: 'Rainbow', multiplier: 10.0, color: 'linear-gradient(rainbow)' },
  halloween: { name: 'Halloween', multiplier: 1.0, color: '#FF6600' }
}

// All traits with multipliers (Updated from wiki: https://stealabrainrot.fandom.com/wiki/Traits)
export const TRAITS = {
  // OG Event Traits (Rarest)
  strawberry: { name: 'Strawberry', multiplier: 8.0, icon: '🍓' },
  meowl: { name: 'Meowl', multiplier: 7.0, icon: '🦉' },
  
  // Seasonal Event Traits
  jack_o_lantern: { name: "Jack O'Lantern", multiplier: 6.0, icon: '🎃' },
  santa_hat: { name: 'Santa Hat', multiplier: 5.0, icon: '🎅' },
  rip_tombstone: { name: 'RIP Tombstone', multiplier: 5.0, icon: '🪦' },
  witching_hour: { name: 'Witching Hour', multiplier: 4.5, icon: '🧙' },
  extinct: { name: 'Extinct', multiplier: 4.0, icon: '🦴' },
  ten_b: { name: '10B', multiplier: 4.0, icon: '🎂' },
  
  // Admin Event Traits
  paint: { name: 'Paint', multiplier: 6.0, icon: '🎨' },
  brazil: { name: 'Brazil', multiplier: 6.0, icon: '🇧🇷' },
  fire: { name: 'Fire', multiplier: 6.0, icon: '🔥' },
  fireworks: { name: 'Fireworks', multiplier: 6.0, icon: '🎆' },
  nyan: { name: 'Nyan', multiplier: 6.0, icon: '🌈' },
  lightning: { name: 'Lightning', multiplier: 6.0, icon: '⚡' },
  indonesian: { name: 'Indonesian', multiplier: 5.0, icon: '🇮🇩' },
  sombrero: { name: 'Sombrero', multiplier: 5.0, icon: '🤠' },
  disco: { name: 'Disco', multiplier: 5.0, icon: '🕺' },
  glitched: { name: 'Glitched', multiplier: 5.0, icon: '⚠️' },
  crab_claw: { name: 'Crab Claw', multiplier: 5.0, icon: '🦀' },
  zombie: { name: 'Zombie', multiplier: 5.0, icon: '🧟' },
  tie: { name: 'Tie', multiplier: 4.75, icon: '👔' },
  matteo_hat: { name: 'Matteo Hat', multiplier: 4.5, icon: '🧢' },
  galactic: { name: 'Galactic', multiplier: 4.0, icon: '☄️' },
  explosive: { name: 'Explosive', multiplier: 4.0, icon: '💣' },
  shark_fin: { name: 'Shark Fin', multiplier: 4.0, icon: '🦈' },
  bubblegum: { name: 'Bubblegum', multiplier: 4.0, icon: '🍬' },
  spider: { name: 'Spider', multiplier: 3.5, icon: '🕷️' },
  ufo: { name: 'UFO', multiplier: 3.0, icon: '🛸' },
  taco: { name: 'Taco', multiplier: 3.0, icon: '🌮' },
  
  // Natural Event Traits
  cometstruck: { name: 'Comet-struck', multiplier: 3.5, icon: '💫' },
  snowy: { name: 'Snowy', multiplier: 3.0, icon: '❄️' },
  wet: { name: 'Wet', multiplier: 3.0, icon: '🌧️' },
  
  // Negative Trait
  sleepy: { name: 'Sleepy', multiplier: -0.5, icon: '💤' }
}

/**
 * Calculate income per second with mutations and traits
 * 
 * CORRECT FORMULA (from wiki):
 * - base * mutation_multiplier * trait_total_multiplier
 * 
 * TRAIT STACKING (IMPORTANT):
 * - First trait: Uses full multiplier (e.g., Strawberry 8x = 8x)
 * - Additional traits: Each adds (multiplier - 1) (e.g., Taco 3x = +2x)
 * 
 * Example: Strawberry (8x) + Taco (3x)
 * - First: 8x from Strawberry
 * - Second: +2x from Taco (3 - 1)
 * - Total: 10x
 * 
 * Wiki source: https://stealabrainrot.fandom.com/wiki/Traits
 */
export function calculateIncome(baseIncome, mutation = 'none', traits = []) {
  if (!baseIncome || baseIncome <= 0) return 0

  // Get mutation multiplier (only 1 mutation allowed)
  const mutationData = MUTATIONS[mutation] || MUTATIONS.none
  const mutationMultiplier = mutationData.multiplier

  // Calculate traits multiplier (CORRECT METHOD)
  let traitsMultiplier = 1 // Start at base 1x (no traits)
  const appliedTraits = []
  
  if (traits && traits.length > 0) {
    // Sort traits by multiplier (highest first) for best calculation
    const sortedTraits = [...traits]
      .map(traitKey => ({ key: traitKey, ...TRAITS[traitKey] }))
      .filter(t => t.multiplier !== undefined)
      .sort((a, b) => Math.abs(b.multiplier) - Math.abs(a.multiplier))
    
    if (sortedTraits.length > 0) {
      // First trait: Use FULL multiplier (e.g., Strawberry 8x = 8x)
      traitsMultiplier = sortedTraits[0].multiplier
      appliedTraits.push(sortedTraits[0])
      
      // Additional traits: Add (multiplier - 1) for each (e.g., Taco 3x = +2x)
      for (let i = 1; i < sortedTraits.length; i++) {
        const trait = sortedTraits[i]
        traitsMultiplier += (trait.multiplier - 1)
        appliedTraits.push(trait)
      }
    }
  }

  // Formula: base * mutation * traits
  const totalIncome = Math.floor(baseIncome * mutationMultiplier * traitsMultiplier)

  // Calculate breakdown for display
  const traitsAdded = appliedTraits.reduce((sum, t) => sum + (t.multiplier - 1), 0)

  return {
    baseIncome,
    mutation: { key: mutation, ...mutationData },
    mutationMultiplier,
    traits: appliedTraits,
    traitsMultiplierSum: traitsAdded,
    traitsMultiplier,
    totalIncome,
    breakdown: {
      step1: `Base: $${baseIncome.toLocaleString()}/s`,
      step2: `× Mutation (${mutationData.name}): ${mutationMultiplier}x = $${Math.floor(baseIncome * mutationMultiplier).toLocaleString()}/s`,
      step3: appliedTraits.length > 0
        ? `× Traits (1 + ${traitsAdded.toFixed(1)}): ${traitsMultiplier.toFixed(1)}x = $${totalIncome.toLocaleString()}/s`
        : 'No traits applied',
      final: `Final: $${totalIncome.toLocaleString()}/s`
    }
  }
}

/**
 * Quick calculate - just return the total
 */
export function quickCalculateIncome(baseIncome, mutation = 'none', traits = []) {
  const result = calculateIncome(baseIncome, mutation, traits)
  return result.totalIncome
}

