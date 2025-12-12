/**
 * OCR Service - Extract text from brainrot card images
 * Uses Tesseract.js for offline text recognition
 */

import Tesseract from 'tesseract.js';

/**
 * Extract text from a single brainrot card image
 * @param {File|Blob|string} imageSource - Image to process (File, Blob, or base64)
 * @returns {Promise<{raw: string, confidence: number, lines: string[]}>}
 */
export async function extractTextFromImage(imageSource) {
  try {
    console.log('🔍 Starting OCR extraction...');
    
    const { data } = await Tesseract.recognize(
      imageSource,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        // Optimize for game UI text (names, numbers, currency)
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,/():% ',
      }
    );

    const lines = data.text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean); // Remove empty lines

    console.log('✅ OCR Complete:', {
      confidence: data.confidence,
      linesFound: lines.length
    });

    return {
      raw: data.text,
      confidence: data.confidence / 100, // Convert to 0-1 range
      lines
    };
    
  } catch (error) {
    console.error('❌ OCR failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from multiple images in parallel
 * @param {Array<File|Blob|string>} images - Array of images to process
 * @returns {Promise<Array<{raw: string, confidence: number, lines: string[], index: number}>>}
 */
export async function extractTextFromMultipleImages(images) {
  console.log(`🔍 Starting batch OCR for ${images.length} images...`);
  
  const startTime = Date.now();
  
  try {
    const results = await Promise.all(
      images.map(async (image, index) => {
        try {
          const result = await extractTextFromImage(image);
          return {
            ...result,
            index,
            success: true
          };
        } catch (error) {
          console.error(`❌ OCR failed for image ${index}:`, error);
          return {
            index,
            success: false,
            error: error.message
          };
        }
      })
    );

    const processingTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    console.log(`✅ Batch OCR Complete:`, {
      total: images.length,
      successful: successCount,
      failed: images.length - successCount,
      timeMs: processingTime,
      avgPerImage: Math.round(processingTime / images.length)
    });

    return results;
    
  } catch (error) {
    console.error('❌ Batch OCR failed:', error);
    throw new Error('Failed to process multiple images');
  }
}

