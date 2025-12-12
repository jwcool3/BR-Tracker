# 🖼️ Thumbnail Scraping Plan

## 📊 Current Status

**Total Brainrots:** 320  
**Has Thumbnails:** 217 (67.8%) ✅  
**Missing Thumbnails:** 103 (32.2%) ❌

---

## 🎯 Missing Breakdown

### By Rarity:
- **Secret:** 38 missing (highest priority!)
- **Brainrot God:** 32 missing
- **Mythic:** 13 missing
- **Epic:** 8 missing
- **Legendary:** 6 missing
- **Common:** 4 missing
- **Rare:** 2 missing

### By Source:
- **Unknown:** 93 missing (standard brainrots)
- **Santa's Fuse:** 9 missing (Christmas event)
- **Winter Hour:** 1 missing (Reindeer Tralala)

---

## 📋 Scraping Strategy

### Phase 1: Batch Scrape Missing Thumbnails ⭐ PRIORITY

**Goal:** Scrape all 103 missing thumbnails from wiki

**Script:** `scripts/scrape_missing_thumbnails.py`

**Process:**
1. Load `data/missing_thumbnails_report.json`
2. For each missing brainrot:
   - Generate wiki URL: `https://stealabrainrot.fandom.com/wiki/[Name]`
   - Fetch page
   - Find infobox image
   - Download thumbnail
   - Update brainrots.json

**Features:**
- Progress tracking (1 of 103, 2 of 103, etc.)
- Error handling (404s, timeouts)
- Auto-retry failed attempts
- Save successful/failed separately
- Rate limiting (1 request per 2 seconds to be nice)

**Estimated Time:** ~10-15 minutes for all 103

---

### Phase 2: Handle Failed Scrapes

**For 404s or missing pages:**
1. Check wiki name corrections
2. Try alternative spellings
3. Manual wiki search for correct name
4. Update `data/wiki_name_corrections.json`
5. Re-run scraper

**Expected:** 10-20 failures (typos, non-existent pages)

---

### Phase 3: Manual Additions (If Needed)

**For truly missing images:**
1. Search wiki manually
2. Download image directly
3. Add to `app/public/thumbnails/`
4. Update brainrots.json

**Expected:** 5-10 manual additions

---

## 🚀 Implementation Plan

### Script Features:

```python
# scripts/scrape_missing_thumbnails.py

Features:
- ✅ Batch processing (all 103 at once)
- ✅ Progress bar/counter
- ✅ Name corrections lookup
- ✅ Image download with retry
- ✅ Update brainrots.json automatically
- ✅ Save to app/public/thumbnails/
- ✅ Log successes and failures
- ✅ Rate limiting (2 sec delay)
- ✅ Skip already downloaded
- ✅ Backup before changes

Output Files:
- thumbnails_scraped_SUCCESS.json (successful)
- thumbnails_scraped_FAILED.json (need fixing)
- data/brainrots.json (updated)
- app/public/brainrots.json (updated)
```

---

## 🎯 Priority Order

### High Priority (70 brainrots):
1. **Secret (38)** - Most valuable/used
2. **Brainrot God (32)** - High-tier

### Medium Priority (19):
3. **Mythic (13)** - Mid-tier
4. **Legendary (6)** - Mid-tier

### Low Priority (14):
5. **Epic (8)** - Common
6. **Rare (2)** - Common
7. **Common (4)** - Least important

---

## 📁 File Structure

### Before Scraping:
```
app/public/thumbnails/
├── (217 existing images)
└── (103 missing)
```

### After Scraping:
```
app/public/thumbnails/
├── (217 existing)
├── (90+ newly scraped) ← NEW!
└── (5-10 still missing) ← Manual needed
```

---

## 🔧 Technical Details

### Wiki URL Format:
```
Base: https://stealabrainrot.fandom.com/wiki/
Name: Replace spaces with underscores
Example: "Reindeer Tralala" → "Reindeer_Tralala"

Full URL:
https://stealabrainrot.fandom.com/wiki/Reindeer_Tralala
```

### Image Extraction:
```python
# Find infobox image
infobox = soup.find('aside', class_='portable-infobox')
if infobox:
    img = infobox.find('img', class_='pi-image-thumbnail')
    if img:
        image_url = img.get('data-src') or img.get('src')
```

