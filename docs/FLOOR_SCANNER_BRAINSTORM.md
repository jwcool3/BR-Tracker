# 🔥 Floor Scanner Feature - Brainstorm & Design

**Feature Goal:** Upload a screenshot of a full floor and automatically detect + add ALL brainrots on it.

**User Benefit:** Add 5-10 brainrots in one upload instead of one at a time. Saves **10-50 minutes per floor!**

---

## 🎯 Core Concept

### What User Sees:
```
Current Floor View in Game:
┌─────────────────────────────────────┐
│  Floor 5 - Security Level           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │BR1 │ │BR2 │ │BR3 │ │BR4 │ │BR5 ││
│  └────┘ └────┘ └────┘ └────┘ └────┘│
│  ┌────┐ ┌────┐ ┌────┐              │
│  │BR6 │ │BR7 │ │BR8 │              │
│  └────┘ └────┘ └────┘              │
└─────────────────────────────────────┘
```

### What We Need to Do:
1. **Detect** all individual brainrot cards in the image
2. **Extract** each card as a separate sub-image
3. **Process** each card using the single-brainrot extraction logic
4. **Verify** all extractions in a batch UI
5. **Add** all to the account

---

## 🔍 Technical Approach

### Phase 1: Image Segmentation (Find the Brainrot Cards)

#### Option A: Grid Detection (Simpler)
**Assumption:** Brainrots are in a regular grid layout

```javascript
// Pseudocode
function detectBrainrotGrid(image) {
  // 1. Detect the grid pattern
  const gridInfo = detectGridLayout(image);
  
  // 2. Calculate card positions
  const cards = [];
  for (let row = 0; row < gridInfo.rows; row++) {
    for (let col = 0; col < gridInfo.cols; col++) {
      const cardBounds = {
        x: gridInfo.startX + (col * gridInfo.cardWidth),
        y: gridInfo.startY + (row * gridInfo.cardHeight),
        width: gridInfo.cardWidth,
        height: gridInfo.cardHeight
      };
      cards.push(cropImage(image, cardBounds));
    }
  }
  
  return cards; // Array of individual card images
}
```

**Pros:**
- Fast and reliable
- No AI needed for detection
- Works if layout is consistent

**Cons:**
- Breaks if layout changes
- Doesn't handle irregular spacing
- Requires calibration for different screen sizes

---

#### Option B: AI Object Detection (Better)
**Use Claude Vision API to detect cards**

```javascript
async function detectBrainrotCards(floorImage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
              data: imageToBase64(floorImage)
            }
          },
          {
            type: 'text',
            text: `You are analyzing a screenshot from "Steal a Brainrot" game showing a FLOOR with multiple brainrot characters.

Your task: Identify the bounding box of EACH individual brainrot card.

A brainrot card contains:
- Character name at top
- 3D character model in center
- Stats ($X.XM/s, rarity)

Return JSON format:
{
  "detected_count": <number>,
  "cards": [
    {
      "id": 1,
      "bounding_box": {
        "x": <left edge pixel>,
        "y": <top edge pixel>,
        "width": <width pixels>,
        "height": <height pixels>
      },
      "confidence": 0.0-1.0
    }
  ],
  "layout": "grid|list|irregular"
}

Important: Return coordinates for EACH card separately, not overlapping.`
          }
        ]
      }]
    })
  });
  
  const result = await response.json();
  const detection = JSON.parse(result.content[0].text);
  
  return detection.cards; // Array of bounding boxes
}
```

**Pros:**
- Handles any layout
- Works with irregular spacing
- Adaptive to game UI changes
- Can detect partially visible cards

**Cons:**
- Costs ~$0.02-0.03 per floor
- Requires API call
- Slightly slower

---

### Phase 2: Extract Individual Cards

```javascript
async function extractCardsFromFloor(floorImage) {
  // Step 1: Detect all card locations
  const detectedCards = await detectBrainrotCards(floorImage);
  
  // Step 2: Crop each card
  const cardImages = detectedCards.map(card => {
    return cropImageRegion(floorImage, card.bounding_box);
  });
  
  return cardImages; // Array of individual card images
}
```

