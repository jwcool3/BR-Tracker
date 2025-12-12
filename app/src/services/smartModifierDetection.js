/**
 * Smart Modifier Detection Service
 * Uses income mismatch to reverse-engineer missing modifiers
 */

import { TRAITS } from '../utils/incomeCalculator';
import { quickCalculateIncome } from '../utils/incomeCalculator';

/**
 * Detect missing modifiers by analyzing income mismatch
 * @param {number} extractedIncome - Income AI read from image
 * @param {number} baseIncome - Base income from database
 * @param {string} mutation - Detected mutation
 * @param {Array} detectedModifiers - Modifiers AI found
 * @returns {object} Suggested modifiers
 */
export function detectMissingModifiers(extractedIncome, baseIncome, mutation, detectedModifiers) {
  console.log('🔍 Smart modifier detection...');
  
  // Calculate current income with detected modifiers
  const calculatedIncome = quickCalculateIncome(baseIncome, mutation, detectedModifiers);
  
  // Check if there's a significant mismatch
  const ratio = extractedIncome / calculatedIncome;
  const difference = Math.abs(extractedIncome - calculatedIncome);
  const percentDiff = (difference / calculatedIncome) * 100;
  
  console.log(`   Extracted: $${extractedIncome.toLocaleString()}/s`);
  console.log(`   Calculated: $${calculatedIncome.toLocaleString()}/s`);
  console.log(`   Ratio: ${ratio.toFixed(2)}x`);
  console.log(`   Difference: ${percentDiff.toFixed(0)}%`);
  
  // If income matches (within 10%), no missing modifiers
  if (percentDiff < 10) {
    console.log('   ✅ Income matches - no missing modifiers');
    return {
      hasMissingModifiers: false,
      suggestedModifiers: [],
      confidence: 1.0
    };
  }
  
  // If extracted income is LOWER than calculated, something's wrong (ignore)
  if (extractedIncome < calculatedIncome * 0.9) {
    console.log('   ⚠️ Extracted income is lower - possible OCR error');
    return {
      hasMissingModifiers: false,
      suggestedModifiers: [],
      confidence: 0
    };
  }
  
  // Income is HIGHER - likely missing modifier(s)
  console.log('   🔍 Income is higher - searching for missing modifiers...');
  
  // Calculate needed multiplier to bridge the gap
  const neededMultiplier = ratio;
  
  console.log(`   Need ~${neededMultiplier.toFixed(2)}x multiplier to match`);
  
  // Find modifiers that could explain the difference
  const suggestions = [];
  
  // Try single modifiers first
  for (const [key, trait] of Object.entries(TRAITS)) {
    const testIncome = quickCalculateIncome(baseIncome, mutation, [...detectedModifiers, key]);
    const testRatio = extractedIncome / testIncome;
    
    // If adding this modifier gets us close (within 15%)
    if (Math.abs(testRatio - 1.0) < 0.15) {
      suggestions.push({
        modifiers: [key],
        traitNames: [trait.name],
        expectedIncome: testIncome,
        confidence: 1.0 - Math.abs(testRatio - 1.0),
        matchQuality: 'exact'
      });
    }
  }
  
  // If no single modifier works, try combinations of 2
  if (suggestions.length === 0 && neededMultiplier > 3) {
    const traitKeys = Object.keys(TRAITS);
    
    for (let i = 0; i < traitKeys.length && suggestions.length < 3; i++) {
      for (let j = i + 1; j < traitKeys.length && suggestions.length < 3; j++) {
        const combo = [...detectedModifiers, traitKeys[i], traitKeys[j]];
        const testIncome = quickCalculateIncome(baseIncome, mutation, combo);
        const testRatio = extractedIncome / testIncome;
        
        if (Math.abs(testRatio - 1.0) < 0.15) {
          suggestions.push({
            modifiers: [traitKeys[i], traitKeys[j]],
            traitNames: [TRAITS[traitKeys[i]].name, TRAITS[traitKeys[j]].name],
            expectedIncome: testIncome,
            confidence: 1.0 - Math.abs(testRatio - 1.0),
            matchQuality: 'combo'
          });
        }
      }
    }
  }
  
  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  if (suggestions.length > 0) {
    const best = suggestions[0];
    console.log(`   ✅ Found possible modifier(s): ${best.traitNames.join(', ')}`);
    console.log(`   Expected income with suggestion: $${best.expectedIncome.toLocaleString()}/s`);
    console.log(`   Confidence: ${Math.round(best.confidence * 100)}%`);
    
    return {
      hasMissingModifiers: true,
      suggestedModifiers: best.modifiers,
      suggestedNames: best.traitNames,
      expectedIncome: best.expectedIncome,
      confidence: best.confidence,
      allSuggestions: suggestions.slice(0, 3) // Top 3 suggestions
    };
  }
  
  // No good suggestions found
  console.log('   ⚠️ Could not find modifier that explains the difference');
  return {
    hasMissingModifiers: true,
    suggestedModifiers: [],
    suggestedNames: [],
    confidence: 0,
    reason: 'Income mismatch but no modifier matches'
  };
}

/**
 * Format number with K/M/B suffix
 */
function formatNumber(num) {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num}`;
}

