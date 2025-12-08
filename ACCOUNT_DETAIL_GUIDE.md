# 📋 Account Detail View Guide

## Overview

The **Account Detail View** is where you manage a single account's brainrot collection. View all 439 brainrots, mark ownership, set mutations/traits, and track income!

---

## 🎯 Accessing Account Detail View

### **From Dashboard:**
1. Click **"View Account →"** on any account card
2. Or click **"View →"** in table/grouped view rows

### **Navigation:**
```
Dashboard → Click "View" on account → Account Detail View
                                       ↓
                                  [← Back to Dashboard]
```

---

## 🎨 Interface Layout

### **Top Section:**

```
┌────────────────────────────────────────────────┐
│  ← Back to Dashboard                            │
│                                                 │
│  Main Account                                   │
│  Primary grinding account                       │
│  Rebirth Level: 10                              │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  Slot Usage                                     │
│  ████████░░ HIGH (77%)                         │
│  20/26 slots used • 6 free                     │
│                                                 │
│  Owned: 20 | Completion: 4.6% | Income/s: $0   │
└────────────────────────────────────────────────┘
```

### **Search & Filters:**

```
┌────────────────────────────────────────────────┐
│  [🔍 Search brainrots...]                       │
│                                                 │
│  [Rarity ▼] [Ownership ▼] [Floor ▼] [Sort ▼]  │
└────────────────────────────────────────────────┘
```

### **Brainrot Grid:**

