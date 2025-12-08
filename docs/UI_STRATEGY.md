# UI Build Strategy - Visual Guide

## 🎨 Design Philosophy

### Core Principles
1. **Data First** - Show brainrot info clearly
2. **Quick Actions** - Common tasks in <2 clicks
3. **Visual Feedback** - Always show what's happening
4. **Mobile First** - Design for smallest screen, enhance for desktop
5. **Cross-Account Visibility** - See everything, everywhere ✨

---

## 🖼️ Three-View System

### View 1: Account Overview Dashboard (Default)

```
┌──────────────────────────────────────────────────────────┐
│  🎮 Steal a Brainrot Tracker         [+ Add Account]     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  My Accounts (3)                                         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ 👤 Main Account                    [View →]│         │
│  │ Rebirth 10 | 26 slots | 20/26 used        │         │
│  │ ████████░░ HIGH (77%)                      │         │
│  │ 45 brainrots | $1.2B/s | Next: $350B      │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ 👤 Alt Storage                     [View →]│         │
│  │ Rebirth 2 | 18 slots | 18/18 used         │         │
│  │ ██████████ FULL (100%)                     │         │
│  │ 18 brainrots | $500K/s | Time to rebirth! │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ 👤 Grind Alt                       [View →]│         │
│  │ Rebirth 5 | 21 slots | 8/21 used          │         │
│  │ ███░░░░░░░ LOW (38%)                       │         │
│  │ 8 brainrots | $2.5M/s | Plenty of space   │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  Total Across All Accounts:                              │
│  71 brainrots | $1.203B/s | Average 62% full            │
└──────────────────────────────────────────────────────────┘
```

### View 2: Account Detail View (Click an account)

```
┌──────────────────────────────────────────────────────────┐
│  [← Back to Accounts]  👤 Main Account                   │
│  [Edit] [Delete]                                         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  RB: [10 ▼] | Slots: 20/26 ████████░░ HIGH              │
│  Total Income: $1.2B/s | Next RB: $350B (Need Girafa)   │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  [🔍 Search...] [Rarity ▼] [Owned ▼] [Floor ▼] [Sort ▼]│
└──────────────────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  ┌─────┐│  ┌─────┐│  ┌─────┐│  ┌─────┐│  ┌─────┐│
│  │🎮 ☑│  │  │🎮 ☐│  │  │🎮 ☑│  │  │🎮 ☐│  │  │🎮 ☐│  │
│  │Name │  │  │Name │  │  │Name │  │  │Name │  │  │Name │  │
│  │Epic │  │  │Rare │  │  │Leg. │  │  │Com. │  │  │Myth.│  │
│  │$10/s│  │  │$3/s │  │  │$50/s│  │  │$1/s │  │  │$100K│  │
│  │Floor3│  │     │  │Floor2│  │     │  │     │  │
│  │🌈×10│  │  │     │  │  │🔥×6 │  │  │     │  │  │     │  │
│  │🧟×5 │  │  │     │  │  │Floor│  │  │     │  │  │     │  │
│  └─────┘│  └─────┘│  └─────┘│  └─────┘│  └─────┘│
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### View 3: Total Collection View ✨ NEW!

```
┌──────────────────────────────────────────────────────────┐
│  [Dashboard] [📊 Total Collection] [Account Detail]     │
│  [← Back]                                                │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  [🔍 Search] [Rarity ▼] [Ownership ▼] [Sort ▼]          │
│  Filters: [All] [Owned] [Not Owned] [Duplicates]        │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  71/439 owned | 45 duplicates | Total: $1.203B/s        │
└──────────────────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  ┌─────┐│  ┌─────┐│  ┌─────┐│  ┌─────┐│  ┌─────┐│
│  │ Img │  │  │ Img │  │  │ Img │  │  │ Img │  │  │ Img │  │
│  │Name │  │  │Name │  │  │Name │  │  │Name │  │  │Name │  │
│  │Leg. │  │  │Rare │  │  │Epic │  │  │Com. │  │  │Myth.│  │
│  │$50/s│  │  │$3/s │  │  │$10/s│  │  │$1/s │  │  │$100K│  │
│  │     │  │  │     │  │  │     │  │  │     │  │  │     │  │
│  │Owned│  │  │Owned│  │  │Owned│  │  │Owned│  │  │Owned│  │
│  │by:  │  │  │by:  │  │  │by:  │  │  │by:  │  │  │by:  │  │
│  │✓Main│  │  │✗None│  │  │✓Main│  │  │✓Main│  │  │✓Alt │  │
│  │✓Alt │  │  │     │  │  │✓Alt │  │  │✗Alt │  │  │✓Grin│  │
│  │✓Grin│  │  │     │  │  │✗Grin│  │  │✗Grin│  │  │✗Main│  │
│  │3 acc│  │  │0 acc│  │  │2 acc│  │  │1 acc│  │  │2 acc│  │
│  └─────┘│  └─────┘│  └─────┘│  └─────┘│  └─────┘│
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🎯 Component Breakdown

