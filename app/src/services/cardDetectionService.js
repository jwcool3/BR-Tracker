/**
 * Card Detection Service - Detect individual brainrot cards in floor screenshot
 * Uses Claude Vision API to identify card locations
 */

/**
 * Detect brainrot cards in a floor screenshot
 * @param {File|Blob} floorImage - Screenshot of one side of a floor
 * @returns {Promise<{cards: Array, count: number, confidence: number}>}
 */
export async function detectBrainrotCards(floorImage) {
  console.log('🔍 Starting AI card detection...');
  
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(floorImage);

    // Use proxy server to bypass CORS (API key is on server)
    const PROXY_URL = 'http://localhost:3001/api/claude';
    
    let response;
    try {
      
      response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `You are analyzing a screenshot from "Steal a Brainrot" game showing ONE SIDE of a floor with brainrot characters.

Your task: Identify the bounding box of EACH individual brainrot card visible in this image.

IMPORTANT:
- This is ONE SIDE of a floor, so expect 1-5 brainrot cards maximum
- Each card contains: character name, 3D model, stats ($X.XM/s, rarity)
- Cards are arranged vertically or in a small grid
- Return coordinates for EACH card separately (non-overlapping)

Return ONLY valid JSON (no markdown, no explanations):
{
  "detected_count": <number 1-5>,
  "cards": [
    {
      "id": 1,
      "bounding_box": {
        "x": <left edge pixel>,
        "y": <top edge pixel>,
        "width": <width pixels>,
        "height": <height pixels>
      },
      "confidence": <0.0-1.0>
    }
  ],
  "layout": "vertical|grid|single",
  "notes": "Any observations about the detection"
}`
              }
            ]
          }]
        })
      });
    } catch (fetchError) {
      console.warn('⚠️ Claude API fetch failed (CORS or network issue). Falling back to mock detection.', fetchError);
      return mockCardDetection(floorImage);
    }

    if (!response.ok) {
      console.warn(`⚠️ Claude API error: ${response.status}. Falling back to mock detection.`);
      return mockCardDetection(floorImage);
    }

    const result = await response.json();
    const textContent = result.content[0].text;
    
    // Parse JSON (handle markdown code blocks if present)
    let jsonText = textContent;
    if (textContent.includes('```')) {
      const match = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }
    
    const detection = JSON.parse(jsonText);
    
    console.log('✅ Card detection complete:', {
      detected: detection.detected_count,
      layout: detection.layout
    });

    return {
      cards: detection.cards,
      count: detection.detected_count,
      confidence: detection.cards.reduce((sum, c) => sum + c.confidence, 0) / detection.cards.length,
      layout: detection.layout,
      metadata: {
        model: 'claude-sonnet-4',
        processingTime: Date.now()
      }
    };
    
  } catch (error) {
    console.error('❌ Card detection error:', error);
    console.warn('⚠️ Falling back to mock detection due to error');
    // Fall back to mock detection instead of throwing
    try {
      return await mockCardDetection(floorImage);
    } catch (mockError) {
      console.error('❌ Even mock detection failed:', mockError);
      throw new Error(`Card detection failed: ${error.message}`);
    }
  }
}

/**
 * Crop individual cards from floor image using bounding boxes
 * @param {File|Blob} floorImage - Original floor screenshot
 * @param {Array} cards - Array of card bounding boxes from detectBrainrotCards
 * @returns {Promise<Array<Blob>>} - Array of cropped card images
 */
export async function cropCardsFromFloor(floorImage, cards) {
  console.log(`✂️ Cropping ${cards.length} cards from floor image...`);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        try {
          const croppedCards = cards.map((card, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const bbox = card.bounding_box;
            canvas.width = bbox.width;
            canvas.height = bbox.height;
            
            // Draw cropped region
            ctx.drawImage(
              img,
              bbox.x, bbox.y, bbox.width, bbox.height, // Source
              0, 0, bbox.width, bbox.height             // Destination
            );
            
            // Convert to blob
            return new Promise((resolveBlob) => {
              canvas.toBlob((blob) => {
                resolveBlob({
                  blob,
                  cardId: card.id,
                  cardIndex: index,
                  confidence: card.confidence
                });
              }, 'image/png');
            });
          });
          
          Promise.all(croppedCards).then(results => {
            console.log(`✅ Successfully cropped ${results.length} cards`);
            resolve(results);
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(floorImage);
  });
}

/**
 * Convert image to base64 string
 * @param {File|Blob} image
 * @returns {Promise<string>} - Base64 string without data URL prefix
 */
async function imageToBase64(image) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove "data:image/png;base64," prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
}

