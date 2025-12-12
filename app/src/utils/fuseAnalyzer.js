/**
 * Fuse Analyzer
 * Analyzes accounts for fuse readiness and suggests transfers
 */

import { MUTATIONS } from './incomeCalculator.js';

const BRAINROTS_NEEDED_TO_FUSE = 4;

/**
 * Calculate quality score for a brainrot (for fuse recommendations)
 * Higher score = better for fusing
 */
export function calculateFuseQualityScore(brainrot, collectionEntry) {
  let score = 0;

  // Rarity score (base points)
  const rarityScores = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
    brainrot_god: 6,
    og: 7,
    secret: 8
  };
  score += rarityScores[brainrot.rarity] || 0;

  // Mutation multiplier
  const mutation = collectionEntry?.mutation || 'none';
  const mutationMultipliers = {
    none: 1.0,
    gold: 1.25,
    diamond: 1.5,
    bloodmoon: 2.0,
    celestial: 4.0,
    candy: 4.0,
    lava: 6.0,
    galaxy: 6.0,
    yin_yang: 7.5,
    radioactive: 8.5,
    rainbow: 10.0,
    halloween: 1.0
  };
  score *= mutationMultipliers[mutation] || 1.0;

  // Trait bonus (+0.5 per trait)
  if (collectionEntry?.traits && collectionEntry.traits.length > 0) {
    score += collectionEntry.traits.length * 0.5;
  }

  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Categorize fuse quality based on total score
 */
export function categorizeFuseQuality(totalScore) {
  if (totalScore >= 120) return { level: 'very_high', label: '⭐⭐⭐ Very High', color: 'text-yellow-400' };
  if (totalScore >= 80) return { level: 'high', label: '⭐⭐ High', color: 'text-green-400' };
  if (totalScore >= 40) return { level: 'medium', label: '⭐ Medium', color: 'text-blue-400' };
  return { level: 'low', label: 'Low', color: 'text-gray-400' };
}

/**
 * Analyze if an account is ready to fuse
 * @param {Object} account - Account object
 * @param {Array} collection - Collection entries for this account
 * @param {Array} allBrainrots - All brainrot data
 * @returns {Object} Readiness analysis
 */
export function analyzeFuseReadiness(account, collection, allBrainrots) {
  // Filter out brainrots currently in active fuses
  const availableCollection = collection.filter(entry => !entry.inActiveFuse);

  const brainrotsMap = new Map(allBrainrots.map(br => [br.id, br]));
  
  // Get brainrot details with scores
  const availableBrainrots = availableCollection.map(entry => {
    const brainrot = brainrotsMap.get(entry.brainrotId);
    if (!brainrot) return null;

    return {
      ...entry,
      brainrot,
      fuseScore: calculateFuseQualityScore(brainrot, entry)
    };
  }).filter(Boolean);

  const canFuse = availableBrainrots.length >= BRAINROTS_NEEDED_TO_FUSE;
  const needsCount = Math.max(0, BRAINROTS_NEEDED_TO_FUSE - availableBrainrots.length);

  return {
    accountId: account.id,
    accountName: account.name,
    canFuse,
    availableCount: availableBrainrots.length,
    needsCount,
    availableBrainrots,
    status: canFuse ? 'ready' : needsCount > 0 ? 'blocked' : 'insufficient'
  };
}

/**
 * Suggest which brainrots to fuse from an account
 * @param {Array} availableBrainrots - Brainrots available to fuse
 * @param {string} strategy - 'maximize', 'balance', or 'disposal'
 * @returns {Object} Suggested fuse
 */
