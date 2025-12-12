/**
 * Account Analyzer
 * Analyzes account collections and provides optimization recommendations
 */

import { MUTATIONS } from './incomeCalculator.js';

/**
 * Analyze a single account's collection
 * @param {Object} account - Account object
 * @param {Array} collection - Collection entries for this account
 * @param {Array} allBrainrots - All brainrot data
 * @returns {Object} Analysis results
 */
export function analyzeAccount(account, collection, allBrainrots) {
  if (!collection || collection.length === 0) {
    return {
      accountId: account.id,
      accountName: account.name,
      totalBrainrots: 0,
      isEmpty: true,
      patterns: [],
      recommendations: []
    };
  }

  // Get brainrot details for each collection entry
  const brainrotsMap = new Map(allBrainrots.map(br => [br.id, br]));
  const collectionWithDetails = collection.map(entry => ({
    ...entry,
    brainrot: brainrotsMap.get(entry.brainrotId)
  })).filter(entry => entry.brainrot);

  // Count by rarity
  const rarityCount = {};
  collectionWithDetails.forEach(entry => {
    const rarity = entry.brainrot.rarity || 'unknown';
    rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
  });

  // Count by mutation
  const mutationCount = {};
  collectionWithDetails.forEach(entry => {
    const mutation = entry.mutation || 'none';
    mutationCount[mutation] = (mutationCount[mutation] || 0) + 1;
  });

  // Count by event/source
  const eventCount = {};
  collectionWithDetails.forEach(entry => {
    const source = entry.brainrot.source;
    if (source && source !== 'Unknown') {
      eventCount[source] = (eventCount[source] || 0) + 1;
    }
  });

  // Count by income tier
  const incomeTiers = {
    'starter': 0,      // < $1K/s
    'early': 0,        // $1K - $10K/s
    'mid': 0,          // $10K - $1M/s
    'late': 0,         // $1M - $100M/s
    'endgame': 0       // > $100M/s
  };

  collectionWithDetails.forEach(entry => {
    const income = entry.calculatedIncome || entry.brainrot.income_per_second || 0;
    if (income < 1000) incomeTiers.starter++;
    else if (income < 10000) incomeTiers.early++;
    else if (income < 1000000) incomeTiers.mid++;
    else if (income < 100000000) incomeTiers.late++;
    else incomeTiers.endgame++;
  });

  // Detect patterns
  const patterns = detectPatterns(
    collection.length,
    rarityCount,
    mutationCount,
    eventCount,
    incomeTiers
  );

  return {
    accountId: account.id,
    accountName: account.name,
    totalBrainrots: collection.length,
    isEmpty: false,
    rarityBreakdown: rarityCount,
    mutationBreakdown: mutationCount,
    eventBreakdown: eventCount,
    incomeTierBreakdown: incomeTiers,
    patterns,
    collectionWithDetails
  };
}

/**
 * Detect patterns in an account's collection
 * @returns {Array} Array of detected patterns
 */
function detectPatterns(total, rarityCount, mutationCount, eventCount, incomeTiers) {
  const patterns = [];

  // Rarity patterns
  Object.entries(rarityCount).forEach(([rarity, count]) => {
    const percentage = (count / total) * 100;
    
    if (percentage >= 70) {
      patterns.push({
        type: 'dominant_rarity',
        rarity,
        count,
        percentage: percentage.toFixed(1),
        strength: 'strong',
        description: `${percentage.toFixed(0)}% ${rarity.replace('_', ' ')} brainrots`
      });
    } else if (percentage >= 50) {
      patterns.push({
        type: 'major_rarity',
        rarity,
        count,
        percentage: percentage.toFixed(1),
        strength: 'moderate',
        description: `${percentage.toFixed(0)}% ${rarity.replace('_', ' ')} brainrots`
      });
    }
  });

  // Mutation patterns
  Object.entries(mutationCount).forEach(([mutation, count]) => {
    if (mutation === 'none') return;
    
    const percentage = (count / total) * 100;
    
    if (percentage >= 60) {
      patterns.push({
        type: 'dominant_mutation',
        mutation,
        count,
        percentage: percentage.toFixed(1),
        strength: 'strong',
        description: `${percentage.toFixed(0)}% ${MUTATIONS[mutation]?.name || mutation} mutation`
      });
    } else if (percentage >= 40) {
      patterns.push({
        type: 'major_mutation',
        mutation,
        count,
        percentage: percentage.toFixed(1),
        strength: 'moderate',
        description: `${percentage.toFixed(0)}% ${MUTATIONS[mutation]?.name || mutation} mutation`
      });
    }
  });

  // Event patterns
  Object.entries(eventCount).forEach(([event, count]) => {
    const percentage = (count / total) * 100;
    
    if (percentage >= 50) {
      patterns.push({
        type: 'event_collection',
        event,
        count,
        percentage: percentage.toFixed(1),
        strength: 'strong',
        description: `${percentage.toFixed(0)}% from ${event}`
      });
    }
  });

  // Income tier patterns
  Object.entries(incomeTiers).forEach(([tier, count]) => {
    const percentage = (count / total) * 100;
    
    if (percentage >= 70) {
      patterns.push({
        type: 'income_focus',
        tier,
        count,
        percentage: percentage.toFixed(1),
        strength: 'strong',
        description: `${percentage.toFixed(0)}% ${tier}-game brainrots`
      });
    }
  });

  return patterns;
}

