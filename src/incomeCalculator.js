/**
 * Steal a Brainrot Income Calculator
 * Handles mutations and traits multiplier calculations
 */

// Load mutations and traits data
const MUTATIONS = {
  none: { name: "None", multiplier: 1.0 },
  gold: { name: "Gold", multiplier: 1.25, color: "#FFD700" },
  diamond: { name: "Diamond", multiplier: 1.5, color: "#B9F2FF" },
  bloodmoon: { name: "Bloodmoon", multiplier: 2.0, color: "#8B0000" },
  celestial: { name: "Celestial", multiplier: 4.0, color: "#4B0082" },
  candy: { name: "Candy", multiplier: 4.0, color: "#FF69B4" },
  lava: { name: "Lava", multiplier: 6.0, color: "#FF4500" },
  galaxy: { name: "Galaxy", multiplier: 6.0, color: "#9370DB" },
  yin_yang: { name: "Yin Yang", multiplier: 7.5, color: "#808080" },
  radioactive: { name: "Radioactive", multiplier: 8.5, color: "#00FF00" },
  rainbow: { name: "Rainbow", multiplier: 10.0, color: "rainbow" },
  halloween: { name: "Halloween", multiplier: 1.0, color: "#FF6600" }
};

const TRAITS = {
  sleepy: { name: "Sleepy", multiplier: -0.5, icon: "💤" },
  galactic: { name: "Galactic", multiplier: 4.0, icon: "☄️" },
  bombardiro: { name: "Bombardiro", multiplier: 4.0, icon: "💣" },
  shark_fin: { name: "Shark Fin", multiplier: 4.0, icon: "🦈" },
  paint: { name: "Paint", multiplier: 6.0, icon: "🎨" },
  nyan: { name: "Nyan", multiplier: 6.0, icon: "🌈" },
  fire: { name: "Fire", multiplier: 6.0, icon: "🔥" },
  zombie: { name: "Zombie", multiplier: 5.0, icon: "🧟" },
  firework: { name: "Firework", multiplier: 6.0, icon: "🎆" },
  rain: { name: "Rain", multiplier: 2.5, icon: "🌧️" },
  snowy: { name: "Snowy", multiplier: 3.0, icon: "❄️" },
  cometstruck: { name: "Cometstruck", multiplier: 3.5, icon: "⭐" },
  bloodmoon_trait: { name: "Bloodmoon Trait", multiplier: 2.0, icon: "🌕" },
  taco: { name: "Taco", multiplier: 3.0, icon: "🌮" },
  strawberry: { name: "Strawberry", multiplier: 10.0, icon: "🍓" },
  hat: { name: "Hat", multiplier: 1.0, icon: "🎩" },
  meowl: { name: "Meowl", multiplier: 5.0, icon: "🦉" },
  pumpkin: { name: "Pumpkin", multiplier: 4.0, icon: "🎃" },
  rip: { name: "RIP", multiplier: 5.0, icon: "🪦" },
  crab: { name: "Crab", multiplier: 3.0, icon: "🦀" }
};

/**
 * Calculate income per second with mutations and traits
 * @param {number} baseIncome - Base income per second
 * @param {string} mutation - Mutation key (e.g., 'rainbow', 'gold')
 * @param {string[]} traits - Array of trait keys (e.g., ['zombie', 'firework'])
 * @returns {object} Calculation breakdown
 */
function calculateIncome(baseIncome, mutation = 'none', traits = []) {
  // Get mutation multiplier (only 1 mutation allowed)
  const mutationData = MUTATIONS[mutation] || MUTATIONS.none;
  const mutationMultiplier = mutationData.multiplier;
  
  // Calculate traits multiplier (traits stack additively, then multiply)
  let traitsMultiplierSum = 0;
  const appliedTraits = [];
  
  for (const traitKey of traits) {
    const traitData = TRAITS[traitKey];
    if (traitData) {
      traitsMultiplierSum += traitData.multiplier;
      appliedTraits.push({
        key: traitKey,
        ...traitData
      });
    }
  }
  
  // Formula: base * mutation_multiplier * (1 + sum_of_trait_multipliers)
  const traitsMultiplier = 1 + traitsMultiplierSum;
  const totalIncome = baseIncome * mutationMultiplier * traitsMultiplier;
  
  return {
    baseIncome,
    mutation: {
      key: mutation,
      ...mutationData
    },
    mutationMultiplier,
    traits: appliedTraits,
    traitsMultiplierSum,
    traitsMultiplier,
    totalIncome,
    breakdown: {
      step1: `Base: $${baseIncome}/s`,
      step2: `× Mutation (${mutationData.name}): ${mutationMultiplier}x = $${(baseIncome * mutationMultiplier).toLocaleString()}/s`,
      step3: appliedTraits.length > 0 
        ? `× Traits (1 + ${traitsMultiplierSum}): ${traitsMultiplier}x = $${totalIncome.toLocaleString()}/s`
        : 'No traits applied',
      final: `Final: $${totalIncome.toLocaleString()}/s`
    }
  };
}

/**
 * Format large numbers with K, M, B, T suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
function formatNumber(num) {
  if (num < 1000) return num.toFixed(0);
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
  return (num / 1000000000000).toFixed(1) + 'T';
}

/**
 * Calculate total income across multiple brainrots
 * @param {Array} brainrots - Array of brainrot objects with income calculations
 * @returns {number} Total income per second
 */
function calculateTotalIncome(brainrots) {
  return brainrots.reduce((total, brainrot) => {
    return total + (brainrot.calculatedIncome || brainrot.income_per_second || 0);
  }, 0);
}

/**
 * Example usage
 */
function exampleCalculations() {
  console.log("=== Steal a Brainrot Income Calculator Examples ===\n");
  
  // Example 1: Basic brainrot with no modifiers
  const example1 = calculateIncome(100);
  console.log("Example 1: Noobini Pizzanini ($1/s, no modifiers)");
  console.log(example1.breakdown);
  console.log();
  
  // Example 2: Rainbow mutation
  const example2 = calculateIncome(1000000, 'rainbow');
  console.log("Example 2: Graipuss Medussi ($1M/s) with Rainbow mutation");
  console.log(example2.breakdown);
  console.log();
  
  // Example 3: Rainbow + Multiple traits (God tier)
  const example3 = calculateIncome(250000000, 'rainbow', ['zombie', 'firework', 'strawberry']);
  console.log("Example 3: Strawberry Elephant ($250M/s) with Rainbow + Zombie + Firework + Strawberry");
  console.log(example3.breakdown);
  console.log(`Applied traits: ${example3.traits.map(t => t.name).join(', ')}`);
  console.log();
  
  // Example 4: With sleepy trait (negative)
  const example4 = calculateIncome(50000, 'diamond', ['sleepy']);
  console.log("Example 4: Tralalero Tralala ($50K/s) with Diamond mutation + Sleepy trait");
  console.log(example4.breakdown);
  console.log();
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MUTATIONS,
    TRAITS,
    calculateIncome,
    formatNumber,
    calculateTotalIncome,
    exampleCalculations
  };
}

// Run examples if this is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  exampleCalculations();
}