/**
 * Vision Extraction Service - Use Claude Vision to extract brainrot data directly from image
 * More accurate than OCR since it can see visual elements (mutations, colors, icons)
 */

import { matchBrainrot } from './brainrotMatcher';

/**
 * Extract brainrot information directly from card image using Claude Vision
 * @param {Blob} cardImage - Cropped card image
 * @param {Array} brainrotsDatabase - Database for matching
 * @returns {Promise<object>}
 */
export async function extractBrainrotFromImage(cardImage, brainrotsDatabase) {
  console.log('🤖 Using Claude Vision to extract brainrot info...');
  
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(cardImage);

    // Use proxy server to bypass CORS (API key is on server)
    const PROXY_URL = 'http://localhost:3001/api/claude';
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
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
              text: `You are analyzing a brainrot character card from "Steal a Brainrot" game.

Extract the following information with EXTREME PRECISION:

1. **Character Name** (at top of card)
   - Read the EXACT text, letter by letter
   - Common names: "La Jolly Grande", "La Spooky Grande", "Dul Dul Dul", "Reindeer Tralala", "Los Tralaleritos"
   - Names are usually 2-4 words in English, Spanish, or made-up words
   - **DO NOT guess** - if unclear, set confidence lower
   
2. **Rarity** (text label below name)
   - Options: "Secret", "Brainrot God", "OG", "Legendary", "Mythic", "Epic", "Rare", "Common"
   
3. **Mutation** (colored/glowing text effect on the card or label)
   - Look for special visual effects or text labels
   - Options: "Radioactive", "Diamond", "Gold", "Rainbow", "Galaxy", "Lava", "Yin Yang", "Bloodmoon", "Celestial", "Candy", "Halloween"
   - If no special effect visible, use "none"
   
4. **Income** (yellow text with $/s)
   - Format: "$30M/s", "$375K/s", "$1.5B/s"
   - Extract both formatted string and numeric value
   
5. **Modifier Icons** (small icons at very top of card)
   - Only count actual icon symbols (flags, food, items)
   - Ignore the 3D character model itself

CRITICAL RULES:
- Read character name EXACTLY as written - spelling matters!
- If name is partially cut off, note in confidence
- Don't confuse similar names (e.g., "La Jolly Grande" ≠ "La Spooky Grande")
- Set confidence lower if text is blurry or cut off

Return ONLY valid JSON (no markdown):
{
  "name": "Exact Character Name As Written",
  "rarity": "secret|brainrot_god|og|legendary|mythic|epic|rare|common",
  "mutation": "radioactive|diamond|gold|rainbow|galaxy|lava|yin_yang|bloodmoon|celestial|candy|halloween|none",
  "income_per_second": "$30M/s",
  "income_value": 30000000,
  "modifier_icons": ["icon_name1", "icon_name2"],
  "confidence": 0.95,
  "notes": "Brief notes on extraction quality"
}`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const textContent = result.content[0].text;
    
    // Parse JSON (handle markdown code blocks)
    let jsonText = textContent;
    if (textContent.includes('```')) {
      const match = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) jsonText = match[1];
    }
    
    const extracted = JSON.parse(jsonText);
    
    console.log('✅ Claude Vision extraction:', {
      name: extracted.name,
      mutation: extracted.mutation,
      modifiers: extracted.modifier_icons?.length || 0,
      confidence: extracted.confidence
    });

    // Match to database
    const matchResult = matchBrainrot(extracted.name, brainrotsDatabase);
    
    if (!matchResult.match) {
      throw new Error(`No database match for "${extracted.name}"`);
    }

    console.log(`✅ Matched to: ${matchResult.match.name} (${matchResult.method})`);

    return {
      success: true,
      extractedData: extracted,
      matchedBrainrot: matchResult.match,
      matchMethod: matchResult.method,
      matchConfidence: matchResult.confidence,
      confidence: {
        extraction: extracted.confidence,
        matching: matchResult.confidence,
        overall: (extracted.confidence + matchResult.confidence) / 2
      }
    };
    
  } catch (error) {
    console.error('❌ Vision extraction failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
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