/**
 * Generate recommendations for an account based on analysis
 * @param {Object} accountAnalysis - Analysis of the target account
 * @param {Array} allAccounts - All accounts
 * @param {Object} allCollections - All collections mapped by accountId
 * @param {Array} allBrainrots - All brainrot data
 * @returns {Array} Array of recommendations
 */
export function generateRecommendations(accountAnalysis, allAccounts, allCollections, allBrainrots) {
  if (accountAnalysis.isEmpty || accountAnalysis.patterns.length === 0) {
    return [];
  }

  const recommendations = [];
  const brainrotsMap = new Map(allBrainrots.map(br => [br.id, br]));

  // For each strong pattern, find matching brainrots in other accounts
  accountAnalysis.patterns.forEach(pattern => {
    if (pattern.strength === 'strong') {
      // Find brainrots in other accounts that match this pattern
      const matchingBrainrots = findMatchingBrainrotsInOtherAccounts(
        pattern,
        accountAnalysis.accountId,
        allAccounts,
        allCollections,
        brainrotsMap
      );

      if (matchingBrainrots.length > 0) {
        recommendations.push({
          type: 'consolidate',
          pattern,
          targetAccountId: accountAnalysis.accountId,
          targetAccountName: accountAnalysis.accountName,
          suggestedTransfers: matchingBrainrots,
          impact: `Add ${matchingBrainrots.length} more ${getPatternLabel(pattern)} to strengthen theme`,
          priority: matchingBrainrots.length >= 5 ? 'high' : 'medium'
        });
      }
    }
  });

  // Check if account is "almost themed" (40-60% of one type)
  accountAnalysis.patterns.forEach(pattern => {
    if (pattern.strength === 'moderate') {
      const percentage = parseFloat(pattern.percentage);
      if (percentage >= 40 && percentage < 70) {
        recommendations.push({
          type: 'theme_potential',
          pattern,
          targetAccountId: accountAnalysis.accountId,
          targetAccountName: accountAnalysis.accountName,
          impact: `This account is ${percentage.toFixed(0)}% ${getPatternLabel(pattern)} - consider making it a themed collection`,
          priority: 'medium'
        });
      }
    }
  });

  return recommendations;
}

/**
 * Find brainrots in other accounts that match a pattern
 */
function findMatchingBrainrotsInOtherAccounts(pattern, targetAccountId, allAccounts, allCollections, brainrotsMap) {
  const matches = [];

  allAccounts.forEach(account => {
    if (account.id === targetAccountId) return; // Skip target account

    const collection = allCollections[account.id] || [];
    
    collection.forEach(entry => {
      const brainrot = brainrotsMap.get(entry.brainrotId);
      if (!brainrot) return;

      let isMatch = false;

      switch (pattern.type) {
        case 'dominant_rarity':
        case 'major_rarity':
          isMatch = brainrot.rarity === pattern.rarity;
          break;

        case 'dominant_mutation':
        case 'major_mutation':
          isMatch = entry.mutation === pattern.mutation;
          break;

        case 'event_collection':
          isMatch = brainrot.source === pattern.event;
          break;

        case 'income_focus':
          const income = entry.calculatedIncome || brainrot.income_per_second || 0;
          isMatch = isIncomeTier(income, pattern.tier);
          break;
      }

      if (isMatch) {
        matches.push({
          brainrotId: brainrot.id,
          brainrotName: brainrot.name,
          collectionEntryId: entry.id,
          sourceAccountId: account.id,
          sourceAccountName: account.name,
          mutation: entry.mutation,
          traits: entry.traits,
          calculatedIncome: entry.calculatedIncome,
          rarity: brainrot.rarity,
          image: brainrot.image
        });
      }
    });
  });

  return matches;
}

/**
 * Check if income matches a tier
 */