---

### Phase 3: Batch Processing

```javascript
async function processFloorScreenshot(floorImage) {
  const startTime = Date.now();
  
  try {
    // Step 1: Extract all cards
    const cardImages = await extractCardsFromFloor(floorImage);
    
    // Step 2: Process each card in parallel
    const processingPromises = cardImages.map(async (cardImage, index) => {
      try {
        // Use existing single-brainrot processing
        const result = await processSingleBrainrot(cardImage);
        return {
          success: true,
          cardIndex: index,
          ...result
        };
      } catch (error) {
        return {
          success: false,
          cardIndex: index,
          error: error.message,
          cardImage: cardImage // For manual review
        };
      }
    });
    
    // Wait for all to complete
    const results = await Promise.all(processingPromises);
    
    // Separate successful vs failed
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      totalCards: cardImages.length,
      successfulExtractions: successful.length,
      failedExtractions: failed.length,
      successful,
      failed,
      metadata: {
        processingTime,
        averageTimePerCard: processingTime / cardImages.length
      }
    };
    
  } catch (error) {
    console.error('Floor processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

### Phase 4: Batch Verification UI

**New Component:** `FloorVerificationScreen.jsx`

```jsx
import { useState } from 'react';

export function FloorVerificationScreen({ 
  floorResult, 
  account,
  onConfirmAll, 
  onRetry 
}) {
  const [verifiedCards, setVerifiedCards] = useState(
    floorResult.successful.map(card => ({
      ...card,
      verified: true, // Pre-checked if high confidence
      edited: false
    }))
  );
  
  const [selectedCard, setSelectedCard] = useState(null);
  
  const handleToggleCard = (cardIndex) => {
    setVerifiedCards(prev => prev.map((card, i) => 
      i === cardIndex ? { ...card, verified: !card.verified } : card
    ));
  };
  
  const handleEditCard = (cardIndex, updates) => {
    setVerifiedCards(prev => prev.map((card, i) => 
      i === cardIndex ? { ...card, ...updates, edited: true } : card
    ));
  };
  
  const confirmedCount = verifiedCards.filter(c => c.verified).length;
  const totalConfidence = verifiedCards.reduce((sum, c) => 
    sum + (c.verified ? c.confidence.overall : 0), 0
  ) / verifiedCards.length;
  
  return (
    <div className="floor-verification">
      {/* Header Stats */}
      <div className="verification-header">
        <h2>Floor Scan Results</h2>
        <div className="stats-row">
          <div className="stat">
            <span className="label">Detected:</span>
            <span className="value">{floorResult.totalCards} brainrots</span>
          </div>
          <div className="stat">
            <span className="label">Successful:</span>
            <span className="value text-green-500">
              {floorResult.successfulExtractions}
            </span>
          </div>
          {floorResult.failedExtractions > 0 && (
            <div className="stat">
              <span className="label">Failed:</span>
              <span className="value text-red-500">
                {floorResult.failedExtractions}
              </span>
            </div>
          )}
          <div className="stat">
            <span className="label">To Add:</span>
            <span className="value text-blue-500">{confirmedCount}</span>
          </div>
          <div className="stat">
            <span className="label">Avg Confidence:</span>
            <span className={`value ${getConfidenceColor(totalConfidence)}`}>
              {Math.round(totalConfidence * 100)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Grid of Detected Cards */}
      <div className="cards-grid">
        {verifiedCards.map((card, index) => (
          <div 
            key={index}
            className={`card-preview ${card.verified ? 'verified' : 'unverified'} ${
              selectedCard === index ? 'selected' : ''
            }`}
            onClick={() => setSelectedCard(index)}
          >
            {/* Checkbox */}
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={card.verified}
                onChange={() => handleToggleCard(index)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Mini Card Preview */}
            <img 
              src={card.imageData} 
              alt={card.parsedText.name}
              className="card-thumbnail"
            />
            
            {/* Card Info */}
            <div className="card-info">
              <div className="card-name">{card.parsedText.name || '???'}</div>
              <div className="card-rarity">{card.parsedText.rarity}</div>
              <div className="card-income">
                {card.parsedText.income 
                  ? `$${formatNumber(card.parsedText.income)}/s`
                  : 'No income detected'
                }
              </div>
              
              {/* Confidence Badge */}
              <div className={`confidence-badge ${
                getConfidenceBadgeClass(card.confidence.overall)
              }`}>
                {Math.round(card.confidence.overall * 100)}%
              </div>
              
              {/* Edit indicator */}
              {card.edited && (
                <div className="edited-badge">✏️ Edited</div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="card-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCard(index);
                }}
                className="btn-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Failed Cards Section */}
      {floorResult.failed.length > 0 && (
        <div className="failed-section">
          <h3 className="text-red-400">Failed Extractions ({floorResult.failed.length})</h3>
          <div className="failed-cards-grid">
            {floorResult.failed.map((failedCard, index) => (
              <div key={index} className="failed-card">
                <img 
                  src={failedCard.cardImage} 
                  alt="Failed extraction"
                  className="failed-thumbnail"
                />
                <div className="error-message">{failedCard.error}</div>
                <button 
                  onClick={() => handleRetryCard(failedCard)}
                  className="btn-sm btn-secondary"
                >
                  Retry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Detailed Edit Panel (when card selected) */}
      {selectedCard !== null && (
        <div className="edit-panel">
          <h3>Edit: {verifiedCards[selectedCard].parsedText.name}</h3>
          
          {/* Same fields as single verification screen */}
          <div className="edit-fields">
            {/* Name, Mutation, Modifiers, Income, etc. */}
            {/* ... (reuse single-card verification UI) */}
          </div>
          
          <button onClick={() => setSelectedCard(null)} className="btn-secondary">
            Done Editing
          </button>
        </div>
      )}
      
      {/* Actions */}
      <div className="actions">
        <button onClick={onRetry} className="btn-secondary">
          ← Retake Photo
        </button>
        
        <div className="action-group">
          <button
            onClick={() => {
              // Uncheck all low-confidence cards
              setVerifiedCards(prev => prev.map(card => ({
                ...card,
                verified: card.confidence.overall >= 0.8
              })));
            }}
            className="btn-secondary"
          >
            Auto-Select (80%+ confidence)
          </button>
          
          <button
            onClick={() => onConfirmAll(verifiedCards.filter(c => c.verified))}
            className="btn-primary"
            disabled={confirmedCount === 0}
          >
            Add {confirmedCount} Brainrot{confirmedCount !== 1 ? 's' : ''} to {account.name} →
          </button>
        </div>
      </div>
    </div>
  );
}

function getConfidenceColor(confidence) {
  if (confidence >= 0.9) return 'text-green-500';
  if (confidence >= 0.7) return 'text-yellow-500';
  return 'text-red-500';
}

function getConfidenceBadgeClass(confidence) {
  if (confidence >= 0.9) return 'bg-green-600';
  if (confidence >= 0.7) return 'bg-yellow-600';
  return 'bg-red-600';
}

function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}
```

---

## 🎨 User Flow

### Step 1: Upload
```
User clicks: "📸 Scan Floor"
  ↓
File picker opens
  ↓
User selects floor screenshot
  ↓
Loading screen: "Detecting brainrots... 🔍"
```

### Step 2: Processing
```
Backend:
1. Detect cards (2-3 seconds) ──→ "Found 8 brainrots!"
2. Extract each card (parallel)
3. OCR + Icon detection (3-5 seconds per card in parallel)
4. Match to database
  ↓
Total time: ~8-10 seconds for 8 brainrots
```

### Step 3: Verification
```
FloorVerificationScreen shows:
┌─────────────────────────────────────────┐
│ Floor Scan Results                      │
│ Detected: 8 | Successful: 7 | Failed: 1 │
│ To Add: 7 | Avg Confidence: 87%         │
├─────────────────────────────────────────┤
│ ✓ [BR1 Card] 92% Ballerina Peppermin.. │
│ ✓ [BR2 Card] 89% La Vacca Prese Pres.. │
│ ✓ [BR3 Card] 85% Strawberry Elephant    │
│ ✗ [BR4 Card] 45% Unknown (Low conf.)    │
│ ✓ [BR5 Card] 91% Cocofanto Elefanto     │
│ ✓ [BR6 Card] 88% Orangutini Ananassi.. │
│ ✓ [BR7 Card] 93% Perochello Lemonche.. │
│ ✓ [BR8 Card] 90% Reindeer Tralala       │
├─────────────────────────────────────────┤
│ [← Retake] [Auto-Select] [Add 7 →]     │
└─────────────────────────────────────────┘
```

### Step 4: Confirm
```
User reviews:
- Clicks on card to edit details if needed
- Unchecks low-confidence cards
- Clicks "Add 7 Brainrots to Main Account"
  ↓
Toast: "✅ Added 7 brainrots to Main Account!"
  ↓
Account detail view updates
```

---

## 🚀 Implementation Phases

### Phase 1: Core Detection (Week 1)
- [ ] Implement AI card detection service
- [ ] Test with various floor screenshots
- [ ] Achieve >90% card detection rate

### Phase 2: Batch Processing (Week 1-2)
- [ ] Implement parallel processing
- [ ] Handle failures gracefully
- [ ] Test with 5-10 brainrots per floor

### Phase 3: Verification UI (Week 2)
- [ ] Build FloorVerificationScreen component
- [ ] Grid preview with checkboxes
- [ ] Detailed edit panel
- [ ] Auto-select feature

### Phase 4: Integration (Week 2-3)
- [ ] Add "Scan Floor" button to account detail
- [ ] Integrate with existing BrainrotCard logic
- [ ] Add toast notifications
- [ ] Save to localStorage

### Phase 5: Polish (Week 3)
- [ ] Loading states and progress indicators
- [ ] Error handling for edge cases
- [ ] Mobile optimization
- [ ] User guide/tutorial

---

## 💰 Cost Analysis

### API Costs:
**Per Floor Scan:**
- Card detection: $0.02 (one Claude API call for detection)
- Icon detection: $0.01 × 8 cards = $0.08 (per card)
- **Total: $0.10 per floor**

**For 1000 users:**
- Average 3 floors per user = 3,000 scans
- 3,000 × $0.10 = **$300/month**

**vs Single Upload:**
- 8 brainrots × $0.01 each = $0.08
- But takes 8 uploads! Floor scan is **8x faster** for similar cost

---

## 🎯 Success Metrics

### Must Achieve:
- ✅ Detect 90%+ of cards in floor
- ✅ Extract 85%+ with correct name match
- ✅ Process full floor in <15 seconds
- ✅ User corrects <15% of extractions

### Nice to Have:
- ⭐ Detect 95%+ of cards
- ⭐ Extract 90%+ correctly
- ⭐ Process in <10 seconds
- ⭐ User corrects <10% of extractions

---

## ⚠️ Edge Cases to Handle

### Case 1: Partial Floor
**Issue:** User shows only 3-4 brainrots (not full floor)

**Solution:** 
- Detect whatever is visible
- Show count: "Detected 3 brainrots"
- Allow proceeding with any number

### Case 2: Overlapping Cards
**Issue:** Cards are too close, detection merges them

**Solution:**
- Claude is good at separating visual elements
- If detected count is wrong, user can retry with better angle
- Manual fallback: Single upload mode

### Case 3: Low Quality Screenshot
**Issue:** Blurry or low resolution

**Solution:**
- Show warning if confidence < 70% on multiple cards
- Prompt user to retake with better quality
- Still allow proceeding with manual corrections

### Case 4: Mixed Rarity Floor
**Issue:** User wants to scan only high-value brainrots

**Solution:**
- After detection, allow filtering by rarity
- "Only add Secret/OG/Brainrot God" checkbox
- Save time by auto-unchecking commons

---

## 🎨 UI Mockup Concepts

### "Scan Floor" Button Location
```
[Account Detail View]
┌─────────────────────────────────────┐
│ Main Account | RB 5 | 8/15 slots   │
│                                     │
│ ┌─────────────┐  ┌───────────────┐ │
│ │📸 Scan Floor│  │+ Add Brainrots│ │
│ └─────────────┘  └───────────────┘ │
│                                     │
│ [Brainrot Grid]                     │
└─────────────────────────────────────┘
```

### Loading State
```
[Processing Floor]
┌─────────────────────────────────────┐
│        Analyzing Floor... 🔍        │
│                                     │
│  ▓▓▓▓▓▓▓▓░░░░░░░░ 60%              │
│                                     │
│  ✅ Detected 8 brainrot cards      │
│  🔄 Extracting data... (3/8)       │
│  ⏱️  Estimated: 6 seconds          │
└─────────────────────────────────────┘
```

### Success Screen
```
[Verification]
┌─────────────────────────────────────┐
│ 🎉 Floor Scan Complete!             │
│ Detected: 8 | Success: 7 | Failed: 1│
│                                     │
│ [Grid of 8 mini cards with checks] │
│                                     │
│ Low confidence cards automatically  │
│ unchecked. Review and confirm!      │
│                                     │
│ [← Retake] [Auto-Select] [Add 7 →] │
└─────────────────────────────────────┘
```

---

## 🔥 Killer Features

### 1. Smart Duplicate Detection
- Check if brainrot already on account
- Show warning: "Ballerina Peppermintina already added"
- Allow user to:
  - Skip (don't add duplicate)
  - Add anyway (multiple copies)
  - Replace (update existing)

### 2. Floor Number Auto-Detection
- Detect floor number from screenshot ("Floor 5")
- Auto-assign all brainrots to that floor
- Save even more time!

### 3. Income Summary
- Show total income from all detected brainrots
- "Adding these will increase income by $37.5M/s"
- Helps user prioritize

### 4. Batch Floor Scanning
- "Scan multiple floors" mode
- Upload 3-5 floor screenshots
- Process all in sequence
- Add 30-50 brainrots at once!

---

## 🎯 MVP vs Full Feature

### MVP (Launch First):
- ✅ Detect cards in floor
- ✅ Extract name, rarity, mutation
- ✅ Batch verification UI
- ✅ Add all to account

### V1.1 (Next Update):
- ⭐ Floor number detection
- ⭐ Duplicate detection
- ⭐ Income summary
- ⭐ Better mobile support

### V2.0 (Future):
- 💎 Batch floor scanning (multiple floors)
- 💎 Auto-floor assignment
- 💎 Learning from corrections
- 💎 Export floor layout

---

## 📊 Expected Impact

### Time Savings:
**Before:**
- Add 8 brainrots manually: 8 × 5 minutes = 40 minutes

**After (Single Upload):**
- 8 uploads × 3 minutes = 24 minutes
- **Saved: 16 minutes** (40%)

**After (Floor Scan):**
- 1 floor scan = 5 minutes
- **Saved: 35 minutes** (88%!) 🚀

### User Satisfaction:
- **80x faster** than manual entry
- **5x faster** than single uploads
- Game-changing for accounts with 50+ brainrots

---

## ✅ Recommendation

**Build the Floor Scanner FIRST** (instead of single upload)!

**Why:**
1. Much better ROI (5-10x brainrots per upload)
2. Same core technology as single upload
3. Can fallback to single if detection fails
4. Users will love it more

**Timeline:**
- Week 1: Card detection + batch processing
- Week 2: Verification UI + integration
- Week 3: Polish + testing
- **Total: 3 weeks to MVP**

**Cost:**
- $0.10 per floor scan
- $300/month for 1000 users
- **Worth it for the time savings!**

---

## 🚀 Next Steps

1. **Prototype card detection** with Claude API
2. **Test with 20-30 floor screenshots** from game
3. **Build proof-of-concept** for 1 floor
4. **Measure accuracy** and adjust
5. **Build full verification UI**
6. **Launch and iterate!**

---

**This is THE feature that will make your tracker indispensable!** 🎯🔥

