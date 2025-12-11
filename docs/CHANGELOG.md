# Changelog

All notable changes and progress on the Steal a Brainrot Tracker project.

## [1.1.0] - 2024-12-08 - Rebirth System Added

### ✅ Rebirth & Slot Management System
- **18 rebirth levels** fully documented (0-17)
- **Complete requirements data** - cash and brainrot requirements for each level
- **Automatic slot calculation** - 10 to 33 slots based on rebirth level
- **Floor management system** - 3 floors with progressive unlocking
- **Free space tracking** - Visual indicators (LOW/MEDIUM/HIGH/CRITICAL/FULL)
- **Optimal floor placement calculator** - Recommends safest placement for valuable brainrots

### 📁 New Files Added
- `data/rebirths.json` - Complete rebirth data with rewards and requirements
- `scripts/rebirthCalculator.js` - Calculator functions for slots, space, and placement
- `docs/REBIRTH_FEATURE_GUIDE.md` - Complete integration guide for rebirth features

### 🎯 New Features
- Track rebirth level per account (0-17)
- Calculate total slots automatically
- Monitor free space with status alerts
- Assign brainrots to floors (1, 2, or 3)
- Optimize placement based on value and floor security
- View next rebirth requirements
- Lock time and multiplier tracking

### 📊 Rebirth Data
- 18 complete rebirth levels
- Cash requirements: $1M → $2.5Qa
- Brainrot requirements: From Gangster Footera to dual Secrets
- Slot progression: 10 → 33 slots
- Floor unlocks: Floor 2 at RB2, Floor 3 at RB10
- Multipliers: 1.0x → 17.0x

---

## [1.0.0] - 2024-12-08 - Project Complete & Organized

### ✅ Data Collection Complete
- **Scraped 439 brainrots** from TechWiser guide and Fandom wiki
- **Downloaded 317 thumbnail images** from wiki (full resolution)
- **294 brainrots with complete data** (cost, income/sec, rarity, image)
- **145 brainrots with partial data** (image only, cost/income pending)
- **All 8 rarity tiers mapped**: Common, Rare, Epic, Legendary, Mythic, Secret, OG, Brainrot God

### ✅ Income Calculator Implemented
- Complete mutations system (12 types) with multipliers
- Complete traits system (20+ types) with multipliers
- Accurate formula: `base × mutation × (1 + sum_of_traits)`
- Tested and verified against game data
- Handles edge cases (negative traits, no modifiers, stacking)

### ✅ Project Structure Organized
- Created clean folder structure:
  - `data/` - Database and metadata files
  - `scripts/` - Python scraping utilities
  - `docs/` - Complete documentation
  - `public/` - Static assets (thumbnails)
  - `src/` - Source code (calculator)
  - `_archive/` - Old/temporary files
- Added `README.md` with project overview
- Added `package.json` for npm scripts
- Added `.gitignore` for clean repository

### ✅ Documentation Updated
- **README.md** - Main project overview
- **docs/PROJECT_SUMMARY.md** - Complete project details with examples
- **docs/QUICKSTART.md** - Quick reference guide
- **docs/README.md** - Detailed documentation
- **CHANGELOG.md** - This file

### 🛠️ Tools & Scripts Created
- `scripts/scrape_thumbnails.py` - Wiki image scraper
- `scripts/fix_thumbnail_names.py` - Data merger with TechWiser scraping
- `scripts/scrape_brainrot_data.py` - Alternative wiki scraper
- `scripts/update_brainrots_db.py` - Database updater/merger
- `reorganize_project.py` - Project structure organizer

### 📊 Data Files
- `data/brainrots.json` - Main database (439 entries)
- `data/brainrot_thumbnails.json` - Scrape metadata
- `data/mutations_traits.json` - Mutations & traits reference
- `data/thumbnail_corrections.json` - Manual name correction tool

### 🎯 Ready for Development
- Database structure finalized
- All assets organized
- Calculator tested and working
- Component architecture planned
- Documentation complete

---

## [0.3.0] - Data Scraping & Merging

### Added
- TechWiser guide scraper with table parsing
- Income per second parsing (fixed `/s` suffix handling)
- Automatic thumbnail-to-brainrot matching with fuzzy search
- Thumbnail name correction system

### Fixed
- Income parser now handles `/s` suffix correctly
- Number parser improved for K/M/B suffixes
- Name cleaning removes "transparent", "NEW", etc.
- Rarity detection improved with pattern matching

### Changed
- Scraped from TechWiser instead of Fandom wiki (better structure)
- Merged scraped data with downloaded thumbnails
- Created review file for manual name corrections

---

## [0.2.0] - Thumbnail Scraping

### Added
- Wiki thumbnail scraper (`scrape_thumbnails.py`)
- Automatic image download from Fandom wiki
- Metadata extraction from image tags
- Full-resolution image URL extraction

### Fixed
- Updated scraper for modern Fandom wiki structure
- Changed from old selectors to `mw-file-element` class
- Parse `data-image-name` attribute for correct names
- Skip placeholder/data URI images

### Results
- Downloaded 317 thumbnail images
- All images saved at full resolution
- Metadata preserved in JSON format

---

## [0.1.0] - Initial Setup

### Added
- Income calculator with mutations & traits
- Basic database structure (24 starter brainrots)
- Mutations & traits reference data
- Initial documentation (README, PROJECT_SUMMARY)

### Implemented
- Income calculation formula
- Mutations system (12 types)
- Traits system (20+ types)
- Example calculations

---

## Next Steps

### Phase 1: React App Setup (Next)
- [ ] Create Vite + React project
- [ ] Install Tailwind CSS
- [ ] Copy data files to React project
- [ ] Set up routing (if needed)

### Phase 2: Core Components
- [ ] BrainrotCard component
- [ ] BrainrotList with grid layout
- [ ] AccountManager component
- [ ] StatsDashboard component
- [ ] FilterBar component

### Phase 3: Features
- [ ] Search functionality
- [ ] Rarity filtering
- [ ] Sort by name/income/cost
- [ ] Mutation/trait selectors
- [ ] Live income calculation
- [ ] LocalStorage persistence

### Phase 4: Polish
- [ ] Responsive design
- [ ] Dark mode
- [ ] Loading states
- [ ] Error handling
- [ ] Export/import JSON
- [ ] Deployment

---

## Known Issues

### Data Quality
- ⚠️ 145 brainrots (33%) need manual cost/income entry
- ⚠️ Some thumbnail filenames don't match actual brainrot names
  - Example: "Playboi carti" file shows "La Grand Combination"
  - Use `data/thumbnail_corrections.json` to fix these
- ⚠️ Some entries may have duplicate images with different names

### Scraping
- ✅ Fandom wiki doesn't use standard HTML tables (worked around with image scraping)
- ✅ TechWiser guide has incomplete data for some brainrots (145 entries)
- ℹ️ Some brainrots may be seasonal/event-only and not listed in guides

### To Fix Later
- [ ] Manual review of `thumbnail_corrections.json` needed
- [ ] Missing cost/income values for 145 brainrots
- [ ] Some rarity classifications may need verification
- [ ] Duplicate detection not implemented

---

## Contributors

- Data scraped from [TechWiser](https://techwiser.com) and [Fandom Wiki](https://stealabrainrot.fandom.com)
- Game: "Steal a Brainrot" on Roblox

---

**Status:** Ready for React app development 🚀

