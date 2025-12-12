#!/usr/bin/env python3
"""
Add Christmas brainrots to main database
"""

import json
import re

def kebab_case(text):
    """Convert text to kebab-case"""
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def load_json(filename):
    """Load JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    """Save JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    print("=" * 80)
    print("🎄 ADDING CHRISTMAS BRAINROTS TO DATABASE")
    print("=" * 80)
    
    # Load existing database
    print("\n📖 Loading current database...")
    current_db = load_json('app/public/brainrots.json')
    print(f"   Current count: {len(current_db)}")
    
    # Load Christmas brainrots
    print("\n🎅 Loading Christmas brainrots...")
    christmas_br = load_json('data/christmas_brainrots.json')
    print(f"   Christmas count: {len(christmas_br)}")
    
    # Additional brainrots from Christmas page (manually added)
    additional_christmas = [
        {
            "name": "La Jolly Grande",
            "rarity": "secret",
            "cost_value": 30000000,  # $30M based on your screenshot
            "income_per_second": 30000000,  # $30M/s
            "source": "Christmas Event"
        },
        {
            "name": "Festive 67",
            "rarity": "common",
            "income_per_second": 67,
            "source": "Christmas Event"
        },
        {
            "name": "Festive Lucky Block",
            "rarity": "epic",
            "income_per_second": 1000,  # estimate
            "source": "Christmas Event"
        },
        {
            "name": "La Gingerbread Kepat",
            "rarity": "brainrot_god",
            "income_per_second": 250000,  # estimate
            "source": "Christmas Event"
        },
        {
            "name": "25",
            "rarity": "secret",
            "income_per_second": 500000,  # estimate
            "source": "Advent Calendar"
        },
        {
            "name": "La Ginger Sekolah",
            "rarity": "secret",
            "income_per_second": 300000,  # estimate
            "source": "Christmas Event"
        },
        {
            "name": "Giftini Spyderini",
            "rarity": "secret",
            "cost_value": 240000000,
            "income_per_second": 999900,
            "source": "Admin Abuse / Festive Lucky Block"
        },
        {
            "name": "Ballerina Peppermintina",
            "rarity": "secret",
            "cost_value": 37500000,
            "income_per_second": 215000,
            "source": "Advent Calendar"
        }
    ]
    
    print(f"\n➕ Adding {len(additional_christmas)} additional Christmas brainrots...")
    christmas_br.extend(additional_christmas)
    
    # Create a set of existing names
    existing_names = {br['name'].lower() for br in current_db}
    
    # Add Christmas brainrots to database
    added_count = 0
    skipped_count = 0
    
    for christmas in christmas_br:
        name = christmas['name']
        
        if name.lower() in existing_names:
            print(f"  ⏭️  Skipping {name} (already exists)")
            skipped_count += 1
            continue
        
        # Create database entry
        entry = {
            "id": kebab_case(name),
            "name": name,
            "cost": christmas.get('cost_value', 0),
            "income_per_second": christmas['income_per_second'],
            "rarity": christmas['rarity']
        }
        
        # Add image path if exists
        image_name = name.replace(' ', '_')
        entry["image"] = f"thumbnails/{image_name}.png"
        
        current_db.append(entry)
        print(f"  ✅ Added {name} ({christmas['rarity']}, ${christmas['income_per_second']:,}/s)")
        added_count += 1
    
    # Sort by income (handle None values)
    current_db.sort(key=lambda x: x.get('income_per_second', 0) or 0)
    
    # Save updated database
    print(f"\n💾 Saving updated database...")
    save_json(current_db, 'app/public/brainrots.json')
    
    print(f"\n✅ Done!")
    print(f"   Added: {added_count}")
    print(f"   Skipped: {skipped_count}")
    print(f"   New total: {len(current_db)}")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()

