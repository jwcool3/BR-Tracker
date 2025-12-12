/**
 * Vision Verification Service
 * Cross-checks AI Vision results against our database and income calculator
 */

import { quickCalculateIncome } from '../utils/incomeCalculator';
import { detectMissingModifiers } from './smartModifierDetection';

/**
 * Verify AI Vision extraction results using our database and income calculator
 * @param {object} visionResult - Result from Vision extraction
 * @param {object} matchedBrainrot - Matched brainrot from database
 * @returns {object} Verification result with confidence adjustments
 */
export function verifyVisionResult(visionResult, matchedBrainrot) {
  console.log('🔍 Verifying AI Vision result...');
  
  // Handle confidence being either a number or an object with extraction property
  const initialConfidence = typeof visionResult.confidence === 'number' 
    ? visionResult.confidence 
    : visionResult.confidence?.extraction || 0.8;
  
  const verification = {
    passed: true,
    warnings: [],
    confidence: initialConfidence,
    adjustedConfidence: initialConfidence
  };
  
  // 1. Verify Income Calculation
  const extractedIncome = visionResult.extractedData.income_value;
  const extractedMutation = visionResult.extractedData.mutation === 'none' ? null : visionResult.extractedData.mutation;
  const extractedModifiers = visionResult.extractedData.modifier_icons || [];
  
  if (extractedIncome && matchedBrainrot.income_per_second) {
    const calculatedIncome = quickCalculateIncome(
      matchedBrainrot.income_per_second,
      extractedMutation,
      extractedModifiers
    );
    
    // Allow 10% margin of error (OCR/Vision might read slightly wrong)
    const margin = calculatedIncome * 0.1;
    const incomeDiff = Math.abs(extractedIncome - calculatedIncome);
    const incomeMatch = incomeDiff <= margin;
    
    console.log(`💰 Income verification:`, {
      extracted: extractedIncome,
      calculated: calculatedIncome,
      diff: incomeDiff,
      margin: margin,
      match: incomeMatch
    });
    
    if (!incomeMatch) {
      // 🧠 Smart detection: Try to find missing modifiers
      console.log('🔍 Income mismatch detected - checking for missing modifiers...');
      const modifierSuggestion = detectMissingModifiers(
        extractedIncome,
        matchedBrainrot.income_per_second,
        extractedMutation,
        extractedModifiers
      );
      
      if (modifierSuggestion.hasMissingModifiers && modifierSuggestion.suggestedModifiers.length > 0) {
        // Found likely missing modifier(s)!
        console.log(`💡 Smart detection suggests: ${modifierSuggestion.suggestedNames.join(', ')}`);
        
        verification.warnings.push({
          type: 'missing_modifier_detected',
          message: `Likely missing modifier: ${modifierSuggestion.suggestedNames.join(', ')} (${Math.round(modifierSuggestion.confidence * 100)}% confidence)`,
          severity: 'info',
          data: {
            suggestedModifiers: modifierSuggestion.suggestedModifiers,
            suggestedNames: modifierSuggestion.suggestedNames,
            expectedIncome: modifierSuggestion.expectedIncome,
            confidence: modifierSuggestion.confidence,
            extracted: extractedIncome,
            calculated: calculatedIncome
          }
        });
        
        // Auto-apply the suggestion if confidence is high
        if (modifierSuggestion.confidence > 0.85) {
          console.log('✅ Auto-applying suggested modifiers (high confidence)');
          visionResult.extractedData.modifier_icons = [
            ...extractedModifiers,
            ...modifierSuggestion.suggestedModifiers
          ];
          visionResult.extractedData.modifier_icons_auto_detected = true;
        }
        
        // Only slightly reduce confidence since we found a likely explanation
        verification.adjustedConfidence *= 0.95;
      } else {
        // Regular income mismatch (no modifier explanation found)
        verification.warnings.push({
          type: 'income_mismatch',
          message: `Income mismatch: AI read $${formatNumber(extractedIncome)}/s but calculated ${formatNumber(calculatedIncome)}/s`,
          severity: incomeDiff > calculatedIncome * 0.5 ? 'high' : 'medium',
          data: {
            extracted: extractedIncome,
            calculated: calculatedIncome,
            difference: incomeDiff
          }
        });
        
        // Lower confidence if income is way off
        if (incomeDiff > calculatedIncome * 0.5) {
          verification.adjustedConfidence *= 0.7; // Reduce by 30%
          console.warn('⚠️ Large income mismatch - possible wrong brainrot!');
        } else {
          verification.adjustedConfidence *= 0.9; // Reduce by 10%
        }
      }
    } else {
      console.log('✅ Income matches calculated value!');
    }
  }
  
  // 2. Verify Rarity
  const extractedRarity = visionResult.extractedData.rarity;
  const dbRarity = matchedBrainrot.rarity;
  
  if (extractedRarity && dbRarity) {
    const rarityMatch = extractedRarity.toLowerCase() === dbRarity.toLowerCase().replace('_', ' ');
    
    console.log(`⭐ Rarity verification:`, {
      extracted: extractedRarity,
      database: dbRarity,
      match: rarityMatch
    });
    
    if (!rarityMatch) {
      verification.warnings.push({
        type: 'rarity_mismatch',
        message: `Rarity mismatch: AI read "${extractedRarity}" but database says "${dbRarity}"`,
        severity: 'low',
        data: {
          extracted: extractedRarity,
          database: dbRarity
        }
      });
      
      verification.adjustedConfidence *= 0.95; // Small confidence reduction
    } else {
      console.log('✅ Rarity matches database!');
    }
  }
  
  // 3. Check if mutation makes sense with brainrot
  if (extractedMutation && extractedMutation !== 'none') {
    // Some brainrots have specific mutations only (we don't have this data yet, but could add)
    console.log(`🔮 Detected mutation: ${extractedMutation}`);
  }
  
  // 4. Overall verification
  if (verification.warnings.length === 0) {
    console.log('✅ All verifications passed!');
    // Boost confidence slightly for verified results
    verification.adjustedConfidence = Math.min(verification.adjustedConfidence * 1.05, 0.99);
  } else {
    console.log(`⚠️ ${verification.warnings.length} verification warning(s)`);
    verification.passed = verification.warnings.every(w => w.severity !== 'high');
  }
  
  return verification;
}

/**
 * Format large numbers with K/M/B suffixes
 */
function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