### App Structure
```jsx
<App>
  └─ {view === 'dashboard' ? (
       <DashboardView>
         ├─ DashboardHeader
         ├─ AccountList
         │   └─ AccountCard (repeated)
         └─ GlobalStats
       </DashboardView>
     ) : (
       <AccountDetailView>
         ├─ DetailHeader
         ├─ AccountControls
         ├─ FilterBar
         └─ BrainrotGrid
       </AccountDetailView>
     )}
</App>
```

### 1. Dashboard Header
```jsx
<DashboardHeader>
  ├─ Logo/Title
  ├─ "Add Account" Button
  └─ Settings/Help (optional)
</DashboardHeader>
```

**Priority:** Phase 1 ✅  
**State:** None (static)  
**Actions:** Add account

### 2. Account Card (Dashboard View)
```jsx
<AccountCard account={account}>
  ├─ Account Name
  ├─ Rebirth Level Display
  ├─ Slot Usage Bar (visual)
  ├─ Stats Summary (owned, income)
  ├─ Status Badge (LOW/MEDIUM/HIGH/CRITICAL/FULL)
  ├─ "View" Button → Goes to detail view
  └─ Quick Actions (Edit, Delete)
</AccountCard>
```

**Priority:** Phase 4 ✅ MAIN COMPONENT  
**State:** Account data, collection count  
**Actions:** View details, edit account, delete

### 3. Global Stats (Dashboard)
```jsx
<GlobalStats accounts={accounts} collections={collections}>
  ├─ Total Brainrots Across All Accounts
  ├─ Total Income Per Second (all accounts)
  ├─ Average Slot Usage
  └─ Quick Summary Stats
</GlobalStats>
```

**Priority:** Phase 5  
**State:** Aggregated from all accounts  
**Actions:** None (display only)

### 4. Detail Header (Account Detail View)
```jsx
<DetailHeader account={currentAccount}>
  ├─ Back Button → Returns to dashboard
  ├─ Account Name
  ├─ Rebirth Selector
  ├─ Free Space Indicator
  └─ Action Buttons (Edit, Delete)
</DetailHeader>
```

**Priority:** Phase 4 ✅  
**State:** Current account, rebirth level  
**Actions:** Back, change rebirth, edit account

### 5. Filter Bar (Account Detail View)
```jsx
<FilterBar>
  ├─ SearchInput
  ├─ RarityFilter
  ├─ OwnershipFilter
  ├─ FloorFilter
  └─ SortDropdown
</FilterBar>
```

**Priority:** Phase 7  
**State:** Search term, active filters  
**Actions:** Filter, sort, clear

### 6. Account Controls (Account Detail View)
```jsx
<AccountControls account={currentAccount}>
  ├─ Rebirth Level Selector
  ├─ Slot Usage Display
  ├─ Total Income Display
  └─ Next Rebirth Progress
</AccountControls>
```

**Priority:** Phase 6  
**State:** Current account stats  
**Actions:** Change rebirth level

### 7. Brainrot Grid (Account Detail View)
```jsx
<BrainrotGrid>
  └─ BrainrotCard (repeated)
      ├─ Image
      ├─ Name
      ├─ RarityBadge
      ├─ CostDisplay
      ├─ IncomeDisplay
      ├─ OwnedCheckbox
      ├─ MutationSelector (if owned)
      ├─ TraitCheckboxes (if owned)
      ├─ FloorSelector (if owned)
      └─ CalculatedIncome (if owned)
</BrainrotGrid>
```

**Priority:** Phase 3 (basic), Phase 5 (full)  
**State:** Brainrots, collections  
**Actions:** Toggle owned, select mutation/traits/floor

---

## 🎨 Visual Design System

