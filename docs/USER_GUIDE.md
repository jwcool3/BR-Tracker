# 📖 Brainrot Tracker - Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Accounts](#managing-accounts)
4. [Adding & Managing Brainrots](#adding--managing-brainrots)
5. [Drag & Drop](#drag--drop)
6. [Total Collection View](#total-collection-view)
7. [Data Management](#data-management)
8. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### Quick Start
1. Open the app at `http://localhost:5173/`
2. Click "Data" → "Load Demo Data" to test with sample accounts
3. Explore the three main views:
   - **Dashboard** - Overview of all accounts
   - **Account Detail** - Manage individual account
   - **Total Collection** - See all brainrots across accounts

---

## Dashboard Overview

### Three View Modes

**1. Grouped View (Default)**
- Accounts organized by status (Full, Critical, High, etc.)
- Collapsible sections
- Best for 10-50 accounts

**2. Card View**
- Traditional card grid
- Shows all accounts
- Best for 5-20 accounts

**3. Table View**
- Compact spreadsheet format
- Sortable columns
- Best for 20+ accounts

### Account Status Colors
- 🔴 **FULL** - 100% capacity (red)
- 🟠 **CRITICAL** - 90-99% capacity (orange)
- 🟡 **HIGH** - 75-89% capacity (yellow)
- 🟢 **MEDIUM** - 50-74% capacity (green)
- 🔵 **LOW** - 0-49% capacity (blue)

---

## Managing Accounts

### Create New Account
1. Click "+ Add Account"
2. Enter account name
3. (Optional) Click "Advanced" for:
   - Rebirth level
   - Color tag
   - Tags (comma-separated)
   - Notes
   - Favorite checkbox

### Edit Account
1. Hover over account card
2. Click edit icon (pencil)
3. Update fields
4. Save

### Delete Account
1. Hover over account card
2. Click delete icon (trash)
3. Confirm deletion

### Account Features
- **Tags** - Organize accounts (e.g., "main", "storage", "grind")
- **Colors** - Visual identification
- **Favorites** - Pin important accounts
- **Hidden** - Hide inactive accounts

---

## Adding & Managing Brainrots

### View Account Brainrots
1. Click "View Account" on any account card
2. See all owned brainrots (default filter)
3. Click "+ Add Brainrots" to see available brainrots

### Add Single Brainrot

**Quick Add (Default Settings):**
- Brainrot added with: 1x quantity, no mutation, no modifiers, floor 1
- Can configure later

**Advanced Add:**
1. Click brainrot card to expand
2. **Select Mutation:**
   - 5 common mutations shown by default
   - Click "More" to see all 12
   - Select mutation (colored button grid)
3. **Select Modifiers:**
   - 8 common modifiers shown
   - Use search bar to find specific ones
   - Click to toggle modifiers
4. **Choose Floor:** Select 1-5
5. **Set Quantity:** Use +/- buttons
6. Click "Add to Account"

### Edit Existing Brainrot
1. Click owned brainrot card to expand
2. Change mutation, modifiers, or floor
3. Changes save automatically

### Remove Brainrot
1. Expand brainrot card
2. Click "Remove from Account"

### Income Calculation
- **Base Income** - Original brainrot value
- **Mutation Multiplier** - Applied to base (1x to 10x)
- **Modifiers** - Stack additively, then multiply
- **Formula:** `Base × Mutation × (1 + Sum of Modifiers)`

**Example:**
- Base: $50M/s
- Mutation: Rainbow (10x)
- Modifiers: Zombie (+5x), Firework (+6x), Strawberry (+10x)
- **Calculation:** $50M × 10 × (1 + 5 + 6 + 10) = $50M × 10 × 22 = **$11B/s**

---

## Drag & Drop

### Single Brainrot Drag & Drop

**Step 1: Start Dragging**
1. View any account
2. Hover over owned brainrot
3. Drag handle (⋮⋮) appears top-left
4. Click & hold drag handle
5. Card becomes semi-transparent

**Step 2: Drop on Account**
1. Navigate to Dashboard (keep holding!)
2. Hover over target account card
3. Blue ring appears with "Drop to Copy Here"
4. Release to copy brainrot

**Result:**
- ✅ Brainrot copied to target account
- ✅ Preserves mutation, modifiers, and floor
- ✅ Original remains in source account

### Bulk Drag & Drop

**Step 1: Enable Bulk Mode**
1. View any account
2. Click "Bulk Mode" button (top-right)
3. Checkboxes appear on all cards

**Step 2: Select Multiple**
1. Click brainrot cards to select
2. Purple rings indicate selection
3. Counter shows "X selected"
4. Use "Select All" or "Clear" buttons

**Step 3: Drag Multiple**
1. Purple drag handle (⋮⋮) appears on selected cards
2. Click & hold purple handle on any selected card
3. Drag overlay shows "X Brainrots"
4. Drop on target account
5. All selected brainrots copied at once!

### Bulk Actions
- **Select All** - Select all visible owned brainrots
- **Clear** - Deselect all
- **Delete Selected** - Remove all selected (red button)

### Use Cases

**Duplicate Best Setup:**
- Have Rainbow Elephant on Main
- Want same on Alt 3, Alt 5, Storage
- Drag once to each → Done in 30 seconds!

**Bulk Transfer:**
- Move top 10 income brainrots to Trading
- Bulk Mode → Select 10 → Drag → Drop
- Done in 1 minute!

**Account Consolidation:**
- Merge 3 storage accounts into 1
- Bulk select all from each → Drag to main
- Done in 3 minutes!

---

## Total Collection View

### Overview
See **all brainrots** from **all accounts** in one place.

### Default Filter
- Shows only **owned brainrots** by default
- Click filters to see all available brainrots

### Statistics Dashboard
- **Unique Owned** - Different brainrots you have
- **Missing** - Brainrots you don't own yet
- **Duplicates** - Brainrots on multiple accounts
- **Total Income** - Combined income across all accounts

### Quick Filters
- **Missing** - Show only brainrots you don't own
- **Duplicates** - Show only brainrots on 2+ accounts
- **Unique** - Show only brainrots on 1 account
- **All Owned** - Show all owned brainrots

### Brainrot Cards
Each card shows:
- **Status Badge** - Missing/Unique/Duplicate (top-right)
- **Rarity + Count** - Combined badge
- **Thumbnail** - With mutation/modifier indicators
- **Account List** - Where you own it
- **Income Per Account** - Individual + total
- **Mutations & Modifiers** - Visual badges per account

### Sorting
- **Name** - Alphabetical
- **Rarity** - Common → Brainrot God
- **Ownership** - Most owned → least
- **Income** - Highest → lowest

### Use Cases

**Find Missing Brainrots:**
- Click "Missing" quick filter
- See what you still need
- Plan acquisitions

**Manage Duplicates:**
- Click "Duplicates" quick filter
- See which accounts have same brainrot
- Compare setups (mutations/modifiers)
- Decide which to keep

**Strategic Planning:**
- Sort by Income
- See your highest earners
- Optimize across accounts

---

## Data Management

### Export Data
1. Click "Data" button (header)
2. Click "Export to File"
3. JSON file downloads
4. Save as backup

### Import Data
1. Click "Data" button
2. Click "Import from File"
3. Select JSON file
4. Data replaces current data
5. Confirm import

### Clear All Data
1. Click "Data" button
2. Click "Clear All Data"
3. Confirm deletion
4. All accounts & brainrots deleted

### Load Demo Data
1. Click "Data" button
2. Click "Load Demo Data"
3. 20 sample accounts created
4. Test the app with realistic data

**Demo Data Includes:**
- 20 accounts (various rebirth levels)
- Realistic brainrot distributions
- Mutations & modifiers
- Tags, favorites, colors

---

## Tips & Tricks

### Keyboard Shortcuts
- `ESC` - Close modal/card
- `Ctrl+F` or `/` - Focus search
- Click card in bulk mode - Toggle selection

### Efficient Workflows

**Quick Add Multiple:**
1. Filter to specific rarity
2. Bulk Mode → Select All
3. Exit Bulk Mode
4. Cards stay selected
5. Add mutations/modifiers individually

**Template Account:**
1. Create "Template" account
2. Add all best setups
3. Drag brainrots to new accounts as needed
4. Consistent configurations

**Income Optimization:**
1. Go to Total Collection
2. Sort by Income
3. Filter: Owned
4. See your top earners
5. Focus on upgrading those

**Bulk Cleanup:**
1. View account with many brainrots
2. Bulk Mode
3. Select unwanted brainrots
4. Delete Selected
5. Clean in seconds!

### Visual Indicators

**On Thumbnails:**
- **Mutation Badge** (top-left) - Colored, shows name
- **Modifier Icons** (bottom) - Emoji icons (up to 6)
- **Colored Border** - Mutation glow effect

**Card States:**
- **Normal** - Rarity-colored border
- **Selected** - Purple ring (bulk mode)
- **Dragging** - Semi-transparent
- **Drop Zone** - Blue ring + overlay

### Search Tips
- Search brainrot names
- Search modifiers
- Case-insensitive
- Partial matches work

### Filter Combinations
Combine filters for powerful searches:
- **Rarity:** Legendary + **Ownership:** Owned = Your legendary brainrots
- **Floor:** 5 + **Search:** "Elephant" = Floor 5 Elephants
- **Mutation:** Any owned brainrot with mutations

---

## Common Questions

**Q: Can I undo accidental deletions?**
A: Not currently. Export data regularly as backup!

**Q: How do I know which mutation is best?**
A: Rainbow (10x) is the best! Then Radioactive (8.5x), Yin Yang (7.5x).

**Q: What are the best modifiers?**
A: Strawberry (+10x), Firework (+6x), Nyan (+6x), Fire (+6x), Paint (+6x), Zombie (+5x).

**Q: Can I import/export specific accounts?**
A: Currently exports all data. Manual JSON editing possible.

**Q: Does drag & drop work on mobile?**
A: Yes! Touch-based drag & drop is supported.

**Q: How many accounts can I have?**
A: Unlimited! UI scales to 50+ accounts easily.

**Q: Where is data stored?**
A: LocalStorage in your browser. Export regularly!

---

## Need Help?

- Check **CHANGELOG.md** for recent changes
- See **DEVELOPER_GUIDE.md** for technical details
- Review **SCRAPING_GUIDE.md** for data updates

**Enjoy your Brainrot Tracker!** 🎮✨

