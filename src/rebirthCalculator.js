/**
 * Rebirth and Slot Management Utilities
 * Calculates base slots, free space, and rebirth progression
 */

const REBIRTHS_DATA = require('../data/rebirths.json');

/**
 * Calculate total slots for a given rebirth level
 * @param {number} rebirthLevel - Rebirth level (0-17)
 * @returns {object} Slot breakdown
 */
function calculateSlots(rebirthLevel) {
  if (rebirthLevel < 0 || rebirthLevel > 17) {
    throw new Error('Rebirth level must be between 0 and 17');
  }
  
  const rebirthData = REBIRTHS_DATA.rebirths.find(r => r.level === rebirthLevel);
  
  if (!rebirthData) {
    throw new Error(`No data found for rebirth level ${rebirthLevel}`);
  }
  
  return {
    rebirthLevel,
    totalSlots: rebirthData.rewards.base_slots,
    floors: rebirthData.rewards.total_floors,
    slotBreakdown: rebirthData.slot_breakdown,
    lockTime: rebirthData.rewards.lock_time_seconds,
    multiplier: rebirthData.rewards.multiplier
  };
}

/**
 * Calculate free space for an account
 * @param {number} rebirthLevel - Current rebirth level
 * @param {number} brainrotsOwned - Number of brainrots currently in base
 * @returns {object} Space calculation
 */
function calculateFreeSpace(rebirthLevel, brainrotsOwned) {
  const slots = calculateSlots(rebirthLevel);
  const freeSlots = slots.totalSlots - brainrotsOwned;
  const percentFull = (brainrotsOwned / slots.totalSlots) * 100;
  
  return {
    totalSlots: slots.totalSlots,
    usedSlots: brainrotsOwned,
    freeSlots,
    percentFull: Math.round(percentFull * 10) / 10,
    isFull: freeSlots === 0,
    status: getSpaceStatus(percentFull)
  };
}

/**
 * Get space status based on percentage full
 * @param {number} percentFull - Percentage of slots used
 * @returns {string} Status indicator
 */
