"""
Add Missing Christmas Brainrots
Adds List List List Sahur and Please my Present to the database
"""

import json
import requests
from pathlib import Path

def add_missing_christmas_brainrots():
    """Add List List List Sahur and Please my Present to the database."""
    
    # Load existing database
    db_path = Path("app/public/brainrots.json")
    with open(db_path, 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    print(f"📊 Current database has {len(brainrots)} brainrots")
    
    # New brainrots to add
    new_brainrots = [
        {
            "id": "list-list-list-sahur",
            "name": "List List List Sahur",
            "cost": 550000000,  # $550M
            "income_per_second": 2000000,  # $2M/s
            "base_income": 2000000,
            "rarity": "secret",
            "image": "thumbnails/List_List_List_Sahur.png"
        },
        {
            "id": "please-my-present",
            "name": "Please my Present",
            "cost": 350000000,  # $350M
            "income_per_second": 1300000,  # $1.3M/s
            "base_income": 1300000,
            "rarity": "secret",
            "image": "thumbnails/Please_my_Present.png"
        }
    ]
    
    # Check if already exist
    existing_names = {br['name'] for br in brainrots}
    added_count = 0
    
    for new_br in new_brainrots:
        if new_br['name'] in existing_names:
            print(f"⏭️  {new_br['name']} already exists - skipping")
        else:
            brainrots.append(new_br)
            added_count += 1
            print(f"✅ Added: {new_br['name']}")
    
    if added_count == 0:
        print("ℹ️  No new brainrots to add")
        return
    
    # Sort by income_per_second
    brainrots.sort(key=lambda x: x.get('income_per_second') or 0)
    
    # Save updated database
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(brainrots, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Database updated! Now has {len(brainrots)} brainrots")
    print(f"📝 Added {added_count} new brainrots")

def download_thumbnails():
    """Download thumbnails for the new brainrots."""
    
    thumbnails = {
        "List List List Sahur": "https://static.wikia.nocookie.net/stealabr/images/e/e2/ListListListSahur.png/revision/latest?cb=20251206204003",
        "Please my Present": "https://static.wikia.nocookie.net/stealabr/images/5/52/Pleasemypresent.png/revision/latest?cb=20251206204153"
    }
    
    thumb_dir = Path("app/public/thumbnails")
    thumb_dir.mkdir(parents=True, exist_ok=True)
    
    for name, url in thumbnails.items():
        # Convert name to filename
        filename = name.replace(" ", "_") + ".png"
        filepath = thumb_dir / filename
        
        # Check if already exists
        if filepath.exists():
            print(f"⏭️  {filename} already exists - skipping")
            continue
        
        try:
            print(f"📥 Downloading {name}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded: {filename}")
        except Exception as e:
            print(f"❌ Failed to download {name}: {e}")

if __name__ == "__main__":
    print("🎄 Adding Missing Christmas Brainrots 🎄\n")
    print("=" * 50)
    
    # Add to database
    add_missing_christmas_brainrots()
    
    print("\n" + "=" * 50)
    print("\n📸 Downloading Thumbnails...\n")
    
    # Download thumbnails
    download_thumbnails()
    
    print("\n" + "=" * 50)
    print("✅ Complete! Christmas brainrots added!")
    print("\nAdded brainrots:")
    print("  1. List List List Sahur ($2M/s)")
    print("  2. Please my Present ($1.3M/s)")

