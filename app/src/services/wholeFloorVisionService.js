/**
 * Whole Floor Vision Service
 * Sends entire floor screenshot to Claude to extract ALL brainrots at once
 * More accurate than cropping individual cards!
 */

import { matchBrainrot } from './brainrotMatcher';
import { verifyVisionResult } from './visionVerificationService';

/**
 * Extract ALL brainrots from entire floor image using Claude Vision
 * @param {File} floorImage - Full floor screenshot
 * @param {Array} brainrotsDatabase - Database for matching
 * @returns {Promise<object>}
 */
export async function extractAllBrainrotsFromFloor(floorImage, brainrotsDatabase) {
  console.log('🖼️ Analyzing ENTIRE floor image with Claude Vision...');
  
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(floorImage);

    // Use proxy server
    const PROXY_URL = 'http://localhost:3001/api/claude';
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
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
              text: `You are analyzing a floor screenshot from "Steal a Brainrot" game showing MULTIPLE brainrot characters.

Your task: Extract information about EVERY brainrot visible in this image.

📋 VISUAL HIERARCHY (top to bottom on each card):
1. **VERY TOP:** Modifier icons (tiny symbols like 🔥 🌮 🍓 ❄️) ← CHECK HERE FIRST!
2. **Below icons:** Mutation text label (e.g., "Radioactive", "Rainbow") ← IF PRESENT
3. **Below mutation:** Brainrot name (e.g., "La Vacca Prese Presente")
4. **Below name:** Rarity (e.g., "Secret", "Brainrot God")
5. **Below rarity:** Income (e.g., "$600K/s")

⚠️ IMPORTANT: Modifier icons can appear WITH or WITHOUT mutation text!
- Card with fire icon + "Rainbow" text = fire modifier + rainbow mutation
- Card with fire icon + NO mutation text = fire modifier + no mutation
- ALWAYS check for icons at the VERY TOP first!

CRITICAL INSTRUCTIONS:
1. **SCAN LEFT TO RIGHT** - Look at EVERY character position (1, 2, 3, 4, 5)
2. **COUNT ALL BRAINROTS** - Floors typically have 4-5 characters
3. **INCLUDE DUPLICATES** - If you see TWO "Dul Dul Dul" characters, report BOTH separately with different positions
4. **Read names EXACTLY** - Letter by letter, word by word
5. **DISTINGUISH between mutations and modifiers** - These are DIFFERENT!

⚠️ IMPORTANT: Same-named brainrots are DIFFERENT characters if they're in different positions!
Example: Position 4 = "Dul Dul Dul" AND Position 5 = "Dul Dul Dul" (report BOTH!)

Common brainrot names you might see:
- "La Jolly Grande", "La Spooky Grande", "La Grand Combination"
- "Dul Dul Dul", "Los Tralaleritos", "Tralalita Tralala"
- "Reindeer Tralala" (Christmas event)
- And many others

For EACH brainrot, extract:

1. **Name**: Exact character name (2-4 words)

2. **Rarity**: Text label below name
   - Options: "Secret", "Brainrot God", "OG", "Legendary", "Mythic", "Epic", "Rare", "Common"

3. **Mutation**: THIS HAS A TEXT LABEL! Look ABOVE the brainrot name for mutation text
   - 🚨 CRITICAL: Mutations display a TEXT LABEL above the character's name (e.g., "Radioactive", "Diamond", "Gold")
   - ALWAYS read the text label first - it's the authoritative source!
   - If there's NO text label above the name, the mutation is "none"
   
   **How to identify:**
   1. Look for TEXT above the brainrot name (between any modifier icons and the name)
   2. The text will say: "Radioactive", "Rainbow", "Diamond", "Gold", "Galaxy", etc.
   3. If you see the text, use that mutation name (lowercase: "radioactive", "rainbow", etc.)
   4. If NO text label exists, use "none"
   
   **COMPLETE LIST of mutation text labels you might see:**
     • "Radioactive" → mutation: "radioactive"
     • "Rainbow" → mutation: "rainbow"
     • "Yin Yang" → mutation: "yin_yang"
     • "Galaxy" → mutation: "galaxy"
     • "Lava" → mutation: "lava"
     • "Celestial" → mutation: "celestial"
     • "Candy" → mutation: "candy"
     • "Bloodmoon" → mutation: "bloodmoon"
     • "Diamond" → mutation: "diamond"
     • "Gold" → mutation: "gold"
     • "Halloween" → mutation: "halloween"
     • No label visible → mutation: "none"
   
   ⚠️ **DO NOT** confuse character color with mutation!
   - Gold-colored character ≠ "gold" mutation (unless text says "Gold")
   - Green character ≠ "radioactive" mutation (unless text says "Radioactive")
   - The TEXT LABEL is the ONLY reliable indicator!

4. **Income**: Yellow text with $/s (e.g., "$30M/s", "$500K/s")

5. **Trait/Modifier Icons**: ONLY count TINY ICONS at the VERY TOP of the card, ABOVE ALL TEXT
   - 🚨 Location: In a horizontal ROW at the ABSOLUTE TOP of the card
   - ABOVE mutation text (e.g., "Rainbow") if present
   - ABOVE the brainrot name
   - ABOVE all other text
   - Size: Very small (15-30 pixels), like emoji symbols
   - 🔍 CHECK THE VERY TOP EDGE OF EACH CARD CAREFULLY!
   - COMPLETE LIST OF POSSIBLE MODIFIER ICONS TO LOOK FOR:
   
   **OG Event (Rarest):**
     • "strawberry" 🍓 - Strawberry icon
     • "meowl" 🦉 - Owl/cat hybrid icon
   
   **Seasonal Events:**
     • "jack_o_lantern" 🎃 - Pumpkin/Jack-o-lantern
     • "santa_hat" 🎅 - Santa hat
     • "rip_tombstone" 🪦 - Tombstone
     • "witching_hour" 🧙 - Witch hat
     • "extinct" 🦴 - Bone/dinosaur
     • "ten_b" 🎂 - Birthday cake/10B
   
   **Admin Event:**
     • "paint" 🎨 - Paint palette
     • "brazil" 🇧🇷 - Brazil flag
     • "fire" 🔥 - Fire icon
     • "fireworks" 🎆 - Fireworks
     • "nyan" 🌈 - Rainbow/Nyan cat
     • "lightning" ⚡ - Lightning bolt
     • "indonesian" 🇮🇩 - Indonesian flag
     • "sombrero" 🤠 - Cowboy/sombrero hat
     • "disco" 🕺 - Disco dancer
     • "glitched" ⚠️ - Glitch/warning symbol
     • "crab_claw" 🦀 - Crab claw
     • "zombie" 🧟 - Zombie
     • "tie" 👔 - Necktie
     • "matteo_hat" 🧢 - Baseball cap
     • "galactic" ☄️ - Comet/meteor
     • "explosive" 💣 - Bomb
     • "shark_fin" 🦈 - Shark fin
     • "bubblegum" 🍬 - Candy/bubblegum
     • "spider" 🕷️ - Spider
     • "ufo" 🛸 - UFO/spaceship
     • "taco" 🌮 - Taco
   
   **Natural Events:**
     • "cometstruck" 💫 - Star/comet struck
     • "snowy" ❄️ - Snowflake
     • "wet" 🌧️ - Rain cloud
   
   **Negative:**
     • "sleepy" 💤 - Sleep/ZZZ symbol
   
   - DO NOT count the character's appearance (if character looks like a taco, that's NOT a modifier icon)
   - DO NOT count mutation effects as modifier icons
   - DO NOT count rarity text or income text as icons
   - If you don't see clear TINY ICONS at the very top, use empty array []
   - BE CONSERVATIVE - only list icons you are 100% certain about
   - Use the KEY NAMES from the list above (e.g., "shark_fin" not "shark")

6. **Position**: 1=leftmost, 2=second from left, etc.

CRITICAL RULES:
1. **READ NAMES EXACTLY** - Spelling matters!
2. **MUTATIONS = TEXT LABEL** - Look for text ABOVE the name (e.g., "Radioactive", "Gold")
   - If NO text label = mutation is "none"
   - DO NOT guess mutation from character color!
3. **MODIFIERS = TINY ICONS** - At VERY TOP, above mutation text and name
   - Small emoji-like symbols (🎨 🌮 🍓 ❄️)
   - If NO tiny icons = empty array []
4. **BE CAREFUL** - Don't confuse character color with mutations!
   - Gold character ≠ gold mutation (unless text says "Gold")
   - Green character ≠ radioactive (unless text says "Radioactive")

Return ONLY valid JSON (no markdown):
{
  "total_brainrots": <number of characters detected, counting duplicates>,
  "brainrots": [
    {
      "position": 1,
      "name": "Exact Name",
      "rarity": "secret|brainrot_god|og|legendary|mythic|epic|rare|common",
      "mutation": "radioactive|diamond|gold|rainbow|galaxy|lava|yin_yang|bloodmoon|celestial|candy|halloween|none",
      "income_per_second": "$30M/s",
      "income_value": 30000000,
      "modifier_icons": [],
      "has_visible_mutation_effect": false,
      "has_visible_modifier_icons": false,
      "confidence": 0.95,
      "notes": "Brief description of what you see (mutation glow? icon symbols?)"
    }
  ],
  "layout": "horizontal|vertical|grid",
  "overall_confidence": 0.93,
  "notes": "Overall observations about the floor"
}

EXAMPLE 1 - Character WITH mutation text label:
{
  "position": 1,
  "name": "Gralpuss Medussi",
  "rarity": "secret",
  "mutation": "radioactive",
  "has_visible_mutation_effect": true,
  "income_per_second": "$8.5M/s",
  "income_value": 8500000,
  "modifier_icons": [],
  "has_visible_modifier_icons": false,
  "confidence": 0.98,
  "notes": "TEXT LABEL says 'Radioactive' above name. Character has green glow. No modifier icons."
}

EXAMPLE 2 - Gold-colored character, but NO mutation text (so mutation = "none"):
{
  "position": 2,
  "name": "La Vacca Prese Presente",
  "rarity": "secret",
  "mutation": "none",
  "has_visible_mutation_effect": false,
  "income_per_second": "$600K/s",
  "income_value": 600000,
  "modifier_icons": [],
  "has_visible_modifier_icons": false,
  "confidence": 0.95,
  "notes": "NO text label above name = no mutation. Character appears gold-colored but that's just the model, not a mutation!"
}

EXAMPLE 3 - Character HAS modifier icons, NO mutation text:
{
  "position": 3,
  "name": "Girafa Celestre",
  "rarity": "brainrot_god",
  "mutation": "none",
  "has_visible_mutation_effect": false,
  "income_per_second": "$100K/s",
  "income_value": 100000,
  "modifier_icons": ["santa_hat"],
  "has_visible_modifier_icons": true,
  "confidence": 0.93,
  "notes": "NO mutation text above name. Has santa hat icon at very top. Orange/yellow character color is just the model."
}

EXAMPLE 4 - Character HAS BOTH modifier icon AND mutation text:
{
  "position": 4,
  "name": "Las Tralaleritas",
  "rarity": "secret",
  "mutation": "rainbow",
  "has_visible_mutation_effect": true,
  "income_per_second": "$9.7M/s",
  "income_value": 9700000,
  "modifier_icons": ["fire"],
  "has_visible_modifier_icons": true,
  "confidence": 0.94,
  "notes": "Fire icon 🔥 at VERY TOP. Below that: 'Rainbow' mutation text. Below that: name. Has both modifier AND mutation!"
}

EXAMPLE 5 - DUPLICATE BRAINROT (same name, different position):
⚠️ CRITICAL: If you see TWO identical brainrots, report BOTH!
{
  "position": 5,
  "name": "Dul Dul Dul",
  "rarity": "secret",
  "mutation": "none",
  "has_visible_mutation_effect": false,
  "income_per_second": "$375K/s",
  "income_value": 375000,
  "modifier_icons": [],
  "has_visible_modifier_icons": false,
  "confidence": 0.98,
  "notes": "First Dul Dul Dul at position 5."
}
AND ALSO (if there's another one):
{
  "position": 6,
  "name": "Dul Dul Dul",
  "rarity": "secret",
  "mutation": "none",
  "has_visible_mutation_effect": false,
  "income_per_second": "$375K/s",
  "income_value": 375000,
  "modifier_icons": [],
  "has_visible_modifier_icons": false,
  "confidence": 0.98,
  "notes": "Another Dul Dul Dul at position 6. Same character, different position!"
}

🚨 FINAL REMINDERS:
- SCAN the entire image LEFT TO RIGHT
- COUNT every character you see (typically 4-5)
- REPORT duplicates separately (same name = still different characters!)
- DON'T skip any positions
- Each character gets its own object in the "brainrots" array

**MUTATIONS:** Look for TEXT LABEL above name, NOT character color!
- Text says "Radioactive" → mutation: "radioactive"
- Text says "Rainbow" → mutation: "rainbow"
- NO text above name → mutation: "none"
- Gold-colored character without "Gold" text = mutation: "none"!

**MODIFIERS:** Check the VERY TOP EDGE of each card!
- Tiny icons 🔥 🌮 🍓 ❄️ appear at the ABSOLUTE TOP
- They can appear WITH mutation text (e.g., Fire icon + "Rainbow" text)
- They can appear WITHOUT mutation text
- ALWAYS scan the top edge for icons, even if there's mutation text below!

If you see 5 characters, you should have 5 objects in the array, even if some have the same name!`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
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
    
    console.log(`✅ Claude extracted ${extracted.total_brainrots} brainrots from floor!`);
    console.log(`📊 Brainrots in array: ${extracted.brainrots?.length || 0}`);
    
    // Log all detected brainrots
    if (extracted.brainrots) {
      extracted.brainrots.forEach((br, idx) => {
        console.log(`   ${idx + 1}. Position ${br.position}: ${br.name} (${br.rarity})`);
      });
    }
    console.log('   Layout:', extracted.layout);
    console.log('   Overall confidence:', Math.round(extracted.overall_confidence * 100) + '%');

    // Match each brainrot to database
    const processedBrainrots = [];
    
    for (let i = 0; i < extracted.brainrots.length; i++) {
      const brainrot = extracted.brainrots[i];
      console.log(`\n📋 Processing brainrot #${brainrot.position}: ${brainrot.name}`);
      
      try {
        // Match to database
        const matchResult = matchBrainrot(brainrot.name, brainrotsDatabase);
        
        if (!matchResult.match) {
          console.warn(`⚠️ No database match for "${brainrot.name}"`);
          processedBrainrots.push({
            success: false,
            error: `No database match for "${brainrot.name}"`,
            extractedData: brainrot,
            position: brainrot.position
          });
          continue;
        }
        
        console.log(`✅ Matched to: ${matchResult.match.name} (${matchResult.method})`);
        
        // Log what AI detected
        console.log(`   🔮 Mutation: ${brainrot.mutation || 'none'} (visual effect: ${brainrot.has_visible_mutation_effect ? 'YES' : 'NO'})`);
        console.log(`   🎨 Modifiers: ${brainrot.modifier_icons?.length || 0} (icons visible: ${brainrot.has_visible_modifier_icons ? 'YES' : 'NO'})`);
        if (brainrot.modifier_icons?.length > 0) {
          console.log(`      Icons: [${brainrot.modifier_icons.join(', ')}]`);
        }
        
        // Create vision result for verification
        const visionResult = {
          extractedData: brainrot,
          matchedBrainrot: matchResult.match,
          matchConfidence: matchResult.confidence,
          matchMethod: matchResult.method,
          confidence: {
            extraction: brainrot.confidence,
            matching: matchResult.confidence,
            overall: (brainrot.confidence + matchResult.confidence) / 2
          }
        };
        
        // Verify result
        const verification = verifyVisionResult(visionResult, matchResult.match);
        
        // Log verification result
        if (verification.warnings.length > 0) {
          verification.warnings.forEach(w => {
            console.warn(`   ⚠️ ${w.type}: ${w.message}`);
          });
        }
        
        processedBrainrots.push({
          success: true,
          position: brainrot.position,
          extractedData: brainrot,
          matchedBrainrot: matchResult.match,
          matchMethod: matchResult.method,
          matchConfidence: matchResult.confidence,
          verification: {
            passed: verification.passed,
            warnings: verification.warnings
          },
          confidence: {
            extraction: brainrot.confidence,
            matching: matchResult.confidence,
            verification: verification.adjustedConfidence,
            overall: (brainrot.confidence + matchResult.confidence) / 2 * (verification.adjustedConfidence / brainrot.confidence)
          },
          parsedText: {
            name: brainrot.name,
            mutation: brainrot.mutation === 'none' ? null : brainrot.mutation,
            rarity: brainrot.rarity,
            income: brainrot.income_value
          },
          detectedModifiers: {
            traits: brainrot.modifier_icons || [],
            confidence: brainrot.confidence,
            method: 'vision'
          }
        });
        
      } catch (error) {
        console.error(`❌ Failed to process brainrot #${brainrot.position}:`, error.message);
        processedBrainrots.push({
          success: false,
          error: error.message,
          extractedData: brainrot,
          position: brainrot.position
        });
      }
    }
    
    const successCount = processedBrainrots.filter(b => b.success).length;
    const failCount = processedBrainrots.filter(b => !b.success).length;
    
    console.log(`\n✅ Floor analysis complete: ${successCount} success, ${failCount} failed`);
    
    return {
      success: true,
      method: 'whole_floor_vision',
      totalBrainrots: extracted.total_brainrots,
      successfulExtractions: successCount,
      failedExtractions: failCount,
      layout: extracted.layout,
      overallConfidence: extracted.overall_confidence,
      brainrots: processedBrainrots
    };
    
  } catch (error) {
    console.error('❌ Whole floor vision extraction failed:', error.message);
    return {
      success: false,
      error: error.message,
      method: 'whole_floor_vision'
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

