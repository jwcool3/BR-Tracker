/**
 * Floor Scanner Service - Main orchestrator for floor scanning
 * Coordinates card detection, OCR, parsing, and matching
 */

import { detectBrainrotCards, cropCardsFromFloor } from './cardDetectionService';
import { extractTextFromImage } from './ocrService';
import { parseExtractedText, calculateParseConfidence } from './textParser';
import { matchBrainrot } from './brainrotMatcher';
import { detectModifiers } from './modifierDetectionService';
import { extractBrainrotFromImage } from './visionExtractionService';
import { verifyVisionResult } from './visionVerificationService';

/**
 * Process a full floor screenshot
 * @param {File|Blob} floorImage - Screenshot of one side of a floor (1-5 brainrots)
 * @param {Array} brainrotsDatabase - Brainrots from brainrots.json
 * @returns {Promise<{success: boolean, totalCards: number, successful: Array, failed: Array}>}
 */
export async function processFloorScreenshot(floorImage, brainrotsDatabase) {
  const startTime = Date.now();
  
  console.log('🚀 Starting floor scan process...');
  console.log(`📊 Database: ${brainrotsDatabase?.length} brainrots available`);
  
  try {
    // Step 1: Detect cards in floor image
    console.log('\n--- Step 1: Card Detection ---');
    const detection = await detectBrainrotCards(floorImage);
    
    if (!detection || detection.count === 0) {
      throw new Error('No brainrot cards detected in image');
    }
    
    console.log(`✅ Detected ${detection.count} card(s) with ${Math.round(detection.confidence * 100)}% confidence`);
    
    // Step 2: Crop individual cards
    console.log('\n--- Step 2: Crop Cards ---');
    const croppedCards = await cropCardsFromFloor(floorImage, detection.cards);
    
    // Step 3: Process each card in parallel
    console.log('\n--- Step 3: Process Cards (Parallel) ---');
    const processingPromises = croppedCards.map(async (croppedCard, index) => {
      return processSingleCard(
        croppedCard.blob,
        index,
        croppedCard.cardId,
        croppedCard.confidence,
        brainrotsDatabase
      );
    });
    
    const results = await Promise.all(processingPromises);
    
    // Separate successful vs failed
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const processingTime = Date.now() - startTime;
    
    console.log('\n--- Scan Complete ---');
    console.log(`✅ Total: ${detection.count} | Success: ${successful.length} | Failed: ${failed.length}`);
    console.log(`⏱️  Time: ${(processingTime / 1000).toFixed(1)}s (${Math.round(processingTime / detection.count)}ms avg per card)`);
    
    return {
      success: true,
      totalCards: detection.count,
      successfulExtractions: successful.length,
      failedExtractions: failed.length,
      successful,
      failed,
      metadata: {
        processingTime,
        averageTimePerCard: Math.round(processingTime / detection.count),
        detectionConfidence: detection.confidence,
        layout: detection.layout
      }
    };
    
  } catch (error) {
    console.error('❌ Floor scan failed:', error);
    return {
      success: false,
      error: error.message,
      totalCards: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      successful: [],
      failed: []
    };
  }
}

/**
 * Process a single cropped brainrot card
 * @param {Blob} cardImage - Cropped card image
 * @param {number} cardIndex - Index in the floor
 * @param {number} cardId - ID from detection
 * @param {number} detectionConfidence - Confidence from card detection
 * @param {Array} brainrotsDatabase
 * @returns {Promise<object>}
 */