### Color Palette

**Rarity Colors:**
```css
Common:       #808080 (Gray)
Rare:         #00BFFF (Sky Blue)
Epic:         #9370DB (Purple)
Legendary:    #FFD700 (Gold)
Mythic:       #FF1493 (Deep Pink)
Secret:       #FF4500 (Orange Red)
OG:           #FF0000 (Red)
Brainrot God: #00FFFF (Cyan)
```

**Status Colors:**
```css
LOW:      #22c55e (Green)    0-49% full
MEDIUM:   #eab308 (Yellow)   50-74% full
HIGH:     #f97316 (Orange)   75-89% full
CRITICAL: #ef4444 (Red)      90-99% full
FULL:     #991b1b (Dark Red) 100% full
```

**UI Colors:**
```css
Background:   #0f172a (Dark Slate)
Surface:      #1e293b (Lighter Slate)
Border:       #334155 (Slate)
Text Primary: #f1f5f9 (Almost White)
Text Muted:   #94a3b8 (Gray)
Accent:       #3b82f6 (Blue)
```

### Typography
```css
Title:      text-2xl font-bold
Heading:    text-xl font-semibold
Subheading: text-lg font-medium
Body:       text-base font-normal
Small:      text-sm font-normal
Tiny:       text-xs font-normal
```

### Spacing Scale
```css
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
2xl: 3rem    (48px)
```

---

## 🔄 Navigation & State Flow

### View Navigation
```
Dashboard View (Default)
      ↓
  [View] button
      ↓
Account Detail View
      ↓
  [Back] button
      ↓
Dashboard View (refreshed stats)
```

### State Management
```
App.jsx
  ├─ currentView: 'dashboard' | 'detail'
  ├─ selectedAccount: accountId or null
  ├─ accounts: [...]
  └─ collections: { accountId: [...] }
```

### Navigation Flow
```javascript
// Dashboard → Detail
const viewAccount = (accountId) => {
  setSelectedAccount(accountId);
  setCurrentView('detail');
};

// Detail → Dashboard
const backToDashboard = () => {
  setSelectedAccount(null);
  setCurrentView('dashboard');
};
```

### Example: Adding Brainrot to Collection

```
1. User on Dashboard → Clicks "View" on Main Account
   ↓
2. App switches to Detail view
   ↓
3. User clicks checkbox on BrainrotCard
   ↓
4. onClick handler calls toggleOwned(brainrotId)
   ↓
5. Updates collections[currentAccount] state
   ↓
6. useLocalStorage hook saves to localStorage
   ↓
7. Component re-renders, checkbox checked
   ↓
8. User clicks "Back" button
   ↓
9. Returns to Dashboard (stats auto-updated) ✅
```

---

## 📱 Responsive Breakpoints

```css
Mobile:  < 640px   (1 column)
Tablet:  640-1024  (2 columns)
Desktop: > 1024px  (3-4 columns)
```

### Mobile Layout

**Dashboard View:**
```
┌──────────────┐
│   Header     │
│ [+ Add]      │
├──────────────┤
│ ┌──────────┐ │
│ │ Account  │ │
│ │ Card 1   │ │
│ │ [View]   │ │
│ └──────────┘ │
│ ┌──────────┐ │
│ │ Account  │ │
│ │ Card 2   │ │
│ │ [View]   │ │
│ └──────────┘ │
├──────────────┤
│ Global Stats │
└──────────────┘
```

**Detail View:**
```
┌──────────────┐
│ [← Back]     │
│ Account Info │
├──────────────┤
│ RB + Slots   │
├──────────────┤
│ [Search...]  │
│ [Filters]    │
├──────────────┤
│ ┌──────────┐ │
│ │Brainrot 1│ │
│ └──────────┘ │
│ ┌──────────┐ │
│ │Brainrot 2│ │
│ └──────────┘ │
```

### Desktop Layout

**Dashboard View:**
```
┌─────────────────────────────────────┐
│  Header                   [+ Add]   │
├─────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐        │
│ │ Account 1 │ │ Account 2 │        │
│ │ RB 10     │ │ RB 2      │        │
│ │ 20/26 ███ │ │ 18/18 ███ │        │
│ │ [View →]  │ │ [View →]  │        │
│ └───────────┘ └───────────┘        │
│ ┌───────────┐ ┌───────────┐        │
│ │ Account 3 │ │ Account 4 │        │
│ └───────────┘ └───────────┘        │
├─────────────────────────────────────┤
│ Global Stats: 71 total | $1.2B/s   │
└─────────────────────────────────────┘
```