export function suggestFuse(availableBrainrots, strategy = 'balance') {
  if (availableBrainrots.length < BRAINROTS_NEEDED_TO_FUSE) {
    return null;
  }

  let sortedBrainrots = [...availableBrainrots];

  switch (strategy) {
    case 'maximize':
      // Use highest quality brainrots
      sortedBrainrots.sort((a, b) => b.fuseScore - a.fuseScore);
      break;

    case 'disposal':
      // Use lowest quality brainrots
      sortedBrainrots.sort((a, b) => a.fuseScore - b.fuseScore);
      break;

    case 'balance':
    default:
      // Mix of high and low (2 high, 2 low)
      sortedBrainrots.sort((a, b) => b.fuseScore - a.fuseScore);
      const highTier = sortedBrainrots.slice(0, Math.ceil(sortedBrainrots.length / 2));
      const lowTier = sortedBrainrots.slice(Math.ceil(sortedBrainrots.length / 2));
      
      sortedBrainrots = [
        ...highTier.slice(0, 2),
        ...lowTier.slice(-2)
      ];
      break;
  }

  const selectedBrainrots = sortedBrainrots.slice(0, BRAINROTS_NEEDED_TO_FUSE);
  const totalScore = selectedBrainrots.reduce((sum, br) => sum + br.fuseScore, 0);
  const quality = categorizeFuseQuality(totalScore);

  return {
    brainrots: selectedBrainrots,
    totalScore: Math.round(totalScore * 10) / 10,
    quality,
    strategy
  };
}

/**
 * Find brainrots in other accounts that can be transferred to enable fusing
 * @param {Object} targetAccount - Account that needs brainrots
 * @param {number} needsCount - How many brainrots needed
 * @param {Array} allAccounts - All accounts
 * @param {Object} allCollections - Collections mapped by accountId
 * @param {Array} allBrainrots - All brainrot data
 * @param {string} strategy - Transfer strategy
 * @returns {Array} Suggested transfers
 */
export function suggestTransfersForFusing(
  targetAccount,
  needsCount,
  allAccounts,
  allCollections,
  allBrainrots,
  strategy = 'balance'
) {
  const brainrotsMap = new Map(allBrainrots.map(br => [br.id, br]));
  const suggestedTransfers = [];

  // Look through other accounts for available brainrots
  allAccounts.forEach(account => {
    if (account.id === targetAccount.id) return; // Skip target account
    if (suggestedTransfers.length >= needsCount) return; // Already found enough

    const collection = allCollections[account.id] || [];
    const availableCollection = collection.filter(entry => !entry.inActiveFuse);

    // Only take from accounts that will still be able to fuse after transfer
    const accountWillStillFuse = availableCollection.length > BRAINROTS_NEEDED_TO_FUSE;
    if (!accountWillStillFuse) return; // Don't cripple other accounts

    // Get brainrots with scores
    const brainrotsWithScores = availableCollection.map(entry => {
      const brainrot = brainrotsMap.get(entry.brainrotId);
      if (!brainrot) return null;

      return {
        ...entry,
        brainrot,
        fuseScore: calculateFuseQualityScore(brainrot, entry),
        sourceAccountId: account.id,
        sourceAccountName: account.name
      };
    }).filter(Boolean);

    // Sort based on strategy
    let sorted = [...brainrotsWithScores];
    if (strategy === 'maximize') {
      sorted.sort((a, b) => b.fuseScore - a.fuseScore); // Transfer high-quality
    } else if (strategy === 'disposal') {
      sorted.sort((a, b) => a.fuseScore - b.fuseScore); // Transfer low-quality
    } else {
      // Balance: transfer medium-quality
      sorted.sort((a, b) => a.fuseScore - b.fuseScore);
      const mid = Math.floor(sorted.length / 2);
      sorted = sorted.slice(mid - 2, mid + 2); // Middle range
    }

    // Take what we need from this account
    const toTake = Math.min(
      needsCount - suggestedTransfers.length,
      sorted.length - BRAINROTS_NEEDED_TO_FUSE // Leave enough for source to fuse
    );

    suggestedTransfers.push(...sorted.slice(0, toTake));
  });

  return suggestedTransfers.slice(0, needsCount);
}

