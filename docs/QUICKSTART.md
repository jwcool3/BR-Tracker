# Quick Start Guide

## 🎯 Current Status

✅ **Database Ready** - 439 brainrots (294 with full data)  
✅ **Images Downloaded** - 317 thumbnail images  
✅ **Calculator Working** - Mutations & traits tested  
✅ **Project Organized** - Clean folder structure  
🚀 **Next Step** - Build React app!

## 📁 Project Structure

```
BR Tracker/
├── data/
│   └── brainrots.json          # 439 brainrots ✅
├── public/
│   └── thumbnails/             # 317 images ✅
├── src/
│   └── incomeCalculator.js     # Calculator ✅
├── scripts/                    # Python tools
└── docs/                       # Documentation
```

## 🚀 Get Started in 3 Steps

### Step 1: Review the Data (2 minutes)

```bash
# Check the database
cat data/brainrots.json | head -50

# Check available images
ls public/thumbnails/ | wc -l  # Should show 317
```

**Database has:**
- 439 total brainrots
- 294 with cost + income data (67%)
- 145 with images only (33%)
- All 8 rarity tiers mapped

### Step 2: Test the Calculator (1 minute)

```bash
# Run calculator examples
node src/incomeCalculator.js
```

**Formula:**
```javascript
Final Income = Base × Mutation × (1 + Sum of Traits)
```

**Example Output:**
```
Example 1: Noobini Pizzanini ($1/s)
  → Result: $1/s

Example 2: Rainbow mutation ($1M/s × 10)
  → Result: $10M/s

Example 3: Rainbow + 3 traits ($250M/s × 10 × 22)
  → Result: $55 BILLION/s!
```

### Step 3: Build React App (Setup: 15 min, Build: 4-6 hours)

```bash
# Create new React app
npm create vite@latest brainrot-tracker-app -- --template react
cd brainrot-tracker-app

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Copy project files
cp -r ../data ./src/
cp -r ../public/thumbnails ./public/
cp ../src/incomeCalculator.js ./src/utils/

# Start development
npm run dev
```

## 💰 Income Formula Cheat Sheet

### Best Mutations
```
Rainbow:      10x   (BEST!)
Radioactive:  8.5x
Yin Yang:     7.5x
Lava/Galaxy:  6x
```

### Best Traits (Stack These!)
```
Strawberry:   +10x  (BEST!)
Paint:        +6x
Nyan:         +6x
Fire:         +6x
Firework:     +6x
Zombie:       +5x

⚠️ Sleepy:    -0.5x (AVOID!)
```

### Quick Calculation Examples

**Scenario 1: Early Game**
```
Base:      $100/s
Mutation:  Gold (1.25x)
Traits:    None
Result:    $125/s
```

**Scenario 2: Mid Game**
```
Base:      $50K/s
Mutation:  Lava (6x)
Traits:    Fire (+6x)
Result:    $50K × 6 × 7 = $2.1M/s
```

**Scenario 3: End Game (God Tier)**
```
Base:      $250M/s
Mutation:  Rainbow (10x)
Traits:    Zombie + Firework + Strawberry (21x)
Result:    $250M × 10 × 22 = $55B/s
```

## 🎮 App Features to Build

### Core (Must Have) - 4 hours
- [ ] Display brainrot grid with images
- [ ] Search bar
- [ ] Rarity filter
- [ ] Account switcher
- [ ] Checkbox "I have this"
- [ ] Mutation dropdown
- [ ] Traits multi-select
- [ ] Live income calculation
- [ ] Total income display per account

### Nice to Have - 2 hours
- [ ] Dark mode toggle
- [ ] Sort by income/rarity/name/cost
- [ ] Completion percentage bar
- [ ] Export/import JSON
- [ ] Mobile responsive
- [ ] Animated income counter

## 🎨 Component Structure

