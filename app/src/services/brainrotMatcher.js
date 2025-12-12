/**
 * Brainrot Matcher Service - Match extracted names to database
 * Uses fuzzy matching to handle OCR errors
 */

/**
 * Match extracted brainrot name to database
 * @param {string} extractedName - Name from OCR
 * @param {Array} brainrotsDatabase - Array of brainrots from brainrots.json
 * @returns {{match: object|null, confidence: number, method: string, alternatives: Array}}
 */
export function matchBrainrot(extractedName, brainrotsDatabase) {
  if (!extractedName || !brainrotsDatabase || brainrotsDatabase.length === 0) {
    return {
      match: null,
      confidence: 0,
      method: 'none',
      error: 'Invalid input'
    };
  }

  const normalizedName = extractedName.toLowerCase().trim();
  
  console.log(`🔍 Matching "${extractedName}" against ${brainrotsDatabase.length} brainrots...`);

  // Method 1: Exact match (case-insensitive)
  const exactMatch = brainrotsDatabase.find(br => 
    br.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) {
    console.log(`✅ Exact match found: ${exactMatch.name}`);
    return {
      match: exactMatch,
      confidence: 1.0,
      method: 'exact',
      alternatives: []
    };
  }

  // Method 2: Fuzzy match with Levenshtein distance
  const fuzzyMatches = brainrotsDatabase
    .map(br => ({
      brainrot: br,
      similarity: calculateSimilarity(br.name.toLowerCase(), normalizedName)
    }))
    .filter(m => m.similarity > 0.75) // 75% threshold (raised to avoid wrong matches)
    .sort((a, b) => b.similarity - a.similarity);
  
  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    
    // If best match is below 85%, log warning
    if (bestMatch.similarity < 0.85) {
      console.warn(`⚠️ Low confidence fuzzy match: ${bestMatch.brainrot.name} (${Math.round(bestMatch.similarity * 100)}% similar to "${nameToMatch}")`);
    } else {
      console.log(`🔍 Fuzzy match found: ${bestMatch.brainrot.name} (${Math.round(bestMatch.similarity * 100)}% similar)`);
    }
    
    return {
      match: bestMatch.brainrot,
      confidence: bestMatch.similarity,
      method: 'fuzzy',
      alternatives: fuzzyMatches.slice(1, 4).map(m => ({ // Top 3 alternatives
        brainrot: m.brainrot,
        similarity: m.similarity
      }))
    };
  }

  // Method 2.5: Word-based matching (for multi-word names)
  const extractedWords = normalizedName.split(/\s+/).filter(w => w.length > 2);
  if (extractedWords.length > 0) {
    const wordMatches = brainrotsDatabase
      .map(br => {
        const brWords = br.name.toLowerCase().split(/\s+/);
        const matchingWords = extractedWords.filter(ew => 
          brWords.some(bw => bw.includes(ew) || ew.includes(bw))
        );
        return {
          brainrot: br,
          wordMatchRatio: matchingWords.length / Math.max(extractedWords.length, brWords.length)
        };
      })
      .filter(m => m.wordMatchRatio > 0.5) // At least half the words match
      .sort((a, b) => b.wordMatchRatio - a.wordMatchRatio);
    
    if (wordMatches.length > 0) {
      const bestMatch = wordMatches[0];
      console.log(`🔍 Word-based match found: ${bestMatch.brainrot.name} (${Math.round(bestMatch.wordMatchRatio * 100)}% words matched)`);
      
      return {
        match: bestMatch.brainrot,
        confidence: bestMatch.wordMatchRatio * 0.8, // Slightly lower confidence
        method: 'word-based',
        alternatives: wordMatches.slice(1, 4)
      };
    }
  }

  // Method 3: Partial match (name contains extracted text or vice versa)
  const partialMatches = brainrotsDatabase
    .filter(br => {
      const brName = br.name.toLowerCase();
      return brName.includes(normalizedName) || normalizedName.includes(brName);
    })
    .map(br => ({
      brainrot: br,
      similarity: 0.65 // Lower confidence for partial matches
    }));
  
  if (partialMatches.length > 0) {
    console.log(`🔍 Partial match found: ${partialMatches[0].brainrot.name}`);
    return {
      match: partialMatches[0].brainrot,
      confidence: 0.65,
      method: 'partial',
      alternatives: partialMatches.slice(1, 4)
    };
  }

  // No match found
  console.warn(`⚠️ No match found for "${extractedName}"`);
  return {
    match: null,
    confidence: 0,
    method: 'none',
    suggestion: extractedName,
    alternatives: []
  };
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  // Create matrix
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  // Calculate Levenshtein distance
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // Deletion
        matrix[j - 1][i] + 1,     // Insertion
        matrix[j - 1][i - 1] + cost  // Substitution
      );
    }
  }
  
  // Convert distance to similarity (0-1)
  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
}

/**
 * Batch match multiple extracted names
 * @param {Array<string>} extractedNames - Array of names from OCR
 * @param {Array} brainrotsDatabase
 * @returns {Array} - Array of match results
 */
export function matchMultipleBrainrots(extractedNames, brainrotsDatabase) {
  console.log(`🔍 Batch matching ${extractedNames.length} brainrots...`);
  
  return extractedNames.map((name, index) => {
    const result = matchBrainrot(name, brainrotsDatabase);
    return {
      ...result,
      index,
      extractedName: name
    };
  });
}

