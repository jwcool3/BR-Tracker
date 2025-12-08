# Steal a Brainrot Tracker

A web app to track your Brainrot collection across multiple Roblox accounts in Steal a Brainrot.

## Features

### Core Features
- ✅ Track 439+ brainrots with images
- 📊 Calculate income/second with mutations & traits
- 🔄 Track rebirth levels & slot management (18 levels)
- 🏢 Floor assignment for theft protection (3 floors)
- 📈 Multi-account support with dashboard overview

### Three-View System ✨
- 🏠 **Dashboard View** - See all accounts at a glance
- 📋 **Account Detail** - Manage one account's brainrots
- 📊 **Total Collection** - See all brainrots across all accounts

### Advanced Features
- 🔍 Search and filter by rarity, ownership, floor
- 🎯 Duplicate detection across accounts
- 📉 Gap analysis (missing brainrots)
- 💰 Cross-account income analysis
- ⚡ Free space monitoring with color-coded alerts
- 💾 Local storage (no login required)

## Income Calculation System

The app includes a sophisticated income calculator that handles:

### Mutations (Only ONE per brainrot)
- **Gold**: 1.25x multiplier
- **Diamond**: 1.5x multiplier
- **Bloodmoon**: 2x multiplier
- **Celestial**: 4x multiplier
- **Candy**: 4x multiplier
- **Lava**: 6x multiplier
- **Galaxy**: 6x multiplier
- **Yin Yang**: 7.5x multiplier
- **Radioactive**: 8.5x multiplier
- **Rainbow**: 10x multiplier (best!)

### Traits (Multiple can STACK)
- **Sleepy**: -0.5x (only negative trait!)
- **Galactic**: 4x
- **Bombardiro**: 4x
- **Shark Fin**: 4x
- **Paint**: 6x
- **Nyan**: 6x
- **Fire**: 6x
- **Zombie**: 5x
- **Firework**: 6x
- **Strawberry**: 10x (best trait!)
- Many more...

### Formula
```
Final Income = Base Income × Mutation Multiplier × (1 + Sum of Trait Multipliers)
```

### Example Calculations

**Example 1: Basic Brainrot**
- Noobini Pizzanini: $1/s (no modifiers)
- Final: **$1/s**

**Example 2: Rainbow Mutation**
- Graipuss Medussi: $1,000,000/s
- Rainbow mutation: 10x
- Final: **$10,000,000/s**

**Example 3: God Tier Combo**
- Strawberry Elephant: $250,000,000/s
- Rainbow mutation: 10x
- Traits: Zombie (5x) + Firework (6x) + Strawberry (10x) = 21x
- Calculation: $250M × 10 × (1 + 21) = $250M × 10 × 22
- Final: **$55,000,000,000/s** ($55 BILLION per second!)

## Project Structure

```
steal-a-brainrot-tracker/
├── data/
│   ├── brainrots.json          # Brainrot database
│   ├── mutations_traits.json   # Mutations & traits data
│   └── brainrot_thumbnails.json # Scraped thumbnail metadata
├── thumbnails/                  # Downloaded brainrot images
├── src/
│   ├── incomeCalculator.js     # Income calculation utilities
│   └── (React app files)
├── scrape_thumbnails.py        # Thumbnail scraper script
└── README.md
```

## Setup

### Step 1: Install Python Dependencies

```bash
pip install requests beautifulsoup4 --break-system-packages
```

### Step 2: Run Thumbnail Scraper

```bash
python3 scrape_thumbnails.py
```

This will:
- Scrape brainrot images from the wiki
- Download thumbnails to `./thumbnails/`
- Save metadata to `data/brainrot_thumbnails.json`

### Step 3: Install Node Dependencies (for React app)

```bash
npm install
# or
yarn install
```

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

## Usage

### Adding Accounts
1. Click "Add Account" 
2. Enter account name
3. Start tracking your brainrots!

### Marking Brainrots
1. Browse or search for brainrots
2. Check the box for each account that has it
3. Optionally add mutation and traits for income calculation

### Viewing Stats
- See total brainrots collected per account
- View completion percentage
- Calculate total income/s with modifiers
- Compare accounts side-by-side

## Data Sources

- **Brainrot List**: [TechWiser Guide](https://techwiser.com/all-brainrots-and-secrets-in-steal-a-brainrot-roblox/)
- **Wiki**: [Steal a Brainrot Wiki](https://stealabrainrot.fandom.com/wiki/Brainrots)
- **Mutations**: [Mutations Guide](https://techwiser.com/all-mutations-in-steal-a-brainrot-roblox/)
- **Traits**: [Traits Guide](https://www.sportskeeda.com/roblox-news/steal-brainrot-all-traits-multipliers)

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage
- **Scraper**: Python + BeautifulSoup

## Future Features

- [ ] Import/export collection data
- [ ] Cloud sync between devices
- [ ] Trade value calculator
- [ ] Rarity completion badges
- [ ] Index completion tracker (0.5x multipliers)
- [ ] Mobile app version

## Contributing

Feel free to add more brainrots to `data/brainrots.json` as new ones are released!

## License

MIT

---

Made with ❤️ for Steal a Brainrot collectors