function isIncomeTier(income, tier) {
  switch (tier) {
    case 'starter': return income < 1000;
    case 'early': return income >= 1000 && income < 10000;
    case 'mid': return income >= 10000 && income < 1000000;
    case 'late': return income >= 1000000 && income < 100000000;
    case 'endgame': return income >= 100000000;
    default: return false;
  }
}

/**
 * Get human-readable label for a pattern
 */
function getPatternLabel(pattern) {
  switch (pattern.type) {
    case 'dominant_rarity':
    case 'major_rarity':
      return pattern.rarity.replace('_', ' ');
    
    case 'dominant_mutation':
    case 'major_mutation':
      return `${MUTATIONS[pattern.mutation]?.name || pattern.mutation} mutation`;
    
    case 'event_collection':
      return pattern.event;
    
    case 'income_focus':
      return `${pattern.tier}-game`;
    
    default:
      return 'brainrots';
  }
}

/**
 * Analyze all accounts and generate comprehensive recommendations
 * @param {Array} accounts - All accounts
 * @param {Object} collections - Collections mapped by accountId
 * @param {Array} brainrots - All brainrot data
 * @returns {Object} Full analysis and recommendations
 */
export function analyzeAllAccounts(accounts, collections, brainrots) {
  const accountAnalyses = accounts.map(account => {
    const collection = collections[account.id] || [];
    return analyzeAccount(account, collection, brainrots);
  });

  const allRecommendations = [];

  accountAnalyses.forEach(analysis => {
    if (!analysis.isEmpty && analysis.patterns.length > 0) {
      const recommendations = generateRecommendations(
        analysis,
        accounts,
        collections,
        brainrots
      );
      allRecommendations.push(...recommendations);
    }
  });

  // Sort recommendations by priority
  allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    accountAnalyses,
    recommendations: allRecommendations,
    summary: {
      totalAccounts: accounts.length,
      accountsWithPatterns: accountAnalyses.filter(a => a.patterns.length > 0).length,
      totalRecommendations: allRecommendations.length,
      highPriorityRecommendations: allRecommendations.filter(r => r.priority === 'high').length
    }
  };
}

/**
 * Calculate cost-effectiveness score for rebirth storage
 * @param {Object} brainrot - Brainrot object
 * @returns {number} Score (higher = better for rebirth)
 */
export function calculateCostEffectiveness(brainrot) {
  const income = brainrot.income_per_second || 0;
  const cost = brainrot.cost || 1;
  
  if (income === 0 || cost === 0) return 0;
  
  // Formula: Income / (Cost ^ 0.8)
  // This favors high income and lower cost, but doesn't penalize high-cost as much
  return income / Math.pow(cost, 0.8);
}

/**
 * Recommend brainrots for rebirth storage
 * @param {Array} allBrainrots - All brainrot data
 * @param {number} minRebirth - Minimum rebirth level (0-17)
 * @param {number} maxRebirth - Maximum rebirth level (0-17)
 * @param {string} strategy - 'speed', 'balance', or 'power'
 * @param {number} count - Number of brainrots to recommend
 * @returns {Array} Recommended brainrots
 */
export function recommendRebirthStorage(allBrainrots, minRebirth, maxRebirth, strategy, count = 15) {
  // Define cost thresholds based on rebirth range
  let maxCost, minIncome;
  
  if (maxRebirth <= 5) {
    maxCost = 50000;
    minIncome = 1;
  } else if (maxRebirth <= 10) {
    maxCost = 5000000;
    minIncome = 100;
  } else if (maxRebirth <= 15) {
    maxCost = 100000000;
    minIncome = 10000;
  } else {
    maxCost = Infinity;
    minIncome = 100000;
  }

  // Filter brainrots by criteria
  let filtered = allBrainrots.filter(br => {
    const cost = br.cost || 0;
    const income = br.income_per_second || 0;
    
    return cost > 0 && cost <= maxCost && income >= minIncome;
  });

  // Calculate scores based on strategy
  filtered = filtered.map(br => {
    let score = 0;
    
    switch (strategy) {
      case 'speed':
        // Prioritize low cost
        score = br.income_per_second / (br.cost * 2);
        break;
      
      case 'balance':
        // Use cost-effectiveness formula
        score = calculateCostEffectiveness(br);
        break;
      
      case 'power':
        // Prioritize high income
        score = br.income_per_second / Math.pow(br.cost, 0.5);
        break;
      
      default:
        score = calculateCostEffectiveness(br);
    }
    
    return { ...br, rebirthScore: score };
  });

  // Sort by score and return top N
  filtered.sort((a, b) => b.rebirthScore - a.rebirthScore);
  
  return filtered.slice(0, count);
}

