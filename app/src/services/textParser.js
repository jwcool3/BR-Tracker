/**
 * Text Parser Service - Parse OCR text to extract brainrot data
 * Identifies name, rarity, mutation, income from text lines
 */

/**
 * Calculate string similarity (Levenshtein distance)
 */
function calculateStringSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - matrix[len1][len2] / maxLen;
}

const MUTATIONS = [
  'radioactive', 'rainbow', 'diamond', 'gold', 'galaxy',
  'lava', 'yin yang', 'bloodmoon', 'celestial', 'candy', 'halloween'
];

const RARITIES = [
  'common', 'rare', 'epic', 'legendary', 'mythic',
  'secret', 'og', 'brainrot god'
];

/**
 * Parse extracted OCR text to identify brainrot information
 * @param {{raw: string, lines: string[], confidence: number}} ocrResult
 * @returns {{name: string|null, rarity: string|null, mutation: string|null, income: number|null, cost: number|null}}
 */
export function parseExtractedText(ocrResult) {
  const lines = ocrResult.lines;
  
  console.log('📋 Parsing text...', {
    totalLines: lines.length,
    ocrConfidence: ocrResult.confidence
  });

  const parsed = {
    name: null,
    rarity: null,
    mutation: null,
    income: null,
    cost: null,
    collectionValue: null
  };

  // Find mutation (text label above name)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    
    // Try exact match first
    let foundMutation = MUTATIONS.find(m => line.includes(m) || m.includes(line));
    
    // Try fuzzy match for OCR errors (e.g., "rad1oactive" -> "radioactive")
    if (!foundMutation) {
      foundMutation = MUTATIONS.find(m => {
        const similarity = calculateStringSimilarity(line, m);
        return similarity > 0.75; // 75% similar
      });
    }
    
    if (foundMutation) {
      parsed.mutation = foundMutation.replace(' ', '_'); // "yin yang" -> "yin_yang"
      console.log(`🔍 Found mutation: ${parsed.mutation} (from: "${lines[i]}")`);
      
      // Name should be next line after mutation
      if (i + 1 < lines.length) {
        const potentialName = lines[i + 1];
        if (isValidBrainrotName(potentialName)) {
          parsed.name = potentialName;
          console.log(`📝 Found name (after mutation): ${parsed.name}`);
        }
      }
      break;
    }
  }

  // Find name if not found via mutation
  if (!parsed.name) {
    for (const line of lines) {
      if (isValidBrainrotName(line)) {
        parsed.name = line;
        console.log(`📝 Found name (standalone): ${parsed.name}`);
        break;
      }
    }
  }

  // Find rarity
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const foundRarity = RARITIES.find(r => lineLower.includes(r));
    
    if (foundRarity) {
      parsed.rarity = foundRarity.replace(' ', '_'); // "brainrot god" -> "brainrot_god"
      console.log(`⭐ Found rarity: ${parsed.rarity}`);
      break;
    }
  }

  // Find income (format: $X.XM/s)
  const incomeMatch = ocrResult.raw.match(/\$\s*(\d+\.?\d*)\s*(K|M|B|T)\s*\/\s*s/i);
  if (incomeMatch) {
    parsed.income = parseGameNumber(incomeMatch[1], incomeMatch[2]);
    console.log(`💰 Found income: $${formatNumber(parsed.income)}/s`);
  }

  // Find cost (format: $X.XM without /s)
  const costMatches = [...ocrResult.raw.matchAll(/\$\s*(\d+\.?\d*)\s*(K|M|B|T)(?!\s*\/\s*s)/gi)];
  if (costMatches.length > 0) {
    // Usually the first match that's not income
    parsed.cost = parseGameNumber(costMatches[0][1], costMatches[0][2]);
    console.log(`💵 Found cost: $${formatNumber(parsed.cost)}`);
  }

  // Find collection value (format: Collect $X.XB)
  const collectMatch = ocrResult.raw.match(/Collect\s+\$\s*(\d+\.?\d*)\s*(K|M|B|T)/i);
  if (collectMatch) {
    parsed.collectionValue = parseGameNumber(collectMatch[1], collectMatch[2]);
    console.log(`🎁 Found collection value: $${formatNumber(parsed.collectionValue)}`);
  }

  return parsed;
}

/**
 * Check if a line is a valid brainrot name
 * @param {string} line
 * @returns {boolean}
 */
function isValidBrainrotName(line) {
  if (!line || line.length < 3) return false; // Too short (relaxed from 5)
  if (line.length > 60) return false; // Too long (relaxed from 50)
  if (line.includes('$')) return false; // Not a currency value
  if (/^\d+$/.test(line)) return false; // Not a pure number
  if (line.toLowerCase().includes('collect')) return false; // Not "Collect" text
  if (line.toLowerCase().includes('offline')) return false; // Not "Offline Cash" text
  if (line.toLowerCase().includes('cash')) return false; // Not cash text
  
  // Check if it's a rarity keyword
  const lineLower = line.toLowerCase().trim();
  if (RARITIES.some(r => lineLower === r || lineLower.includes(r))) return false;
  
  // Check if it's a mutation keyword (but allow it in name context)
  if (MUTATIONS.some(m => lineLower === m)) return false;
  
  // Must have letters
  if (!/[a-zA-Z]/.test(line)) return false;
  
  return true;
}

/**
 * Parse game number format (e.g., "1.2M" -> 1200000)
 * @param {string} value - Numeric value
 * @param {string} suffix - K, M, B, or T
 * @returns {number}
 */
function parseGameNumber(value, suffix) {
  const num = parseFloat(value);
  const multipliers = {
    'K': 1e3,
    'M': 1e6,
    'B': 1e9,
    'T': 1e12
  };
  return Math.floor(num * (multipliers[suffix.toUpperCase()] || 1));
}

/**
 * Format number for display (e.g., 1200000 -> "1.2M")
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Calculate confidence score for parsed data
 * @param {object} parsed - Parsed brainrot data
 * @returns {object} - Confidence scores for each field
 */
export function calculateParseConfidence(parsed) {
  return {
    name: parsed.name ? 0.8 : 0,
    rarity: parsed.rarity ? 0.9 : 0,
    mutation: parsed.mutation ? 0.9 : (parsed.name ? 0.85 : 0), // High confidence either way
    income: parsed.income ? 0.85 : 0,
    cost: parsed.cost ? 0.75 : 0,
    overall: calculateOverallConfidence(parsed)
  };
}

function calculateOverallConfidence(parsed) {
  const weights = {
    name: 0.4,
    rarity: 0.2,
    mutation: 0.1,
    income: 0.2,
    cost: 0.1
  };
  
  let total = 0;
  
  if (parsed.name) total += weights.name;
  if (parsed.rarity) total += weights.rarity;
  if (parsed.mutation || parsed.name) total += weights.mutation; // Mutation or no mutation is fine
  if (parsed.income) total += weights.income;
  if (parsed.cost) total += weights.cost;
  
  return total;
}

