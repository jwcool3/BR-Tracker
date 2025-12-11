# 🎯 Smart Filters for Adding Brainrots

## Overview

When adding brainrots to an account, the app now intelligently filters to show only the best brainrots by default, with easy toggles to see everything.

---

## 🌟 Default Behavior

When you click **"+ Add Brainrots"**, the app automatically filters to show:

1. **High-Tier Rarities Only** (⭐)
   - Brainrot God
   - OG
   - Secret
   - Mythic

2. **With Images Only** (🖼️)
   - Only brainrots that have thumbnails
   - Hides 93 brainrots without images

**Result:** See only the best ~225 brainrots instead of all 318!

---

## 🎨 Visual Indicators

### Status Text (Top-Left)

```
Showing 225 of 318 brainrots • High-tier (Mythic+) • With images
```

**Indicators:**
- **• High-tier (Mythic+)** - Only showing top rarities
- **• With images** - Only showing brainrots with thumbnails
- **• All brainrots** - All filters disabled

---

## 🔘 Toggle Buttons

When in "Add Brainrots" mode, you'll see 3 toggle buttons:

### 1. High-Tier Toggle (⭐)
```
[⭐ High-Tier]  ←  Active (purple border)
[📋 All Tiers]  ←  Inactive (gray)
```

**Active (default):**
- Shows only: Brainrot God, OG, Secret, Mythic
- ~243 brainrots (high-tier only)

**Inactive:**
- Shows all rarities including Common, Rare, Epic, Legendary
- All 318 brainrots

### 2. Image Toggle (🖼️)
```
[🖼️ With Images]  ←  Active (cyan border)
[📄 All]           ←  Inactive (gray)
```

**Active (default):**
- Shows only brainrots with thumbnails
- ~225 brainrots (with images)

**Inactive:**
- Shows all brainrots including those without images
- All 318 brainrots

### 3. Show Owned Button (✓)
```
[✓ Show Owned]  ←  Return to owned view
```

Switches back to viewing your owned brainrots.

---

## 📊 Filtering Logic

### Filter Combinations

| High-Tier | With Images | Result |
|-----------|-------------|--------|
| ✅ ON | ✅ ON | ~**180** brainrots (best quality) |
| ✅ ON | ❌ OFF | ~**243** brainrots (all high-tier) |
| ❌ OFF | ✅ ON | ~**225** brainrots (all with images) |
| ❌ OFF | ❌ OFF | **318** brainrots (everything) |

### Rarity Tiers

**High-Tier (shown by default):**
- 🔮 Brainrot God (74)
- 👑 OG (1)
- 🔒 Secret (138)
- 💎 Mythic (33)
- **Total: 246**

**Low-Tier (hidden by default):**
- 🟣 Legendary (23)
- 🔵 Epic (21)
- 🟢 Rare (14)
- ⚪ Common (13)
- ❓ Unknown (1)
- **Total: 72**

---

## 🎯 Use Cases

### Use Case 1: Quick Add Best Brainrots

**Goal:** Add only top-tier brainrots to new account

**Steps:**
1. Click "+ Add Brainrots"
2. **See ~180 brainrots** (high-tier + with images)
3. Scroll and add desired ones
4. ✅ Fast and focused!

**Why it's better:**
- No scrolling through 318 brainrots
- No seeing brainrots without images
- Only see what matters

### Use Case 2: Find Specific Common Brainrot

**Goal:** Add a specific Common rarity brainrot

**Steps:**
1. Click "+ Add Brainrots"
2. Click "[📋 All Tiers]" to disable high-tier filter
3. Use search to find specific brainrot
4. Add it
5. ✅ Found quickly!

### Use Case 3: See Everything

**Goal:** Browse all brainrots

**Steps:**
1. Click "+ Add Brainrots"
2. Click "[📋 All Tiers]"
3. Click "[📄 All]"
4. **See all 318 brainrots**
5. ✅ Full view!