async function processSingleCard(cardImage, cardIndex, cardId, detectionConfidence, brainrotsDatabase) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Processing Card #${cardIndex + 1} (ID: ${cardId})...`);
    
    // Convert blob to base64 for storage
    const imageData = await blobToBase64(cardImage);
    
    // Try Vision extraction first (more accurate, via proxy server)
    let visionResult = null;
    let usedVision = false;
    
    console.log('🤖 Trying Claude Vision extraction...');
    visionResult = await extractBrainrotFromImage(cardImage, brainrotsDatabase);
      
    if (visionResult.success) {
      usedVision = true;
      console.log('✅ Vision extraction successful!');
      
      // Verify AI results against database and income calculator
      const verification = verifyVisionResult(visionResult, visionResult.matchedBrainrot);
      
      // Use vision results
      const parsedText = {
        name: visionResult.extractedData.name,
        mutation: visionResult.extractedData.mutation === 'none' ? null : visionResult.extractedData.mutation,
        rarity: visionResult.extractedData.rarity,
        income: visionResult.extractedData.income_value || null
      };
      
      const matchResult = {
        match: visionResult.matchedBrainrot,
        confidence: visionResult.matchConfidence,
        method: visionResult.matchMethod
      };
      
      const modifierResult = {
        traits: visionResult.extractedData.modifier_icons || [],
        confidence: visionResult.extractedData.confidence || 0.9,
        method: 'vision'
      };
      
      // Use adjusted confidence from verification
      const baseConfidence = (detectionConfidence + visionResult.confidence.overall) / 2;
      const verifiedConfidence = baseConfidence * (verification.adjustedConfidence / visionResult.confidence.extraction);
      
      const confidence = {
        detection: detectionConfidence,
        vision: visionResult.confidence.extraction,
        nameMatch: visionResult.confidence.matching,
        modifiers: modifierResult.confidence,
        verification: verification.adjustedConfidence,
        overall: verifiedConfidence
      };
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Card #${cardIndex + 1} complete (VISION):`, {
        name: matchResult.match.name,
        mutation: parsedText.mutation || 'none',
        traits: modifierResult.traits.length,
        confidence: Math.round(confidence.overall * 100) + '%',
        verified: verification.passed,
        warnings: verification.warnings.length,
        time: processingTime + 'ms'
      });
      
      // Log verification warnings
      if (verification.warnings.length > 0) {
        verification.warnings.forEach(w => {
          console.warn(`⚠️ ${w.type}: ${w.message}`);
        });
      }
      
      return {
        success: true,
        cardIndex,
        cardId,
        imageData,
        parsedText,
        matchedBrainrot: matchResult.match,
        matchMethod: matchResult.method,
        detectedModifiers: modifierResult,
        confidence,
        verification: {
          passed: verification.passed,
          warnings: verification.warnings
        },
        metadata: {
          processingTime,
          method: 'vision',
          modifierMethod: 'vision',
          verified: verification.passed
        }
      };
    } else {
      console.warn('⚠️ Vision extraction failed, falling back to OCR:', visionResult.error);
    }
    
    // Fallback to OCR method
    console.log('📄 Using OCR extraction...');
    const ocrResult = await extractTextFromImage(cardImage);
    
    if (ocrResult.confidence < 0.2) {
      throw new Error(`OCR confidence too low: ${Math.round(ocrResult.confidence * 100)}%`);
    }
    
    // Parse: Extract brainrot data (including mutation)
    const parsedText = parseExtractedText(ocrResult);
    
    console.log('📋 Parsed data:', {
      name: parsedText.name,
      mutation: parsedText.mutation,
      rarity: parsedText.rarity,
      income: parsedText.income
    });
    
    if (!parsedText.name) {
      throw new Error('Could not extract brainrot name from OCR text');
    }
    
    // Match: Find in database
    const matchResult = matchBrainrot(parsedText.name, brainrotsDatabase);
    
    if (!matchResult.match) {
      throw new Error(`No database match for "${parsedText.name}" (tried exact, fuzzy, and word-based matching)`);
    }
    
    console.log(`✅ Matched to: ${matchResult.match.name} (method: ${matchResult.method})`);
    
    // Detect Modifiers/Traits: Analyze icons at top of card
    let modifierResult = { traits: [], confidence: 0, method: 'skipped' };
    try {
      modifierResult = await detectModifiers(cardImage);
      if (modifierResult.traits.length > 0) {
        console.log(`🎨 Detected ${modifierResult.traits.length} modifier(s):`, modifierResult.traits);
      }
    } catch (modError) {
      console.warn('⚠️ Modifier detection skipped:', modError.message);
    }
    
    // Calculate confidence scores
    const parseConfidence = calculateParseConfidence(parsedText);
    const confidence = {
      detection: detectionConfidence,
      ocr: ocrResult.confidence,
      nameMatch: matchResult.confidence,
      parsing: parseConfidence.overall,
      modifiers: modifierResult.confidence,
      overall: calculateOverallConfidence({
        detection: detectionConfidence,
        ocr: ocrResult.confidence,
        nameMatch: matchResult.confidence,
        parsing: parseConfidence.overall,
        modifiers: modifierResult.confidence || 0
      })
    };
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Card #${cardIndex + 1} complete (OCR):`, {
      name: matchResult.match.name,
      mutation: parsedText.mutation || 'none',
      traits: modifierResult.traits.length,
      confidence: Math.round(confidence.overall * 100) + '%',
      time: processingTime + 'ms'
    });
    
    return {
      success: true,
      cardIndex,
      cardId,
      imageData,
      parsedText,
      matchedBrainrot: matchResult.match,
      matchMethod: matchResult.method,
      alternatives: matchResult.alternatives,
      detectedModifiers: modifierResult,
      confidence,
      metadata: {
        processingTime,
        method: 'ocr',
        ocrLines: ocrResult.lines.length,
        modifierMethod: modifierResult.method
      }
    };
    
  } catch (error) {
    console.error(`❌ Card #${cardIndex + 1} failed:`, error.message);
    
    // Return partial data for manual review
    const imageData = await blobToBase64(cardImage).catch(() => null);
    
    return {
      success: false,
      cardIndex,
      cardId,
      error: error.message,
      imageData, // For manual review
      metadata: {
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Calculate overall confidence from component scores
 */
function calculateOverallConfidence({ detection, ocr, nameMatch, parsing, modifiers }) {
  const weights = {
    detection: 0.15,
    ocr: 0.20,
    nameMatch: 0.40,
    parsing: 0.20,
    modifiers: 0.05
  };
  
  return (
    detection * weights.detection +
    ocr * weights.ocr +
    nameMatch * weights.nameMatch +
    parsing * weights.parsing +
    (modifiers || 0) * weights.modifiers
  );
}

/**
 * Convert Blob to base64 data URL
 */
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