```
Showing 439 brainrots

┌─────────┬─────────┬─────────┬─────────┐
│ 🎮 ✅   │ 🎮 ❌   │ 🎮 ✅   │ 🎮 ❌   │
│ Name    │ Name    │ Name    │ Name    │
│ Rarity  │ Rarity  │ Rarity  │ Rarity  │
│ Stats   │ Stats   │ Stats   │ Stats   │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 🎴 Brainrot Cards

### **Not Owned (Faded):**

```
┌──────────────────────────┐
│ Strawberry Elephant   ❌ │ ← Click to mark owned
│ Brainrot God            │
│ Cost: $100M             │
│ Base: $250M/s           │
└──────────────────────────┘
```

### **Owned (Bright + Border):**

```
┌──────────────────────────┐
│ Strawberry Elephant   ✅ │ ← Click to unmark
│ Brainrot God    [Cyan]  │ ← Rarity color border
│ Cost: $100M             │
│ Base: $250M/s           │
│ ──────────────────────  │
│ [Click to expand]       │ ← Click card to see options
└──────────────────────────┘
```

### **Expanded (Owned):**

```
┌──────────────────────────┐
│ Strawberry Elephant   ✅ │
│ Brainrot God    [Cyan]  │
│ Cost: $100M             │
│ Base: $250M/s           │
│ ──────────────────────  │
│                         │
│ Floor (Security)        │
│ [Floor 5 🔒      ▼]    │
│                         │
│ Mutation                │
│ [Rainbow (10x)   ▼]    │
│                         │
│ Traits (3/3)       ▼    │ ← Click to expand
│                         │
│ ──────────────────────  │
│ Calculated Income       │
│ $55,000,000,000/s       │
│ Base: $250,000,000/s    │
└──────────────────────────┘
```

---

## ⚙️ Features

### **1. Mark Ownership**

**Toggle Owned Status:**
- Click ❌ (not owned) → Becomes ✅ (owned)
- Click ✅ (owned) → Becomes ❌ (not owned)
- Slot usage updates automatically
- Status bar updates

**Visual Feedback:**
- Not owned: Faded, gray border
- Owned: Bright, rarity-colored border

### **2. Floor Selection** 🔒

**Set Security Level:**
```
Floor 1  - No lock
Floor 2  - No lock
Floor 3 🔒 - Locked (requires RB 3+)
Floor 4 🔒 - Locked (requires RB 4+)
Floor 5 🔒 - Locked (requires RB 5+)
```

**Why It Matters:**
- Higher floors = safer from theft
- Locked floors prevent loss
- Important for valuable brainrots

### **3. Mutation Selection** 🌈

**All 12 Mutations Available:**

| Mutation | Multiplier | Color |
|----------|------------|-------|
| None | 1.0x | - |
| Gold | 1.25x | 🟡 |
| Diamond | 1.5x | 💎 |
| Bloodmoon | 2.0x | 🔴 |
| Celestial | 4.0x | 💜 |
| Candy | 4.0x | 🍬 |
| Lava | 6.0x | 🔥 |
| Galaxy | 6.0x | 🌌 |
| Yin Yang | 7.5x | ⚫⚪ |
| Radioactive | 8.5x | ☢️ |
| **Rainbow** | **10.0x** | 🌈 |
| Halloween | 1.0x | 🎃 |

**How to Use:**
1. Click on owned brainrot to expand
2. Select mutation from dropdown
3. Income recalculates automatically

**Best Mutations:**
- 🌈 **Rainbow (10x)** - Best multiplier!
- ☢️ **Radioactive (8.5x)** - Second best
- ⚫⚪ **Yin Yang (7.5x)** - Third best

### **4. Trait Selection** ✨

**20 Traits Available:**

Select up to **3 traits** per brainrot!

| Trait | Multiplier | Icon |
|-------|------------|------|
| Strawberry | +10.0x | 🍓 |
| Firework | +6.0x | 🎆 |
| Paint | +6.0x | 🎨 |
| Nyan | +6.0x | 🌈 |
| Fire | +6.0x | 🔥 |
| Zombie | +5.0x | 🧟 |
| Meowl | +5.0x | 🦉 |
| RIP | +5.0x | 🪦 |
| Galactic | +4.0x | ☄️ |
| Bombardiro | +4.0x | 💣 |
| Shark Fin | +4.0x | 🦈 |
| Pumpkin | +4.0x | 🎃 |
| Cometstruck | +3.5x | ⭐ |
| Snowy | +3.0x | ❄️ |
| Taco | +3.0x | 🌮 |
| Crab | +3.0x | 🦀 |
| Rain | +2.5x | 🌧️ |
| Bloodmoon | +2.0x | 🌕 |
| Hat | +1.0x | 🎩 |
| **Sleepy** | **-0.5x** | 💤 |

**How Traits Work:**
- Traits **stack additively** (add together)
- Then multiply with base × mutation
- Max 3 traits per brainrot
- Formula: `base × mutation × (1 + trait1 + trait2 + trait3)`

**Best Trait Combos:**

**God Tier (max income):**
```
🍓 Strawberry (+10x)
🎆 Firework (+6x)
🧟 Zombie (+5x)
───────────────────
Total: +21x bonus!
```

**High Tier:**
```
🎨 Paint (+6x)
🌈 Nyan (+6x)
🔥 Fire (+6x)
───────────────────
Total: +18x bonus!
```

**Mid Tier:**
```
🦉 Meowl (+5x)
☄️ Galactic (+4x)
💣 Bombardiro (+4x)
───────────────────
Total: +13x bonus!
```

**AVOID:**
- 💤 Sleepy (-0.5x) - Reduces income!

### **5. Income Calculation** 💰

**Automatic Calculation:**
- Updates when you change mutation
- Updates when you add/remove traits
- Shows both base and calculated

**Formula:**
```
Total Income = Base Income × Mutation × (1 + Traits)
```

**Example:**

```
Strawberry Elephant
─────────────────────
Base Income: $250M/s
Mutation: Rainbow (10x)
Traits: Strawberry (+10x), Zombie (+5x), Firework (+6x)