/**
 * Analyze all accounts for fuse readiness and generate a comprehensive plan
 * @param {Array} accounts - All accounts
 * @param {Object} collections - Collections mapped by accountId
 * @param {Array} brainrots - All brainrot data
 * @param {string} strategy - Strategy to use
 * @returns {Object} Comprehensive fuse plan
 */
export function generateFusePlan(accounts, collections, brainrots, strategy = 'balance') {
  // Analyze each account
  const analyses = accounts.map(account => {
    const collection = collections[account.id] || [];
    const analysis = analyzeFuseReadiness(account, collection, brainrots);

    // If ready, suggest a fuse
    if (analysis.canFuse) {
      analysis.suggestedFuse = suggestFuse(analysis.availableBrainrots, strategy);
    }

    return analysis;
  });

  // Separate by status
  const readyAccounts = analyses.filter(a => a.status === 'ready');
  const blockedAccounts = analyses.filter(a => a.status === 'blocked');
  const insufficientAccounts = analyses.filter(a => a.status === 'insufficient');

  // For blocked accounts, suggest transfers
  const transferPlans = blockedAccounts.map(blockedAccount => {
    const suggestedTransfers = suggestTransfersForFusing(
      { id: blockedAccount.accountId, name: blockedAccount.accountName },
      blockedAccount.needsCount,
      accounts,
      collections,
      brainrots,
      strategy
    );

    const canBeUnblocked = suggestedTransfers.length >= blockedAccount.needsCount;

    return {
      accountId: blockedAccount.accountId,
      accountName: blockedAccount.accountName,
      needsCount: blockedAccount.needsCount,
      suggestedTransfers,
      canBeUnblocked,
      status: canBeUnblocked ? 'can_unblock' : 'insufficient_resources'
    };
  });

  // Calculate if we can get everyone fusing
  const accountsThatCanFuse = readyAccounts.length + transferPlans.filter(p => p.canBeUnblocked).length;
  const accountsThatCantFuse = insufficientAccounts.length + transferPlans.filter(p => !p.canBeUnblocked).length;

  return {
    summary: {
      totalAccounts: accounts.length,
      readyToFuse: readyAccounts.length,
      needsTransfers: blockedAccounts.length,
      insufficientBrainrots: insufficientAccounts.length,
      accountsThatCanFuse,
      accountsThatCantFuse,
      canGetAllFusing: accountsThatCantFuse === 0
    },
    readyAccounts,
    blockedAccounts,
    insufficientAccounts,
    transferPlans,
    strategy
  };
}

/**
 * Execute a transfer plan (helper for UI)
 * @param {Array} transfers - Array of transfer objects
 * @param {Function} onTransfer - Callback to execute each transfer
 * @returns {Promise} Resolves when all transfers complete
 */
export async function executeTransferPlan(transfers, onTransfer) {
  const results = [];

  for (const transfer of transfers) {
    try {
      await onTransfer(
        transfer.id, // collection entry ID
        transfer.sourceAccountId,
        transfer.targetAccountId
      );
      results.push({ success: true, transfer });
    } catch (error) {
      results.push({ success: false, transfer, error });
    }
  }

  return results;
}

/**
 * Format duration for display (90 minutes)
 */
export function formatFuseDuration(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Calculate fuse progress (0 to 1)
 */
export function calculateFuseProgress(startTime, duration = 5400000) { // 90 min default
  const now = Date.now();
  const elapsed = now - startTime;
  return Math.min(1, Math.max(0, elapsed / duration));
}

/**
 * Calculate time remaining
 */
export function calculateTimeRemaining(startTime, duration = 5400000) {
  const now = Date.now();
  const endTime = startTime + duration;
  const remaining = Math.max(0, endTime - now);
  return remaining;
}

/**
 * Check if fuse is complete
 */
export function isFuseComplete(startTime, duration = 5400000) {
  return calculateTimeRemaining(startTime, duration) === 0;
}