**Detail View:**
```
┌─────────────────────────────────────┐
│ [← Back]  Account Info    RB:[10▼] │
│ Slots: 20/26 ████████░░ HIGH        │
├─────────────────────────────────────┤
│ [Search] [Filters] [Sort]           │
├───────────┬───────────┬─────────────┤
│ ┌───────┐│ ┌───────┐ │ ┌───────┐  │
│ │ Img ☑││ │ Img ☐ │ │ │ Img ☑ │  │
│ │ Name  ││ │ Name  │ │ │ Name  │  │
│ └───────┘│ └───────┘ │ └───────┘  │
```

---

## 🎯 User Flows

### Flow 1: New User First Time
```
1. Open app → Dashboard view
2. See "Main Account" card (default, empty)
3. Click "View" → Go to account detail
4. See all 439 brainrots (none owned yet)
5. Click checkbox on "Noobini Pizzanini" → Owned!
6. Click "Back" → Return to dashboard
7. Dashboard shows: "Main Account: 1 brainrot" ✅
```

### Flow 2: Multi-Account Overview
```
1. Open app → Dashboard view
2. See all accounts at a glance:
   - Main Account: 20/26 slots (HIGH)
   - Alt Storage: 18/18 slots (FULL) 🚨
   - Grind Alt: 8/21 slots (LOW)
3. Instantly see which account needs attention
4. Click "View" on Alt Storage → See what to clear
5. Click "Back" → Return to overview ✅
```

### Flow 3: Adding Valuable Brainrot
```
1. Dashboard → Click "View" on Main Account
2. Detail view → Search "Strawberry Elephant"
3. Click checkbox → Mark as owned
4. Select "Rainbow" mutation (10x)
5. Check "Zombie" (5x), "Strawberry" (10x) traits
6. Select "Floor 3" (safest)
7. See calculated income: $55B/s
8. Click "Back" → Dashboard now shows updated income ✅
```

### Flow 4: Creating Storage Alt
```
1. Dashboard → Click "+ Add Account"
2. Modal opens → Name: "Alt Storage"
3. Set rebirth level: 2 (18 slots)
4. Save → New card appears on dashboard
5. Click "View" on new account
6. Add storage brainrots (Secrets, OGs)
7. Click "Back" → See both accounts on dashboard ✅
```

### Flow 5: Slot Management Crisis
```
1. Dashboard → See "Main Account: 26/26 FULL" 🚨
2. Click "View" → Go to detail
3. See warning: "No space! Rebirth or sell"
4. Change rebirth from 10 → 11
5. Now shows: "26/27 slots (CRITICAL)"
6. Add one more brainrot → Now 27/27
7. Click "Back" → Dashboard reflects changes ✅
```

### Flow 6: Planning Next Rebirth
```
1. Dashboard → Click "View" on Main Account
2. Detail view shows: "Next RB: $350B (Need Girafa)"
3. See you have $200B saved
4. Check if you own Girafa Celestre → Yes!
5. Grind to $350B (can see progress)
6. When ready, change rebirth level
7. Click "Back" → Dashboard shows improved stats ✅
```

### Flow 7: Finding Duplicates ✨ NEW!
```
1. Dashboard → Click "📊 Total Collection"
2. Total Collection view loads (all 439 brainrots)
3. Click filter: "Duplicates"
4. See 45 brainrots owned on multiple accounts
5. Find "Strawberry Elephant" owned on 3 accounts:
   - ✓ Main ($55B/s with Rainbow)
   - ✓ Alt ($10B/s with Diamond)
   - ✓ Grind ($2B/s no mutation)
6. Decide to move Grind's copy to storage account
7. Click "Main →" on any to jump to that account ✅
```

### Flow 8: Finding Missing Brainrots ✨ NEW!
```
1. Total Collection → Filter: "Not Owned Anywhere"
2. See 368 brainrots you don't have yet
3. Sort by: "Rarity" → See missing Secrets at top
4. Find "Los Tralaleritos" (Secret, $750K/s)
5. Note: Need this for Rebirth 16!
6. Plan to grind for it
7. Click "Back" → Return to dashboard to check progress ✅
```

