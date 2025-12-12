# 🔧 Database Maintenance Guide

Tools for maintaining and updating the brainrots database.

---

## 📸 Update Existing Brainrots

**Script:** `scripts/update_existing_brainrots.py`

This comprehensive tool checks all brainrots in the database and:
- ✅ Identifies missing thumbnails
- ✅ Downloads thumbnails from the wiki
- ✅ Optionally updates brainrot data (income, cost, rarity)
- ✅ Saves progress periodically
- ✅ Provides detailed summary report

### Usage

#### 1. **Download Missing Thumbnails Only** (Recommended for first run)
```bash
python scripts/update_existing_brainrots.py
```

This will:
- Check all 344+ brainrots
- Find missing thumbnails
- Download from wiki
- Save database with new thumbnail paths

#### 2. **Compare Existing Thumbnails with Wiki** (NEW!)
```bash
python scripts/update_existing_brainrots.py --compare
# or
python scripts/update_existing_brainrots.py -c
```

This will:
- ✅ Check ALL thumbnails (even existing ones)
- ✅ Compare with wiki versions using image hashing
- ✅ Report file size differences
- ✅ Automatically update thumbnails that differ
- ✅ Show which thumbnails are outdated or wrong

#### 3. **Update Thumbnails AND Data**
```bash
python scripts/update_existing_brainrots.py --update-data
# or
python scripts/update_existing_brainrots.py -u
```

This will also:
- Update income values from wiki
- Update cost values from wiki
- Update rarity if changed
- Log all changes

#### 4. **Full Update** (Compare Thumbnails + Update Data)
```bash
python scripts/update_existing_brainrots.py --compare --update-data
# or
python scripts/update_existing_brainrots.py -c -u
```

The ultimate maintenance command - compares and updates everything!

### Example Output

#### Missing Thumbnails Mode:
```
🔄 Brainrot Database Updater 🔄

📊 Mode:
   ✅ Download missing thumbnails
==================================================

📦 Bostito Auratito
------------------------------------------------------------
  ❌ Thumbnail missing - scraping wiki...
  📥 Downloading thumbnail...
  ✅ Downloaded: Bostito_Auratito.png

📦 La Vacca Prese Presente
------------------------------------------------------------
  ✅ Thumbnail exists

==================================================

📊 SUMMARY
==================================================
Total brainrots:       344
Missing thumbnails:    2
Thumbnails downloaded: 2
Thumbnails compared:   0
Thumbnails different:  0
Thumbnails updated:    0
Download failures:     0
Data updated:          0
Wiki not found:        0
==================================================
```

#### Compare Mode (NEW!):
```
🔄 Brainrot Database Updater 🔄

📊 Mode:
   ✅ Compare existing thumbnails with wiki
==================================================

📦 La Vacca Prese Presente
------------------------------------------------------------
  ✅ Thumbnail exists - will compare with wiki
  🔍 Comparing with wiki version...
  ✅ Thumbnail matches wiki (identical)

📦 Cocofanto Elefanto
------------------------------------------------------------
  ✅ Thumbnail exists - will compare with wiki
  🔍 Comparing with wiki version...
  ⚠️  Thumbnail DIFFERENT from wiki!
      Local:  15,234 bytes
      Wiki:   18,456 bytes
      Diff:   21.2%
  ✅ Updated with wiki version

📦 Girafa Celestre
------------------------------------------------------------
  ✅ Thumbnail exists - will compare with wiki
  🔍 Comparing with wiki version...
  ⚠️  Thumbnail DIFFERENT from wiki!
      Local:  42,100 bytes
      Wiki:   41,754 bytes
      Diff:   0.8%
  ✅ Updated with wiki version

==================================================

📊 SUMMARY
==================================================
Total brainrots:       344
Missing thumbnails:    0
Thumbnails downloaded: 0
Thumbnails compared:   344
Thumbnails different:  2
Thumbnails updated:    2
Download failures:     0
Data updated:          0
Wiki not found:        0
==================================================
```

---

## 🔍 How Thumbnail Comparison Works

The `--compare` flag uses advanced image comparison:

1. **Downloads** wiki version temporarily
2. **Converts** both images to standard 64x64 RGB
3. **Generates** perceptual hash for each
4. **Compares** hashes to detect differences
5. **Reports** file size differences
6. **Updates** automatically if different

### Why Compare?
- ✅ Wiki updates brainrot images
- ✅ Verify thumbnails are correct
- ✅ Find corrupted/wrong images
- ✅ Ensure database consistency

### When to Compare?
- After major wiki updates
- When brainrot images look wrong
- Regular maintenance (monthly)
- After manual database edits

---

## 🎯 When to Use This Tool

### Scenario 1: After Adding New Brainrots Manually
If you manually added brainrots to the database but don't have thumbnails:
```bash
python scripts/update_existing_brainrots.py
```