---

## 💡 Why These Defaults?

### 1. High-Tier Only
**Reason:** Most players only care about the best brainrots
- Brainrot God, Secret, Mythic = 245 brainrots (77%)
- These are the valuable ones worth collecting
- Lower tiers are usually ignored

**Benefit:**
- 77% reduction in noise
- Faster to find what you want
- Better user experience

### 2. With Images Only
**Reason:** Visual browsing is much easier
- 225 brainrots have images (71%)
- Easier to recognize and remember
- More professional feel

**Benefit:**
- Better visual experience
- Easier to browse
- More engaging

**Combined:**
- ~180 brainrots shown (43% reduction)
- Only the best, with images
- Optimal user experience

---

## 🎨 UI Design

### Button States

**Active Filter:**
```css
background: purple-600/20 (high-tier) or cyan-600/20 (images)
text: purple-400 or cyan-400
border: 1px solid color/50
hover: darker background
```

**Inactive Filter:**
```css
background: slate-700
text: gray-300
hover: slate-600
```

### Visual Flow

```
[Owned View]
     ↓
Click "+ Add Brainrots"
     ↓
[Add View - Filtered]
⭐ High-Tier  🖼️ With Images  ✓ Show Owned
     ↓
Click toggles to adjust
     ↓
See desired brainrots
     ↓
Add to account
     ↓
Click "✓ Show Owned"
     ↓
[Owned View - Updated]
```

---

## 🔄 Filter Behavior

### When Switching Views

**Entering Add Mode:**
- High-Tier: ✅ ON (default)
- With Images: ✅ ON (default)
- Shows ~180 brainrots

**Exiting Add Mode:**
- Returns to owned view
- Filters reset for next time
- Always starts with defaults

### Search Interaction

**With Filters Active:**
- Search works within filtered results
- Example: High-tier + search "Elephant" = only high-tier elephants

**With Filters Inactive:**
- Search works across all brainrots
- More results

---

## 📊 Statistics

### Current Data (318 total)

**By Rarity:**
- Brainrot God: 74 (23%)
- Secret: 138 (43%)
- Mythic: 33 (10%)
- Legendary: 23 (7%)
- Epic: 21 (7%)
- Rare: 14 (4%)
- Common: 13 (4%)
- OG: 1 (<1%)
- Unknown: 1 (<1%)

**By Images:**
- With images: 225 (71%)
- Without images: 93 (29%)

**Default Filter (High-Tier + Images):**
- Shown: ~180 (57%)
- Hidden: ~138 (43%)

---

## 🎯 Best Practices

### For Most Users
1. Keep defaults (High-Tier + With Images)
2. Use search to find specific brainrots
3. Add what you need
4. Return to owned view

### For Completionists
1. Disable high-tier filter
2. Keep image filter on
3. Browse all rarities
4. Add everything

### For Quick Setup
1. Keep defaults
2. Use bulk mode
3. Select multiple
4. Add all at once

---

## ✅ Benefits Summary

### For New Users
- ✅ Not overwhelmed by 318 options
- ✅ See only the best
- ✅ Visual browsing (images)
- ✅ Faster decisions

### For Experienced Users
- ✅ Quick access to valuable brainrots
- ✅ Easy to disable filters when needed
- ✅ Familiar with what's high-tier
- ✅ Efficient workflow

### For Everyone
- ✅ Better UX
- ✅ Faster browsing
- ✅ Less clutter
- ✅ Smart defaults

---

## 🚀 Try It Now!

1. Open app: `http://localhost:5173/`
2. View any account
3. Click "+ Add Brainrots"
4. See ~180 filtered brainrots
5. Try the toggles!

**Smart filtering makes adding brainrots much easier!** ✨

---

**Feature Added:** [Current Date]  
**Default Filters:** High-Tier + With Images  
**Toggle Anytime:** Just click the buttons!