### Download & Save:
```python
# Download image
response = requests.get(image_url)

# Save to thumbnails folder
filename = f"{br_id}.png"
filepath = f"app/public/thumbnails/{filename}"

with open(filepath, 'wb') as f:
    f.write(response.content)

# Update brainrot entry
br['image'] = f"thumbnails/{filename}"
```

---

## ⚠️ Known Issues

### Common Problems:

1. **Name Mismatches**
   - Wiki page name different from brainrot name
   - Solution: Use `wiki_name_corrections.json`

2. **404 Errors**
   - Page doesn't exist
   - Solution: Search wiki manually, add correction

3. **Lazy-Loaded Images**
   - Image uses data-src instead of src
   - Solution: Check both attributes

4. **Rate Limiting**
   - Too many requests too fast
   - Solution: Add 2 second delay between requests

---

## 📊 Expected Results

### Best Case:
- ✅ 95+ thumbnails scraped automatically
- ⚠️ 5-10 need manual intervention
- ⏱️ Time: 15 minutes

### Realistic Case:
- ✅ 85-90 thumbnails scraped
- ⚠️ 15-20 need name corrections
- ⚠️ 5-10 need manual download
- ⏱️ Time: 30 minutes

### Worst Case:
- ✅ 70+ thumbnails scraped
- ⚠️ 20-30 need manual work
- ⏱️ Time: 1 hour

---

## 🎯 Success Metrics

**Target:** Get to 95%+ coverage (304+ of 320 brainrots)

**Current:** 67.8% (217 of 320)  
**Goal:** 95%+ (304+ of 320)  
**Need:** 87+ more thumbnails

**Achievable:** Very likely! Most brainrots have wiki pages.

---

## 🚀 Next Steps

### Step 1: Create Scraper (5 min)
- Build `scripts/scrape_missing_thumbnails.py`
- Based on existing `scrape_wiki_cards.py`
- Add progress tracking and retry logic

### Step 2: Run Scraper (15 min)
- Process all 103 missing
- Watch progress
- Note failures

### Step 3: Handle Failures (10-20 min)
- Review failed list
- Add name corrections
- Re-run for failures
- Manual download remaining

### Step 4: Verify (5 min)
- Re-run `check_missing_thumbnails.py`
- Confirm 95%+ coverage
- Update documentation

**Total Estimated Time:** 35-45 minutes

---

## 💡 Alternative: Prioritized Approach

If time is limited, scrape only high-value brainrots:

### Option A: Secrets Only (38 brainrots)
- Most valuable/used
- **Time:** ~10 minutes
- **Coverage:** +11.9% → 79.7%

### Option B: Secrets + Brainrot Gods (70 brainrots)
- All high-tier
- **Time:** ~20 minutes
- **Coverage:** +21.9% → 89.7%

### Option C: Mythic+ (83 brainrots)
- Skip Common/Rare/Epic
- **Time:** ~25 minutes
- **Coverage:** +25.9% → 93.7%

### Option D: All (103 brainrots)
- Complete coverage
- **Time:** ~35-45 minutes
- **Coverage:** +32.2% → 100%

---

## 🎮 User Experience Impact

### Current (67.8% coverage):
- ❌ 1 in 3 brainrots has no image
- ⚠️ Harder to identify brainrots
- ⚠️ Less visual appeal

### After (95%+ coverage):
- ✅ 19 in 20 brainrots have images
- ✅ Easy to identify
- ✅ Professional look
- ✅ Better user experience

---

## 📝 Files to Create

1. **`scripts/scrape_missing_thumbnails.py`** - Main scraper
2. **`scripts/download_thumbnail.py`** - Helper for single downloads
3. **`data/thumbnail_scrape_log.json`** - Progress tracking
4. **`THUMBNAIL_SCRAPING_RESULTS.md`** - Final report

---

## ✅ Ready to Start!

**Recommendation:** Option D (scrape all 103)

**Reason:**
- Completeness
- One-time effort
- Best user experience
- ~45 minutes is manageable

**Would you like me to:**
1. ✅ Build the scraper script
2. ✅ Run it for all 103 missing
3. ✅ Handle failures
4. ✅ Get to 95%+ coverage

**Say "yes" and I'll start building!** 🚀

