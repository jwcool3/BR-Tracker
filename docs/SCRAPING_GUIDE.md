# 🔍 Data Scraping Guide

## Overview
How to update brainrot data from the Fandom Wiki.

---

## Current Data

**Location:** `app/public/brainrots.json`

**Contains:**
- 439 brainrots total
- 318 complete (cost, income, rarity, image)
- 111 failed (need manual fixes)
- 10 incomplete (missing data)

---

## Scraping Process

### Step 1: Run Main Scraper

```bash
python scripts/scrape_wiki_cards.py
```

**What it does:**
- Fetches main brainrot page
- Extracts links to individual brainrot pages
- Scrapes each brainrot's infobox
- Downloads thumbnails
- Outputs 3 files:
  - `data/brainrots_wiki_scraped.json` (successful)
  - `data/brainrots_failed_MANUAL_FIX.json` (failures)
  - `data/brainrots_incomplete_MANUAL_FIX.json` (missing data)

### Step 2: Fix Failed Scrapes (Optional)

**Common Issues:**
- Misspelled names in wiki
- Non-existent pages
- Malformed HTML

**Solution:**
1. Open `data/wiki_name_corrections.json`
2. Add name mapping:
```json
{
  "Wrong Name": "Correct Wiki Name",
  "Lebron james": "Basketbolini Leonini"
}
```
3. Re-run scraper

### Step 3: Build Fresh brainrots.json (RECOMMENDED)

```bash
python scripts/build_fresh_brainrots.py
```

**What it does:**
- Loads `data/brainrots_wiki_scraped.json`
- Validates each brainrot:
  - Checks cost/income validity
  - Cleans up rarity values
  - Detects unusual ratios
- Builds completely fresh `brainrots.json` (no merging!)
- Backs up old files
- Copies to `app/public/brainrots.json`

**Validation Checks:**
- ✅ Required fields (name, cost, income)
- ✅ Valid rarity values
- ✅ Reasonable cost/income ratios
- ✅ Data type validation
- ✅ Thumbnail path verification

**Why This is Better:**
- No contamination from old incorrect data
- Fresh start with validated data
- Cleaner output
- Automatic rarity cleanup

---

## Manual Data Entry

For brainrots that fail to scrape:

1. Open `data/brainrots.json`
2. Find brainrot by name
3. Visit Fandom Wiki manually
4. Update fields:
   - `cost` - Number (e.g., 1000000)
   - `income_per_second` - Number
   - `rarity` - String ("common", "legendary", etc.)
   - `image` - Path to thumbnail

---

## Scraper Details

### scrape_wiki_cards.py

**Targets:**
- URL: `https://steal-a-brainrot.fandom.com/wiki/Brainrot`
- Extracts: Individual brainrot links
- Visits: Each brainrot's page
- Parses: Infobox table

**Data Extracted:**
- Name
- Cost (from "Cost" row)
- Income (from "Passive Income/second" row)
- Rarity (from "Rarity" row)
- Image URL (from infobox image)

**Error Handling:**
- 404 errors → logged to failed
- Missing data → logged to incomplete
- Timeouts → retry 3 times

### merge_scraped_data.py

**Steps:**
1. Load `data/brainrots_wiki_scraped.json`
2. Load `data/brainrots.json`
3. Create lookup by name (normalized)
4. Merge:
   - Use scraped data if available
   - Preserve existing `image` if not scraped
   - Generate unique `id` (kebab-case)
5. Sort by name
6. Backup old data
7. Save merged data
8. Copy to `app/public/`

---

## Wiki Structure

### Main Page
```
https://steal-a-brainrot.fandom.com/wiki/Brainrot
```

**Contains:**
- List of all brainrots
- Links to individual pages
- Thumbnails

### Individual Page Example
```
https://steal-a-brainrot.fandom.com/wiki/Strawberry_Elephant
```

**Contains:**
- Infobox (right side table)
  - Cost
  - Passive Income/second
  - Rarity
  - Image
- Description
- Other details

---

## Common Issues

### Issue: 404 Error

**Cause:** Page doesn't exist or name is wrong

**Fix:**
1. Search wiki manually
2. Find correct page name
3. Add to `data/wiki_name_corrections.json`

### Issue: Missing Income Data

**Cause:** Wiki page doesn't have "Passive Income/second" field

**Fix:**
1. Check if brainrot is outdated
2. Try alternative sources
3. Estimate based on similar brainrots
4. Mark as unknown

### Issue: Thumbnail Download Fails

**Cause:** Image URL expired or changed

**Fix:**
1. Visit brainrot page
2. Right-click image → Copy Image Address
3. Manually download
4. Save to `app/public/thumbnails/`

---

## Data Format

### Brainrot Object

```json
{
  "id": "strawberry-elephant",
  "name": "Strawberry Elephant",
  "cost": 250000000,
  "income_per_second": 250000000,
  "rarity": "mythic",
  "image": "thumbnails/Strawberry_Elephant.png"
}
```

### Field Types
- `id`: string (kebab-case, unique)
- `name`: string
- `cost`: number | null
- `income_per_second`: number | null
- `rarity`: string ("common", "rare", "epic", "legendary", "mythic", "secret", "og", "brainrot_god")
- `image`: string (relative path from app/public/)

---

## Update Schedule

**Recommended:** Monthly or when new brainrots are added to game

**Steps:**
1. Run scraper
2. Review failed/incomplete
3. Fix name corrections if needed
4. Re-run scraper
5. Merge data
6. Test app
7. Commit changes

---

## Testing After Update

1. Start dev server: `cd app && npm run dev`
2. Open `http://localhost:5173/`
3. Check console for errors
4. Verify brainrot count (top-right)
5. Search for new brainrots
6. Check thumbnails load
7. Verify cost/income displayed

---

## Backup Strategy

**Before major updates:**
```bash
# Backup current data
cp data/brainrots.json data/brainrots_backup_$(date +%Y%m%d).json

# Backup app data
cp app/public/brainrots.json app/public/brainrots_backup_$(date +%Y%m%d).json
```

**Restore if needed:**
```bash
cp data/brainrots_backup_YYYYMMDD.json data/brainrots.json
```

---

## Future Improvements

- [ ] Auto-retry failed scrapes
- [ ] Parallel scraping (faster)
- [ ] Image optimization
- [ ] Scrape mutations/modifiers data
- [ ] Scrape floor requirements
- [ ] API endpoint (if available)

---

## Need Help?

- Check `scraping_log.txt` for detailed logs
- Review `data/brainrots_failed_MANUAL_FIX.json` for specific errors
- Visit Fandom Wiki directly: https://steal-a-brainrot.fandom.com/

**Good Luck!** 🔍✨