Calculation:
$250M × 10 × (1 + 10 + 5 + 6)
$250M × 10 × 22
= $55,000,000,000/s ($55B/s)
```

---

## 🔍 Search & Filters

### **Search:**

**Search by name:**
```
Type: "elephant"
Results: Strawberry Elephant, Elephant variants, etc.
```

**Live search:**
- Results update as you type
- Case-insensitive
- Searches brainrot names

### **Filters:**

**By Rarity:**
```
[All Rarities ▼]
├─ Common (most)
├─ Rare
├─ Epic
├─ Legendary
├─ Mythic
├─ Secret
├─ OG
└─ Brainrot God (rarest)
```

**By Ownership:**
```
[All ▼]
├─ Owned (marked as owned)
└─ Not Owned (not marked)
```

**By Floor:**
```
[All Floors ▼]
├─ Floor 1
├─ Floor 2
├─ Floor 3 🔒
├─ Floor 4 🔒
└─ Floor 5 🔒
```

### **Sorting:**

```
[Sort: Name ▼]
├─ Name (A-Z)
├─ Rarity (Common → God)
├─ Income (Highest first)
└─ Cost (Highest first)
```

---

## 🎯 Common Workflows

### **Workflow 1: Mark New Brainrot**

1. **Search** for brainrot name
2. Click ❌ to mark as **owned**
3. Click card to **expand**
4. Set **floor** (security level)
5. Select **mutation** (if any)
6. Add **traits** (if any)
7. See **calculated income** update

### **Workflow 2: Optimize Income**

1. **Filter** by "Owned"
2. **Sort** by "Income"
3. Click highest income brainrots
4. Try different **mutation** combos
5. Add best **traits**
6. See total account income increase

### **Workflow 3: Secure Valuable Brainrots**

1. **Filter** by rarity: "Secret" or "Brainrot God"
2. Click each owned brainrot
3. Set **Floor 5** 🔒
4. Ensure safety from theft

### **Workflow 4: Find Missing Brainrots**

1. **Filter** by "Not Owned"
2. **Sort** by "Rarity" or "Income"
3. See what you're missing
4. Target specific brainrots to hunt

---

## 💡 Pro Tips

### **Income Optimization:**

1. **Rainbow mutation** on highest base income
2. **Strawberry + Firework + Zombie** traits = best combo
3. Don't waste good mutations on low-income brainrots
4. Calculate before committing

### **Organization:**

1. Use **Floor 5** for Secrets and OG
2. Use **Floor 3-4** for Mythics and Legendaries
3. Use **Floor 1-2** for common brainrots
4. Filter by floor to see distribution

### **Slot Management:**

1. Watch slot usage bar (top)
2. **FULL** = can't add more
3. **CRITICAL** = almost full (plan rebirth)
4. **HIGH** = getting full
5. Delete low-value brainrots if needed

### **Efficient Navigation:**

1. Use **search** to find specific brainrots
2. Use **filters** to narrow down
3. **Sort by income** to find valuable ones
4. **Collapse details** when done editing

---

## 📊 Visual Indicators

### **Rarity Colors:**

Brainrot cards show colored borders when owned:

- 🟤 **Common**: Gray
- 🔵 **Rare**: Blue
- 🟣 **Epic**: Purple
- 🟡 **Legendary**: Gold
- 🩷 **Mythic**: Pink
- 🟧 **Secret**: Orange
- 🔴 **OG**: Red
- 💙 **Brainrot God**: Cyan

### **Status Icons:**

- ✅ **Owned** (green checkmark)
- ❌ **Not Owned** (gray X)
- 🔒 **Locked Floor** (floors 3-5)
- 🌈 **Rainbow Mutation** (highest multiplier)
- 🍓 **Strawberry Trait** (highest trait)

### **Income Display:**

- **Green** = Calculated income (with bonuses)
- **Gray** = Base income (no bonuses)
- **Larger** = Higher value

---

## ⚠️ Important Notes

### **Slots Limited:**

- Each rebirth level gives more slots
- Can't exceed slot limit
- Must rebirth or delete to add more

### **Mutations:**

- Only **1 mutation** per brainrot
- Changing mutation replaces previous
- Rainbow is best but rare

### **Traits:**

- Max **3 traits** per brainrot
- Can't add 4th until you remove one
- Traits stack additively

### **Floor Locks:**

- Requires sufficient rebirth level
- Can't set Floor 5 at RB 0
- Floor indicates security, not income

---

## 🎉 Summary

**Account Detail View Lets You:**
- ✅ Mark 439 brainrots as owned/not owned
- ✅ Set floor (security) for each
- ✅ Select from 12 mutations
- ✅ Add up to 3 traits from 20 options
- ✅ See income calculations automatically
- ✅ Search and filter efficiently
- ✅ Track slot usage in real-time

**Optimizations:**
- 🌈 Rainbow mutation = 10x multiplier
- 🍓 Strawberry trait = +10x bonus
- 🎆 Firework + 🧟 Zombie = +11x more
- 🔒 Floor 5 = maximum security

---

## 🚀 Quick Start

1. **Load demo data** (20 accounts with brainrots)
2. **Click "View Account →"** on any account
3. **Click a brainrot** to see details
4. **Try mutations and traits**
5. **Watch income update!**

**Access at: http://localhost:5173/** ✨🎮

