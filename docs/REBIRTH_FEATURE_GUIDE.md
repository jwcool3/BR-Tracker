# Rebirth & Free Space Tracking - Feature Guide

## 🎉 NEW FEATURES ADDED!

### What's New?
1. **Rebirth Level Tracking** - Track each account's rebirth progress (0-17)
2. **Automatic Slot Calculation** - Base slots calculated from rebirth level
3. **Free Space Display** - See available slots at a glance
4. **Floor Management** - Track which floor brainrots are placed on
5. **Rebirth Planning** - View requirements for next rebirth

---

## 📊 Rebirth System Overview

### How Slots Work
- **Starting Slots**: 10 (Floor 1 only)
- **After Rebirth 1**: Still 10 slots (only rebirth that doesn't add slots!)
- **Rebirth 2+**: +1 slot per rebirth level
- **Maximum Slots**: 33 at Rebirth 17

### Floor Unlocks
- **Floor 1**: Available from start (10 slots max)
- **Floor 2**: Unlocks at Rebirth 2 (grows to 12 slots max)
- **Floor 3**: Unlocks at Rebirth 10 (grows to 11 slots max)

### Security by Floor
- **Floor 1**: EASY to steal from (ground level)
- **Floor 2**: MEDIUM security (requires stairs)
- **Floor 3**: HARD to steal from (requires ladder) ⭐ Best for valuable brainrots!

---

## 🗂️ Updated Data Structure

### Account with Rebirth Tracking
```javascript
{
  id: "acc-main",
  name: "Main Account",
  rebirthLevel: 10,        // NEW! Tracks rebirth progress
  notes: "Main grinding account",
  createdAt: "2024-12-08"
}
```

### Brainrot with Floor Tracking
```javascript
{
  brainrotId: "strawberry-elephant",
  mutation: "rainbow",
  traits: ["zombie", "strawberry"],
  calculatedIncome: 55000000000,
  floor: 3                  // NEW! Which floor it's on (1, 2, or 3)
}
```

### Complete localStorage Structure
```javascript
{
  accounts: [
    { 
      id: "acc-1", 
      name: "Main Account",
      rebirthLevel: 10,
      notes: "Main account"
    },
    { 
      id: "acc-2", 
      name: "Alt Storage",
      rebirthLevel: 2,
      notes: "Storage for secrets"
    }
  ],
  collections: {
    "acc-1": [
      {
        brainrotId: "strawberry-elephant",
        mutation: "rainbow",
        traits: ["zombie", "firework", "strawberry"],
        calculatedIncome: 55000000000,
        floor: 3  // Safest floor!
      },
      {
        brainrotId: "noobini-pizzanini",
        mutation: null,
        traits: [],
        calculatedIncome: 1,
        floor: 1  // Least valuable, easy to steal
      }
    ]
  },
  currentAccount: "acc-1"
}
```

---

## 🔧 New Calculator Functions

### 1. Calculate Slots by Rebirth Level
```javascript
import { calculateSlots } from './src/rebirthCalculator.js';

const slots = calculateSlots(10);
// Returns:
// {
//   rebirthLevel: 10,
//   totalSlots: 26,
//   floors: 3,
//   slotBreakdown: { floor_1: 10, floor_2: 12, floor_3: 4 },
//   lockTime: 160,
//   multiplier: 10.0
// }
```

### 2. Calculate Free Space
```javascript
import { calculateFreeSpace } from './src/rebirthCalculator.js';

const space = calculateFreeSpace(10, 20); // rebirth 10, 20 brainrots owned
// Returns:
// {
//   totalSlots: 26,
//   usedSlots: 20,
//   freeSlots: 6,
//   percentFull: 76.9,
//   isFull: false,
//   status: "HIGH"  // LOW / MEDIUM / HIGH / CRITICAL / FULL
// }
```

### 3. Get Rebirth Requirements
```javascript
import { getRebirthRequirements } from './src/rebirthCalculator.js';

const req = getRebirthRequirements(11);
// Returns:
// {
//   level: 11,
//   name: "Rebirth 11",
//   cashRequired: 5000000000000,  // $5T
//   brainrotsRequired: ["Matteo"],
//   rewards: {
//     multiplier: 11.0,
//     starting_cash: 1000000000000,
//     base_slots: 27,
//     lock_time_seconds: 170
//   },
//   notes: "Final rebirth to unlock a slap"
// }
```

### 4. Optimal Floor Placement
```javascript
import { calculateFloorPlacement } from './src/rebirthCalculator.js';

const brainrots = [
  { name: "Secret 1", income_per_second: 1000000 },
  { name: "Common 1", income_per_second: 1 }
];

const placement = calculateFloorPlacement(brainrots, 10);
// Returns recommendations for which floor to place each brainrot
// Most valuable → Floor 3 (hardest to steal)
// Least valuable → Floor 1 (easiest to steal)
```

---

## 🎨 UI Components to Add

### 1. Account Card Component
```jsx
<AccountCard
  account={account}
  onRebirthChange={(newLevel) => updateRebirth(account.id, newLevel)}
/>

// Displays:
// - Account name
// - Rebirth level selector (0-17)
// - Total slots available
// - Free space indicator with color
// - Lock time
// - Multiplier
```

### 2. Free Space Indicator
```jsx
<FreeSpaceIndicator
  usedSlots={20}
  totalSlots={26}
  status="HIGH"  // Changes color based on status
/>

// Visual Examples:
// LOW (0-50%):      ████░░░░░░ 20% full - GREEN
// MEDIUM (50-75%):  ██████░░░░ 60% full - YELLOW
// HIGH (75-90%):    ████████░░ 83% full - ORANGE
// CRITICAL (90-99%): █████████░ 95% full - RED
// FULL (100%):      ██████████ FULL - DARK RED
```

### 3. Floor Management Panel
```jsx
<FloorManager
  rebirthLevel={10}
  brainrots={accountBrainrots}
  onFloorChange={(brainrotId, newFloor) => updateFloor(brainrotId, newFloor)}
/>

// Shows:
// - Floor 1 (10 slots): [brainrot list]
// - Floor 2 (12 slots): [brainrot list]
// - Floor 3 (4 slots): [brainrot list]  ⭐ MOST SECURE
// - Drag and drop to move between floors
// - Security indicator per floor
```

### 4. Rebirth Progress Tracker
```jsx
<RebirthProgressBar
  currentRebirth={9}
  nextRebirth={10}
  currentCash={850000000000}  // $850B
  requiredCash={1000000000000} // $1T
  requiredBrainrots={["Girafa Celestre"]}
  ownedBrainrots={["Girafa Celestre"]} // Green checkmark if owned
/>

// Shows progress bar to next rebirth
// Highlights rewards for next level (3rd floor unlock!)
```

### 5. Slot Overview Dashboard
```jsx
<SlotOverview accounts={accounts} collections={collections}>

// Table showing all accounts:
// ┌──────────────┬─────────┬──────────┬────────────┬────────┐
// │ Account      │ Rebirth │ Slots    │ Free Space │ Status │
// ├──────────────┼─────────┼──────────┼────────────┼────────┤
// │ Main Account │ RB 10   │ 20/26    │ 6 slots    │ HIGH   │
// │ Alt Storage  │ RB 2    │ 18/18    │ 0 slots    │ FULL   │
// │ Grind Alt    │ RB 5    │ 10/21    │ 11 slots   │ LOW    │
// └──────────────┴─────────┴──────────┴────────────┴────────┘
```

---

## 📈 Example Use Cases

### Use Case 1: New Player Tracking
```javascript
// Player just started
const account = {
  name: "My First Account",
  rebirthLevel: 0  // No rebirth yet
};

calculateSlots(0);
// → 10 slots, 1 floor, 60s lock time, 1.0x multiplier

calculateFreeSpace(0, 5);
// → 5 free slots, 50% full, "MEDIUM" status
```

### Use Case 2: Planning Storage Space
```javascript
// Player wants to know if they have room for new Secret
const currentBrainrots = 24;
const rebirthLevel = 10;

const space = calculateFreeSpace(rebirthLevel, currentBrainrots);
// → 2 free slots remaining, 92.3% full, "CRITICAL" status
// Warning: "Consider rebirthing or clearing low-value brainrots!"
```

### Use Case 3: Optimal Placement Strategy
```javascript
// Player just got floor 3, wants to organize
const myBrainrots = [
  { name: "Los Tralaleritos (Secret)", income: 750000 },
  { name: "Strawberry Elephant (God)", income: 250000000 },
  { name: "Noobini Pizzanini (Common)", income: 1 }
];

const placement = calculateFloorPlacement(myBrainrots, 10);
// Floor 3 (Most Secure): Strawberry Elephant, Los Tralaleritos
// Floor 2 (Medium): 
// Floor 1 (Least Secure): Noobini Pizzanini
```

### Use Case 4: Multi-Account Comparison
```javascript
// Compare storage across accounts
const accounts = [
  { name: "Main", rebirth: 10, brainrots: 26 },
  { name: "Alt 1", rebirth: 2, brainrots: 5 },
  { name: "Alt 2", rebirth: 0, brainrots: 10 }
];

accounts.forEach(acc => {
  const space = calculateFreeSpace(acc.rebirth, acc.brainrots);
  console.log(`${acc.name}: ${space.freeSlots} free (${space.status})`);
});
// Main: 0 free (FULL) ← Need to rebirth or sell
// Alt 1: 13 free (LOW) ← Plenty of space
// Alt 2: 0 free (FULL) ← Time to rebirth!
```

---

## 🎯 Best Practices

### 1. Slot Management
- **Keep 2-3 slots free** for quick steals/purchases
- **FULL status** = Time to rebirth or clear commons
- **CRITICAL status** = Plan your next moves carefully

### 2. Floor Strategy
- **Floor 3**: Secrets, OGs, high-mutation Gods
- **Floor 2**: Mythics, Gods without mutations
- **Floor 1**: Commons, Rares, fodder for selling

### 3. Rebirth Timing
- Rebirth when you hit requirements (don't wait!)
- Use alt account to store valuable brainrots
- Floor 3 unlock at RB10 is HUGE milestone

### 4. Multi-Account Planning
- **Main account**: Push rebirths for multipliers
- **Alt accounts**: Storage for secrets during main rebirth
- **Grind alts**: Farm specific brainrots for main

---

## 📋 Data Files Created

### 1. `data/rebirths.json`
Complete rebirth data including:
- Requirements (cash + brainrots) for each level
- Rewards (multiplier, slots, lock time, items)
- Slot breakdown by floor
- Special notes (floor unlocks, final mythic requirement, etc.)

### 2. `src/rebirthCalculator.js`
Utility functions for:
- `calculateSlots()` - Get slots from rebirth level
- `calculateFreeSpace()` - Calculate available space
- `getRebirthRequirements()` - Get next rebirth info
- `calculateFloorPlacement()` - Optimal placement strategy
- `formatCash()` - Format large numbers ($1.5T, etc.)

---

## 🚀 Integration Steps

### Step 1: Add Rebirth to Account Creation
```jsx
function createAccount(name) {
  return {
    id: generateId(),
    name,
    rebirthLevel: 0,  // Start at 0
    notes: "",
    createdAt: new Date().toISOString()
  };
}
```

### Step 2: Add Rebirth Selector to Account Manager
```jsx
<select 
  value={account.rebirthLevel}
  onChange={(e) => updateAccountRebirth(account.id, Number(e.target.value))}
>
  {[...Array(18)].map((_, i) => (
    <option key={i} value={i}>
      Rebirth {i} - {calculateSlots(i).totalSlots} slots
    </option>
  ))}
</select>
```

### Step 3: Show Free Space in UI
```jsx
const space = calculateFreeSpace(
  account.rebirthLevel,
  collections[account.id]?.length || 0
);

<div className={`space-indicator ${space.status.toLowerCase()}`}>
  {space.freeSlots}/{space.totalSlots} slots free ({space.percentFull}%)
</div>
```

### Step 4: Add Floor Assignment to Brainrot Cards
```jsx
<select
  value={brainrot.floor || 1}
  onChange={(e) => updateBrainrotFloor(brainrot.id, Number(e.target.value))}
>
  <option value={1}>Floor 1 (Easy to steal)</option>
  {floors >= 2 && <option value={2}>Floor 2 (Medium)</option>}
  {floors >= 3 && <option value={3}>Floor 3 (Hard to steal) ⭐</option>}
</select>
```

---

## 🎨 Color Scheme for Status

```css
.status-low { 
  background: #22c55e; /* Green */
  color: white;
}

.status-medium { 
  background: #eab308; /* Yellow */
  color: black;
}

.status-high { 
  background: #f97316; /* Orange */
  color: white;
}

.status-critical { 
  background: #ef4444; /* Red */
  color: white;
  animation: pulse 2s infinite;
}

.status-full { 
  background: #991b1b; /* Dark Red */
  color: white;
  font-weight: bold;
}
```

---

## 🧪 Test the Calculator

Run the test file to see examples:
```bash
cd /mnt/user-data/outputs/steal-a-brainrot-tracker
node src/rebirthCalculator.js
```

You'll see:
- Slot calculations for different rebirth levels
- Free space examples
- Rebirth requirement lookups
- Floor placement strategies
- Formatted cash displays

---

## 📚 Quick Reference Tables

### Rebirth Milestones
| Rebirth | Slots | Floors | Lock Time | Multiplier | Notable Reward |
|---------|-------|--------|-----------|------------|----------------|
| 0       | 10    | 1      | 60s       | 1.0x       | Starting point |
| 2       | 18    | 2      | 80s       | 2.0x       | **2nd Floor unlocked!** |
| 10      | 26    | 3      | 160s      | 10.0x      | **3rd Floor unlocked!** |
| 17      | 33    | 3      | 230s      | 17.0x      | Maximum rebirth |

### Space Status Thresholds
| Status   | % Full  | Color  | Action Needed |
|----------|---------|--------|---------------|
| LOW      | 0-49%   | Green  | Plenty of space |
| MEDIUM   | 50-74%  | Yellow | Monitor space |
| HIGH     | 75-89%  | Orange | Plan clearing |
| CRITICAL | 90-99%  | Red    | Clear soon! |
| FULL     | 100%    | Dark Red | Rebirth or sell NOW |

---

**All features tested and ready to integrate!** 🎉
