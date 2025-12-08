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

// All traits with multipliers
export const TRAITS = {
  sleepy: { name: 'Sleepy', multiplier: -0.5, icon: '💤' },
  galactic: { name: 'Galactic', multiplier: 4.0, icon: '☄️' },
  bombardiro: { name: 'Bombardiro', multiplier: 4.0, icon: '💣' },
  shark_fin: { name: 'Shark Fin', multiplier: 4.0, icon: '🦈' },
  paint: { name: 'Paint', multiplier: 6.0, icon: '🎨' },
  nyan: { name: 'Nyan', multiplier: 6.0, icon: '🌈' },
  fire: { name: 'Fire', multiplier: 6.0, icon: '🔥' },
  zombie: { name: 'Zombie', multiplier: 5.0, icon: '🧟' },
  firework: { name: 'Firework', multiplier: 6.0, icon: '🎆' },
  rain: { name: 'Rain', multiplier: 2.5, icon: '🌧️' },
  snowy: { name: 'Snowy', multiplier: 3.0, icon: '❄️' },
  cometstruck: { name: 'Cometstruck', multiplier: 3.5, icon: '⭐' },
  bloodmoon_trait: { name: 'Bloodmoon', multiplier: 2.0, icon: '🌕' },
  taco: { name: 'Taco', multiplier: 3.0, icon: '🌮' },
  strawberry: { name: 'Strawberry', multiplier: 10.0, icon: '🍓' },
  hat: { name: 'Hat', multiplier: 1.0, icon: '🎩' },
  meowl: { name: 'Meowl', multiplier: 5.0, icon: '🦉' },
  pumpkin: { name: 'Pumpkin', multiplier: 4.0, icon: '🎃' },
  rip: { name: 'RIP', multiplier: 5.0, icon: '🪦' },
  crab: { name: 'Crab', multiplier: 3.0, icon: '🦀' }
}

/**
 * Calculate income per second with mutations and traits
 * Formula: base * mutation_multiplier * (1 + sum_of_trait_multipliers)
 */
export function calculateIncome(baseIncome, mutation = 'none', traits = []) {
  if (!baseIncome || baseIncome <= 0) return 0

  // Get mutation multiplier (only 1 mutation allowed)
  const mutationData = MUTATIONS[mutation] || MUTATIONS.none
  const mutationMultiplier = mutationData.multiplier

  // Calculate traits multiplier (traits stack additively, then multiply)
  let traitsMultiplierSum = 0
  const appliedTraits = []
  
  for (const traitKey of traits) {
    const traitData = TRAITS[traitKey]
    if (traitData) {
      traitsMultiplierSum += traitData.multiplier
      appliedTraits.push({ key: traitKey, ...traitData })
    }
  }

  // Formula: base * mutation_multiplier * (1 + sum_of_trait_multipliers)
  const traitsMultiplier = 1 + traitsMultiplierSum
  const totalIncome = Math.floor(baseIncome * mutationMultiplier * traitsMultiplier)

  return {
    baseIncome,
    mutation: { key: mutation, ...mutationData },
    mutationMultiplier,
    traits: appliedTraits,
    traitsMultiplierSum,
    traitsMultiplier,
    totalIncome,
    breakdown: {
      step1: `Base: $${baseIncome.toLocaleString()}/s`,
      step2: `× Mutation (${mutationData.name}): ${mutationMultiplier}x = $${Math.floor(baseIncome * mutationMultiplier).toLocaleString()}/s`,
      step3: appliedTraits.length > 0
        ? `× Traits (1 + ${traitsMultiplierSum}): ${traitsMultiplier}x = $${totalIncome.toLocaleString()}/s`
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