### Flow 9: Cross-Account Income Check ✨ NEW!
```
1. Total Collection view
2. Stats show: "Total: $1.203B/s across all accounts"
3. Filter: "Owned Somewhere"
4. See 71 owned brainrots
5. Sort by: "Total Income" (highest first)
6. See top earners:
   - Strawberry Elephant: $67B/s (across 3 accounts)
   - Secret 1: $25B/s (Main only)
   - Mythic 1: $15B/s (across 2 accounts)
7. Identify which brainrots contribute most
8. Plan to optimize mutations on these ✅
```

---

## 🚦 Build Order (Logical Progression)

### Phase 1: Foundation (2 hours)
```
Step 1 (30m): Setup + Tailwind + Basic Layout
Step 2 (30m): Data loading hooks (brainrots, localStorage)
Step 3 (1h):  Dashboard View skeleton
```

### Phase 2: Dashboard (2 hours)
```
Step 4 (1h):  AccountCard component
Step 5 (30m): Account list with mock data
Step 6 (30m): Add/Edit/Delete account functionality
```

### Phase 3: Detail View (2 hours)
```
Step 7 (30m): Navigation (Dashboard ↔ Detail)
Step 8 (1h):  BrainrotCard component
Step 9 (30m): BrainrotGrid with current account data
```

### Phase 4: Collection Tracking (2 hours)
```
Step 10 (1h):  Ownership checkbox + persistence
Step 11 (30m): Mutation/trait selectors
Step 12 (30m): Income calculation display
```

### Phase 5: Rebirth & Slots (1 hour)
```
Step 13 (30m): Rebirth selector on AccountCard
Step 14 (30m): Free space indicator with colors
```

### Phase 6: Polish (1 hour)
```
Step 15 (30m): Search + filters
Step 16 (30m): Final touches + deploy
```

**Total: ~10 hours (was 8, but more polished result!)**

---

## ⚡ Quick Start Commands

```bash
# Phase 1: Setup (Run these now!)
npm create vite@latest brainrot-tracker -- --template react
cd brainrot-tracker
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Copy data
cp -r ../data ./src/
cp -r ../public/thumbnails ./public/
cp ../src/incomeCalculator.js ./src/utils/
cp ../scripts/rebirthCalculator.js ./src/utils/

# Start dev server
npm run dev
```

---

## 🎉 Success Criteria

### MVP (Minimum Viable Product)
- [ ] **Dashboard View** showing all accounts at a glance
- [ ] **Account Cards** with rebirth, slots, and status
- [ ] **Detail View** for individual account management
- [ ] **Navigate** between Dashboard ↔ Detail views
- [ ] Mark brainrots as owned per account
- [ ] Persist data in localStorage
- [ ] Add/edit/delete accounts
- [ ] Track rebirth level and calculate slots

### V1.0 (Full Features)
- [ ] All MVP features ✅
- [ ] **Global stats** across all accounts on dashboard
- [ ] Calculate income with mutations/traits
- [ ] Floor assignment for brainrots
- [ ] Free space visual indicators (color-coded)
- [ ] Search and filter in detail view
- [ ] Mobile responsive (both views)
- [ ] Next rebirth requirements display

### V1.1 (Polish)
- [ ] All V1.0 features ✅
- [ ] **Quick actions** on account cards (edit/delete)
- [ ] **Sort accounts** on dashboard (by slots, income, etc.)
- [ ] Dark mode toggle
- [ ] Export/import all account data
- [ ] Keyboard shortcuts (ESC to go back, etc.)
- [ ] Help tooltips
- [ ] Deploy to production

### Key User Experience Goals
- ✅ See ALL accounts status instantly
- ✅ Quickly identify which account needs attention (FULL slots, etc.)
- ✅ Drill down to manage individual account
- ✅ Navigate back without losing context
- ✅ Multi-account comparison at a glance
- ✅ **See ALL brainrots across ALL accounts** ✨
- ✅ **Find duplicates and missing brainrots** ✨
- ✅ **Cross-account income analysis** ✨

---

## 🚀 Ready to Build!

**Recommended Starting Point:**
1. Run the Quick Start Commands
2. Build Layout.jsx (header + container)
3. Build BrainrotCard.jsx (simple version)
4. Test with 10 brainrots
5. Iterate from there!

**Let's start with Phase 1 setup!** 🎨