function getSpaceStatus(percentFull) {
  if (percentFull >= 100) return 'FULL';
  if (percentFull >= 90) return 'CRITICAL';
  if (percentFull >= 75) return 'HIGH';
  if (percentFull >= 50) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get rebirth requirements
 * @param {number} nextRebirthLevel - Target rebirth level
 * @returns {object} Requirements
 */
function getRebirthRequirements(nextRebirthLevel) {
  if (nextRebirthLevel < 1 || nextRebirthLevel > 17) {
    throw new Error('Rebirth level must be between 1 and 17');
  }
  
  const rebirthData = REBIRTHS_DATA.rebirths.find(r => r.level === nextRebirthLevel);
  
  return {
    level: nextRebirthLevel,
    name: rebirthData.name,
    cashRequired: rebirthData.cash_required,
    brainrotsRequired: rebirthData.brainrots_required,
    rewards: rebirthData.rewards,
    notes: rebirthData.notes
  };
}

/**
 * Calculate recommended floor placement for brainrots
 * @param {Array} brainrots - Array of brainrot objects with income values
 * @param {number} rebirthLevel - Current rebirth level
 * @returns {object} Floor placement recommendations
 */
function calculateFloorPlacement(brainrots, rebirthLevel) {
  const slots = calculateSlots(rebirthLevel);
  
  // Sort brainrots by value (descending)
  const sortedBrainrots = [...brainrots].sort((a, b) => {
    const valueA = a.calculatedIncome || a.income_per_second || 0;
    const valueB = b.calculatedIncome || b.income_per_second || 0;
    return valueB - valueA;
  });
  
  const placement = {
    floor_1: [],
    floor_2: [],
    floor_3: []
  };
  
  // If no floor 3, prioritize floor 2, then floor 1
  // If floor 3 exists, put most valuable there
  
  if (slots.floors >= 3) {
    // Floor 3: Most valuable (hardest to steal)
    const floor3Slots = slots.slotBreakdown.floor_3;
    placement.floor_3 = sortedBrainrots.slice(0, floor3Slots);
    
    // Floor 2: Next most valuable
    const floor2Slots = slots.slotBreakdown.floor_2;
    placement.floor_2 = sortedBrainrots.slice(floor3Slots, floor3Slots + floor2Slots);
    
    // Floor 1: Least valuable (easiest to steal)
    placement.floor_1 = sortedBrainrots.slice(floor3Slots + floor2Slots);
    
  } else if (slots.floors >= 2) {
    // Floor 2: Most valuable
    const floor2Slots = slots.slotBreakdown.floor_2;
    placement.floor_2 = sortedBrainrots.slice(0, floor2Slots);
    
    // Floor 1: Remaining
    placement.floor_1 = sortedBrainrots.slice(floor2Slots);
    
  } else {
    // Only floor 1
    placement.floor_1 = sortedBrainrots;
  }
  
  return {
    rebirthLevel,
    totalFloors: slots.floors,
    placement,
    security: {
      floor_1: 'LOW - Easy to steal',
      floor_2: slots.floors >= 2 ? 'MEDIUM - Requires stairs' : null,
      floor_3: slots.floors >= 3 ? 'HIGH - Requires ladder, hardest to steal' : null
    }
  };
}

/**
 * Format large numbers for display
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
function formatCash(num) {
  if (num < 1000) return `$${num}`;
  if (num < 1000000) return `$${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num < 1000000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num < 1000000000000000) return `$${(num / 1000000000000).toFixed(1)}T`;
  return `$${(num / 1000000000000000).toFixed(1)}Qa`;
}

/**
 * Example usage
 */
function exampleRebirthCalculations() {
  console.log("=== Rebirth & Slot Calculator Examples ===\n");
  
  // Example 1: Starting player
  console.log("Example 1: Brand new player (No rebirth)");
  const start = calculateSlots(0);
  const startSpace = calculateFreeSpace(0, 5);
  console.log(`  Total Slots: ${start.totalSlots}`);
  console.log(`  Floors: ${start.floors}`);
  console.log(`  Lock Time: ${start.lockTime}s`);
  console.log(`  Free Space: ${startSpace.freeSlots}/${startSpace.totalSlots} (${startSpace.percentFull}% full)`);
  console.log(`  Status: ${startSpace.status}`);
  console.log();
  
  // Example 2: After Rebirth 2 (2nd floor unlocked)
  console.log("Example 2: After Rebirth 2 (2nd floor unlocked)");
  const rb2 = calculateSlots(2);
  const rb2Space = calculateFreeSpace(2, 15);
  console.log(`  Total Slots: ${rb2.totalSlots} (Floor 1: 10, Floor 2: 8)`);
  console.log(`  Floors: ${rb2.floors}`);
  console.log(`  Lock Time: ${rb2.lockTime}s`);
  console.log(`  Multiplier: ${rb2.multiplier}x`);
  console.log(`  Free Space: ${rb2Space.freeSlots}/${rb2Space.totalSlots} (${rb2Space.percentFull}% full)`);
  console.log(`  Status: ${rb2Space.status}`);
  console.log();
  
  // Example 3: After Rebirth 10 (3rd floor unlocked!)
  console.log("Example 3: After Rebirth 10 (3rd floor unlocked!)");
  const rb10 = calculateSlots(10);
  const rb10Space = calculateFreeSpace(10, 26);
  console.log(`  Total Slots: ${rb10.totalSlots} (Floor 1: 10, Floor 2: 12, Floor 3: 4)`);
  console.log(`  Floors: ${rb10.floors}`);
  console.log(`  Lock Time: ${rb10.lockTime}s`);
  console.log(`  Multiplier: ${rb10.multiplier}x`);
  console.log(`  Free Space: ${rb10Space.freeSlots}/${rb10Space.totalSlots} (${rb10Space.percentFull}% full)`);
  console.log(`  Status: ${rb10Space.status}`);
  console.log();
  
  // Example 4: Max rebirth
  console.log("Example 4: Maximum Rebirth 17");
  const rb17 = calculateSlots(17);
  const rb17Space = calculateFreeSpace(17, 20);
  console.log(`  Total Slots: ${rb17.totalSlots} (Floor 1: 10, Floor 2: 12, Floor 3: 11)`);
  console.log(`  Floors: ${rb17.floors}`);
  console.log(`  Lock Time: ${rb17.lockTime}s`);
  console.log(`  Multiplier: ${rb17.multiplier}x`);
  console.log(`  Free Space: ${rb17Space.freeSlots}/${rb17Space.totalSlots} (${rb17Space.percentFull}% full)`);
  console.log(`  Status: ${rb17Space.status}`);
  console.log();
  
  // Example 5: Get next rebirth requirements
  console.log("Example 5: Planning for Rebirth 5");
  const rb5Req = getRebirthRequirements(5);
  console.log(`  Name: ${rb5Req.name}`);
  console.log(`  Cash Required: ${formatCash(rb5Req.cashRequired)}`);
  console.log(`  Brainrots Required: ${rb5Req.brainrotsRequired.join(', ')}`);
  console.log(`  Rewards:`);
  console.log(`    - Multiplier: ${rb5Req.rewards.multiplier}x`);
  console.log(`    - Starting Cash: ${formatCash(rb5Req.rewards.starting_cash)}`);
  console.log(`    - Total Slots: ${rb5Req.rewards.base_slots}`);
  console.log(`    - Lock Time: ${rb5Req.rewards.lock_time_seconds}s`);
  console.log();
  
  // Example 6: Floor placement strategy
  console.log("Example 6: Optimal floor placement (Rebirth 10)");
  const exampleBrainrots = [
    { name: "Strawberry Elephant", income_per_second: 250000000 },
    { name: "Graipuss Medussi", income_per_second: 1000000 },
    { name: "Los Tralaleritos", income_per_second: 750000 },
    { name: "Piccione Macchina", income_per_second: 225000 },
    { name: "Noobini Pizzanini", income_per_second: 1 }
  ];
  const placement = calculateFloorPlacement(exampleBrainrots, 10);
  console.log(`  Floor 3 (Most Secure): ${placement.placement.floor_3.map(b => b.name).join(', ')}`);
  console.log(`  Floor 2 (Medium Security): ${placement.placement.floor_2.map(b => b.name).join(', ')}`);
  console.log(`  Floor 1 (Least Secure): ${placement.placement.floor_1.map(b => b.name).join(', ')}`);
  console.log();
  
  console.log("=== All Tests Complete ===");
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateSlots,
    calculateFreeSpace,
    getSpaceStatus,
    getRebirthRequirements,
    calculateFloorPlacement,
    formatCash,
    exampleRebirthCalculations
  };
}

// Run examples if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  exampleRebirthCalculations();
}