### Scenario 2: Wiki Updated Brainrot Data
If the wiki updated income/cost values:
```bash
python scripts/update_existing_brainrots.py --update-data
```

### Scenario 3: After Game Updates
New game update changed brainrot stats:
```bash
python scripts/update_existing_brainrots.py --update-data
```

### Scenario 4: Fixing Broken Thumbnails
Some thumbnails are corrupted or wrong:
1. Delete the bad thumbnails from `app/public/thumbnails/`
2. Run: `python scripts/update_existing_brainrots.py`

---

## 📋 What Gets Updated

### Thumbnails
- ✅ Searches wiki for `<brainrot_name>` page
- ✅ Finds infobox image
- ✅ Downloads full resolution
- ✅ Saves as `<Brainrot_Name>.png`
- ✅ Updates database `image` field

### Data (with `--update-data` flag)
- 📊 **Income:** Updates `income_per_second` and `base_income`
- 💰 **Cost:** Updates `cost` field
- ⭐ **Rarity:** Updates `rarity` field
- 🔗 **Source:** All from official wiki

---

## 🚨 Important Notes

### 1. **Rate Limiting**
- Script waits 0.5 seconds between requests
- Be patient for large database updates
- Avoid running multiple times simultaneously

### 2. **Saves Progress**
- Saves every 10 updates
- Safe to Ctrl+C and resume later
- Won't re-download existing thumbnails

### 3. **Wiki Page Names**
Script converts brainrot names to wiki URLs:
- "La Vacca Prese Presente" → `wiki/La_Vacca_Prese_Presente`
- "Dul Dul Dul" → `wiki/Dul_Dul_Dul`

If a brainrot's wiki page has a different name, it won't be found automatically.

### 4. **Backup**
The script automatically backs up the database before making changes.
Manual backup recommended:
```bash
cp app/public/brainrots.json app/public/brainrots.backup.json
```

---

## 🛠️ Troubleshooting

### "Wiki page not found"
**Problem:** Brainrot name doesn't match wiki page name

**Solution:** 
1. Manually check wiki for correct name
2. Use `scripts/add_missing_christmas_brainrots.py` as template
3. Add custom URL mapping in `name_to_wiki_url()`

### "Download failed"
**Problem:** Image URL is invalid or server error

**Solution:**
1. Check wiki page manually
2. Look for image URL in page source
3. Update script or download manually

### "Income mismatch after update"
**Problem:** Wiki data might be outdated or incorrect

**Solution:**
1. Verify data on wiki
2. Check game for actual values
3. Manually edit `brainrots.json` if needed

---

## 📊 Database Structure

Each brainrot entry:
```json
{
  "id": "la-vacca-prese-presente",
  "name": "La Vacca Prese Presente",
  "cost": 160000000,
  "income_per_second": 600000,
  "base_income": 600000,
  "rarity": "secret",
  "image": "thumbnails/La_Vacca_Prese_Presente.png"
}
```

### Fields Updated by Tool
- ✅ `image` - Thumbnail path (always)
- ✅ `income_per_second` - Income value (with `--update-data`)
- ✅ `base_income` - Base income (with `--update-data`)
- ✅ `cost` - Purchase cost (with `--update-data`)
- ✅ `rarity` - Rarity tier (with `--update-data`)

### Fields NOT Updated
- ❌ `id` - Never changed (used as unique identifier)
- ❌ `name` - Never changed (source of truth)

---

## 🔄 Related Tools

### Add New Brainrots
```bash
python scripts/add_missing_christmas_brainrots.py
```
Template for adding completely new brainrots.

### Verify Database
```bash
python scripts/verify_brainrots.py
```
Check for duplicates, similar names, suspicious patterns.

### Compare with Wiki
```bash
python scripts/compare_wiki_to_database.py
```
Find brainrots on wiki that aren't in our database.

---

## 💡 Pro Tips

### 1. **Incremental Updates**
Run regularly to keep database fresh:
```bash
# Weekly
python scripts/update_existing_brainrots.py

# After major game updates
python scripts/update_existing_brainrots.py --update-data
```

### 2. **Verify After Updates**
```bash
python scripts/verify_brainrots.py
```
Check database integrity after bulk updates.

### 3. **Test Before Production**
```bash
# Backup first
cp app/public/brainrots.json brainrots.backup.json

# Test update
python scripts/update_existing_brainrots.py

# If something breaks
cp brainrots.backup.json app/public/brainrots.json
```

---

## 📝 Summary

**Quick Reference:**
```bash
# Just thumbnails
python scripts/update_existing_brainrots.py

# Thumbnails + data
python scripts/update_existing_brainrots.py --update-data

# Backup first (recommended)
cp app/public/brainrots.json brainrots.backup.json
python scripts/update_existing_brainrots.py
```

---

**Last Updated:** December 12, 2025  
**Maintainer:** AI Assistant  
**Status:** ✅ Production Ready