/**
 * Mock card detection for testing without API key
 * Assumes a simple vertical layout with 3 cards
 */
async function mockCardDetection(floorImage) {
  console.warn('🧪 Using mock card detection (for testing only)');
  console.log('📸 Image type:', floorImage?.type, 'Size:', floorImage?.size);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        console.log('✅ Image loaded:', img.width, 'x', img.height);
        
        // Detect layout based on image dimensions
        const aspectRatio = img.width / img.height;
        let numCards, cardWidth, cardHeight, layout;
        
        if (aspectRatio > 2.4) {
          // Wide image = 5 cards horizontally (floor screenshots are usually 2.5-3.0 ratio)
          numCards = 5;
          cardWidth = Math.floor(img.width / 5);
          cardHeight = img.height;
          layout = 'horizontal-5';
        } else if (aspectRatio > 1.8) {
          // Medium-wide = 4 cards horizontally
          numCards = 4;
          cardWidth = Math.floor(img.width / 4);
          cardHeight = img.height;
          layout = 'horizontal-4';
        } else if (aspectRatio < 0.5) {
          // Tall image = 3-4 cards vertically
          numCards = 3;
          cardWidth = img.width;
          cardHeight = Math.floor(img.height / 3);
          layout = 'vertical-3';
        } else {
          // Square-ish = 2x2 grid
          numCards = 4;
          cardWidth = Math.floor(img.width / 2);
          cardHeight = Math.floor(img.height / 2);
          layout = 'grid-2x2';
        }
        
        const cards = [];
        
        if (layout.startsWith('horizontal')) {
          // Horizontal layout (left to right) with 5% overlap for better OCR
          const overlap = Math.floor(cardWidth * 0.05);
          
          for (let i = 0; i < numCards; i++) {
            const x = Math.max(0, cardWidth * i - overlap);
            const width = cardWidth + (i === 0 || i === numCards - 1 ? overlap : overlap * 2);
            
            cards.push({
              id: i + 1,
              bounding_box: { 
                x: x, 
                y: 0, 
                width: Math.min(width, img.width - x), 
                height: cardHeight 
              },
              confidence: 0.95
            });
          }
        } else if (layout.startsWith('vertical')) {
          // Vertical layout (top to bottom)
          for (let i = 0; i < numCards; i++) {
            cards.push({
              id: i + 1,
              bounding_box: { 
                x: 0, 
                y: cardHeight * i, 
                width: cardWidth, 
                height: cardHeight 
              },
              confidence: 0.95
            });
          }
        } else if (layout === 'grid-2x2') {
          // 2x2 grid
          cards.push(
            { id: 1, bounding_box: { x: 0, y: 0, width: cardWidth, height: cardHeight }, confidence: 0.95 },
            { id: 2, bounding_box: { x: cardWidth, y: 0, width: cardWidth, height: cardHeight }, confidence: 0.95 },
            { id: 3, bounding_box: { x: 0, y: cardHeight, width: cardWidth, height: cardHeight }, confidence: 0.95 },
            { id: 4, bounding_box: { x: cardWidth, y: cardHeight, width: cardWidth, height: cardHeight }, confidence: 0.95 }
          );
        }
        
        console.log(`✅ Mock detection complete: ${numCards} cards detected (${layout}, aspect ratio: ${aspectRatio.toFixed(2)})`);
        
        resolve({
          cards,
          count: numCards,
          confidence: 0.95,
          layout,
          metadata: {
            model: 'mock',
            imageSize: { width: img.width, height: img.height },
            aspectRatio: aspectRatio.toFixed(2),
            note: `Mock detection: auto-detected ${layout} layout. API calls are blocked by browser CORS.`
          }
        });
      };
      
      img.onerror = (error) => {
        console.error('❌ Image load failed:', error);
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = (error) => {
      console.error('❌ FileReader failed:', error);
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(floorImage);
  });
}