```javascript
App.jsx
├── Header (logo, account selector)
├── StatsDashboard (totals, completion %)
├── FilterBar (search, rarity filter, sort)
└── BrainrotList
    └── BrainrotCard (repeat for each)
        ├── Image
        ├── Name
        ├── Rarity badge
        ├── Cost/Income display
        ├── Checkbox (owned)
        ├── Mutation selector
        └── Traits multi-select
```

## 📊 Sample Component Code

### BrainrotCard.jsx (Starter)
```jsx
function BrainrotCard({ brainrot, isOwned, onToggle }) {
  return (
    <div className="card border rounded-lg p-4">
      <img 
        src={brainrot.image} 
        alt={brainrot.name}
        className="w-full h-32 object-contain"
      />
      <h3 className="font-bold">{brainrot.name}</h3>
      <span className={`badge ${brainrot.rarity}`}>
        {brainrot.rarity}
      </span>
      <p>Cost: ${brainrot.cost?.toLocaleString() || 'Unknown'}</p>
      <p>Income: ${brainrot.income_per_second?.toLocaleString() || '?'}/s</p>
      <label>
        <input 
          type="checkbox" 
          checked={isOwned}
          onChange={onToggle}
        />
        I have this
      </label>
    </div>
  );
}
```

## 🗂️ LocalStorage Structure

```javascript
{
  accounts: [
    { id: "acc1", name: "Main Account" },
    { id: "acc2", name: "Alt Account" }
  ],
  collections: {
    "acc1": [
      {
        brainrotId: "strawberry-elephant",
        owned: true,
        mutation: "rainbow",
        traits: ["zombie", "firework", "strawberry"],
        calculatedIncome: 55000000000
      }
    ],
    "acc2": [...]
  },
  currentAccount: "acc1"
}
```

## 🛠️ Useful Scripts

### Update Database
```bash
# Re-scrape thumbnails from wiki
python scripts/scrape_thumbnails.py

# Merge with existing data
python scripts/fix_thumbnail_names.py
```

### Fix Thumbnail Names
```bash
# Edit corrections file
code data/thumbnail_corrections.json

# Apply corrections
python scripts/fix_thumbnail_names.py
```

## 📚 Quick Links

- **Data File**: `data/brainrots.json`
- **Calculator**: `src/incomeCalculator.js`
- **Images**: `public/thumbnails/`
- **Full Docs**: `docs/PROJECT_SUMMARY.md`

## ⚡ Tips

1. **Start Simple** - Build basic grid first, add features later
2. **Use Tailwind** - Faster than custom CSS
3. **Test Calculator** - Verify income calculations early
4. **LocalStorage Early** - Implement persistence from the start
5. **Mobile First** - Design for mobile, enhance for desktop

## 🎯 Time Estimates

| Task | Time |
|------|------|
| Setup React + Tailwind | 15 min |
| Basic grid display | 30 min |
| BrainrotCard component | 45 min |
| Search & filter | 1 hour |
| Account management | 1 hour |
| Mutation/trait selectors | 1.5 hours |
| Income calculator integration | 30 min |
| LocalStorage persistence | 1 hour |
| Stats dashboard | 45 min |
| Polish & responsive | 1 hour |
| **Total** | **~8 hours** |

## 🏁 Success Checklist

Before launching:
- [ ] Can add/remove accounts
- [ ] Can mark brainrots as owned
- [ ] Can select mutations/traits
- [ ] Income calculates correctly
- [ ] Data persists on refresh
- [ ] Search works
- [ ] Filter by rarity works
- [ ] Mobile responsive
- [ ] No console errors

## 🚨 Common Issues

**Q: Images not loading?**
A: Check paths match: `public/thumbnails/` in React

**Q: Income calculator not working?**
A: Import from `src/utils/incomeCalculator.js`

**Q: Data not saving?**
A: Check LocalStorage size limit (5-10MB usually OK)

**Q: Some brainrots show "Unknown" cost/income?**
A: Normal - 145 entries don't have data yet (can add manually)

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just:
1. Create the React app
2. Copy the files
3. Start building components
4. Deploy when done!

**Good luck building!** 🚀
