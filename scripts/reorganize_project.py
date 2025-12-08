#!/usr/bin/env python3
"""
Reorganize project into clean structure
"""

import os
import shutil
import json

def create_structure():
    """Create proper folder structure"""
    folders = [
        'scripts',
        'docs',
        'public/thumbnails',
        'src'
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"✓ Created {folder}/")

def move_files():
    """Move files to proper locations"""
    moves = [
        # Scripts
        ('scrape_thumbnails.py', 'scripts/scrape_thumbnails.py'),
        ('fix_thumbnail_names.py', 'scripts/fix_thumbnail_names.py'),
        ('scrape_brainrot_data.py', 'scripts/scrape_brainrot_data.py'),
        ('update_brainrots_db.py', 'scripts/update_brainrots_db.py'),
        ('debug_techwiser.py', 'scripts/debug_techwiser.py'),
        
        # Documentation
        ('README (1).md', 'docs/README.md'),
        ('PROJECT_SUMMARY.md', 'docs/PROJECT_SUMMARY.md'),
        ('QUICKSTART.md', 'docs/QUICKSTART.md'),
        
        # Source files
        ('incomeCalculator.js', 'src/incomeCalculator.js'),
        
        # Data - keep final version, archive others
        ('brainrots_final.json', 'data/brainrots.json'),  # This is our main DB
        ('mutations_traits.json', 'data/mutations_traits.json'),
        ('thumbnail_corrections.json', 'data/thumbnail_corrections.json'),
    ]
    
    for src, dst in moves:
        if os.path.exists(src):
            # Create parent directory if needed
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            print(f"✓ Moved {src} → {dst}")

def archive_old_files():
    """Archive old/duplicate files"""
    os.makedirs('_archive', exist_ok=True)
    
    archive_files = [
        'brainrots.json',  # Old version
        'brainrots_updated.json',
        'brainrots_scraped.json',
        'techwiser_debug.html',
    ]
    
    for f in archive_files:
        if os.path.exists(f):
            shutil.move(f, f'_archive/{f}')
            print(f"📦 Archived {f}")

def copy_thumbnails():
    """Copy thumbnails to public folder"""
    if os.path.exists('thumbnails'):
        if os.path.exists('public/thumbnails'):
            shutil.rmtree('public/thumbnails')
        shutil.copytree('thumbnails', 'public/thumbnails')
        print(f"✓ Copied thumbnails to public/")

def create_readme():
    """Create main README in root"""
    readme = """# Steal a Brainrot Tracker

A web application to track your Brainrot collection across multiple Roblox accounts.

## 🎯 Features

- ✅ Track 439+ brainrots with images
- 📊 Calculate income/second with mutations & traits
- 🔍 Search and filter by rarity
- 📈 Multi-account support
- 💾 Local storage (no login required)

## 📁 Project Structure

```
BR Tracker/
├── data/                    # Database & metadata
│   ├── brainrots.json      # Main brainrot database (439 entries)
│   ├── mutations_traits.json
│   └── thumbnail_corrections.json
├── scripts/                 # Python scraping scripts
│   ├── scrape_thumbnails.py
│   └── fix_thumbnail_names.py
├── docs/                    # Documentation
│   ├── README.md
│   ├── PROJECT_SUMMARY.md
│   └── QUICKSTART.md
├── public/                  # Static assets
│   └── thumbnails/          # 317 brainrot images
├── src/                     # Source code
│   └── incomeCalculator.js  # Income calculation utilities
└── _archive/               # Old/temporary files
```

## 🚀 Quick Start

### 1. Data is Ready!

The database is complete with:
- **439 brainrots** total
- **294 with full data** (cost, income, rarity, image)
- **145 with images** (cost/income can be added later)

### 2. Income Calculator

The income calculator is fully functional:

```javascript
const income = calculateIncome(
  baseIncome: 250000000,
  mutation: 'rainbow',      // 10x multiplier
  traits: ['zombie', 'firework', 'strawberry']  // 5x + 6x + 10x
);
// Result: $55 billion/second!
```

### 3. Next: Build React App

```bash
# Create React app with Vite
npm create vite@latest brainrot-tracker-app -- --template react
cd brainrot-tracker-app

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Copy data files
# (See docs/PROJECT_SUMMARY.md for detailed instructions)
```

## 📊 Database Stats

```
Total: 439 brainrots
├─ Common: ✅
├─ Rare: ✅
├─ Epic: ✅
├─ Legendary: ✅
├─ Mythic: ✅
├─ Secret: ✅
├─ OG: ✅
└─ Brainrot God: ✅
```

## 🧮 Income Formula

```
Final Income = Base × Mutation × (1 + Sum of Traits)
```

**Example:** Rainbow + Zombie + Firework + Strawberry
- Base: $250M/s
- Rainbow: 10x
- Traits: 5 + 6 + 10 = 21x
- **Result:** $250M × 10 × 22 = **$55 BILLION/s**

## 📚 Documentation

- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Complete project overview
- **[Quick Start](docs/QUICKSTART.md)** - Get started in 5 minutes
- **[README](docs/README.md)** - Detailed documentation

## 🛠️ Technologies

- **Data**: Python + BeautifulSoup (web scraping)
- **Frontend**: React + Vite (planned)
- **Styling**: Tailwind CSS (planned)
- **Storage**: LocalStorage

## 🎮 Data Sources

- [TechWiser Guide](https://techwiser.com/all-brainrots-and-secrets-in-steal-a-brainrot-roblox/)
- [Fandom Wiki](https://stealabrainrot.fandom.com/wiki/Brainrots)
- [Mutations Guide](https://techwiser.com/all-mutations-in-steal-a-brainrot-roblox/)

## 📝 License

MIT

---

**Ready to track your brainrots!** 🎉
"""
    
    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(readme)
    print("✓ Created README.md")

def create_package_json():
    """Create package.json placeholder for future React app"""
    package = {
        "name": "brainrot-tracker",
        "version": "1.0.0",
        "description": "Track your Steal a Brainrot collection across multiple accounts",
        "scripts": {
            "scrape": "python scripts/scrape_thumbnails.py",
            "update": "python scripts/fix_thumbnail_names.py"
        },
        "keywords": ["roblox", "brainrot", "tracker"],
        "author": "",
        "license": "MIT"
    }
    
    with open('package.json', 'w', encoding='utf-8') as f:
        json.dump(package, f, indent=2)
    print("✓ Created package.json")

def create_gitignore():
    """Create .gitignore"""
    gitignore = """# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build
dist/
build/

# Debug
debug_*.html
*.pyc
__pycache__/

# Archives
_archive/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
"""
    
    with open('.gitignore', 'w', encoding='utf-8') as f:
        f.write(gitignore)
    print("✓ Created .gitignore")

def main():
    print("="*50)
    print("REORGANIZING PROJECT")
    print("="*50 + "\n")
    
    print("1. Creating folder structure...")
    create_structure()
    
    print("\n2. Moving files to proper locations...")
    move_files()
    
    print("\n3. Archiving old files...")
    archive_old_files()
    
    print("\n4. Copying thumbnails to public/...")
    copy_thumbnails()
    
    print("\n5. Creating project files...")
    create_readme()
    create_package_json()
    create_gitignore()
    
    print("\n" + "="*50)
    print("✅ REORGANIZATION COMPLETE!")
    print("="*50)
    print("\nProject structure is now clean and organized!")
    print("Check README.md for the updated documentation.")

if __name__ == "__main__":
    main()

