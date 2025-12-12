/**
 * Modifier Detection Service - Detect trait icons on brainrot cards
 * Uses Claude Vision API to identify modifier icons at top of cards
 */

import { TRAITS } from '../utils/incomeCalculator';

/**
 * Detect modifier/trait icons on a brainrot card
 * @param {Blob} cardImage - Cropped card image
 * @returns {Promise<{traits: Array<string>, confidence: number}>}
 */
export async function detectModifiers(cardImage) {
  console.log('🔍 Starting modifier detection...');
  
  try {
    // Crop top portion of image (where icons are)
    const croppedTop = await cropTopPortion(cardImage, 100); // Top 100px
    const base64Image = await imageToBase64(croppedTop);

    console.log('🤖 Using Claude to detect modifier icons...');

    // Use proxy server to bypass CORS (API key is on server)
    const PROXY_URL = 'http://localhost:3001/api/claude';
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
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
              text: `Analyze this cropped section from a "Steal a Brainrot" game card.

Look for small ICON symbols at the very top. These are game modifiers/traits.

Common modifier icons:
- Country flags (🇧🇷, 🇺🇸, 🇲🇽, etc.)
- Food items (🌮 taco, 🍓 strawberry, 🎃 pumpkin, etc.)
- Holiday symbols (🎅 santa, ❄️ snowflake, etc.)
- Effects (⭐ star, 💎 diamond icon, 🔥 fire icon, etc.)

CRITICAL: Only count ICONS, not the 3D character's appearance!

Respond in JSON:
{
  "icon_count": <number>,
  "icons": ["icon_name", ...],
  "confidence": <0.0-1.0>,
  "description": "Brief description of what you see"
}`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Modifier API error: ${response.status}`);
      return { traits: [], confidence: 0, method: 'api_error' };
    }

    const result = await response.json();
    const textContent = result.content[0].text;
    
    // Parse JSON
    let jsonText = textContent;
    if (textContent.includes('```')) {
      const match = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) jsonText = match[1];
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Map detected icons to our trait keys
    const mappedTraits = mapIconsToTraits(parsed.icons);
    
    console.log('✅ Modifier detection:', {
      detected: parsed.icon_count,
      mapped: mappedTraits.length,
      confidence: parsed.confidence
    });

    return {
      traits: mappedTraits,
      iconCount: parsed.icon_count,
      rawIcons: parsed.icons,
      confidence: parsed.confidence,
      method: 'ai',
      description: parsed.description
    };
    
  } catch (error) {
    console.warn('⚠️ Modifier detection failed:', error.message);
    return { traits: [], confidence: 0, method: 'error', error: error.message };
  }
}

/**
 * Map detected icon names to trait keys in our database
 */
function mapIconsToTraits(icons) {
  if (!icons || icons.length === 0) return [];
  
  const traitKeys = Object.keys(TRAITS);
  const mapped = [];
  
  for (const icon of icons) {
    const iconLower = icon.toLowerCase();
    
    // Try exact match
    const exactMatch = traitKeys.find(key => 
      key.toLowerCase() === iconLower || 
      TRAITS[key].name.toLowerCase() === iconLower
    );
    
    if (exactMatch) {
      mapped.push(exactMatch);
      continue;
    }
    
    // Try partial match (e.g., "brazil flag" -> "flag_brazil")
    const partialMatch = traitKeys.find(key => {
      const traitName = TRAITS[key].name.toLowerCase();
      return traitName.includes(iconLower) || iconLower.includes(traitName);
    });
    
    if (partialMatch) {
      mapped.push(partialMatch);
    }
  }
  
  return mapped;
}

/**
 * Crop top portion of image where modifier icons appear
 */
async function cropTopPortion(imageBlob, height = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = Math.min(height, img.height);
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(resolve, 'image/png');
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Convert image to base64
 */
async function imageToBase64(image) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
}

