"""
Add Christmas Brainrots to Database
Checks which Christmas brainrots are missing and adds them
"""

import json
import re

def normalize_name(name):
    """Convert name to kebab-case ID"""
    # Remove special characters, convert to lowercase
    normalized = name.lower()
    # Replace spaces and special chars with hyphens
    normalized = re.sub(r'[^a-z0-9]+', '-', normalized)
    # Remove leading/trailing hyphens
    normalized = normalized.strip('-')
    return normalized

def add_christmas_brainrots():
    # Load Christmas brainrots
    with open('data/christmas_brainrots_manual.json', 'r', encoding='utf-8') as f:
        christmas_data = json.load(f)
    
    christmas_brainrots = christmas_data['brainrots']
    
    # Load current brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        current_data = json.load(f)
    
    current_brainrots = current_data if isinstance(current_data, list) else current_data.get('brainrots', [])
    
    # Create set of existing IDs
    existing_ids = {br.get('id') for br in current_brainrots}
    existing_names = {br.get('name').lower() for br in current_brainrots if br.get('name')}
    
    # Check what's new
    new_brainrots = []
    already_exists = []
    
    for christmas_br in christmas_brainrots:
        name = christmas_br['name']
        br_id = normalize_name(name)
        
        # Check if already exists
        if br_id in existing_ids or name.lower() in existing_names:
            already_exists.append(name)
        else:
            # Add new brainrot
            new_br = {
                'id': br_id,
                'name': name,
                'cost': None,  # Will be scraped later
                'income_per_second': christmas_br['income_per_second'],
                'rarity': christmas_br['rarity'],
                'image': None,  # Will be scraped later
                'event': christmas_br.get('event', 'Christmas 2024'),
                'source': christmas_br['source']
            }
            new_brainrots.append(new_br)
    
    print(f"\n=== Christmas Brainrots Analysis ===")
    print(f"Total Christmas brainrots: {len(christmas_brainrots)}")
    print(f"Already in database: {len(already_exists)}")
    print(f"New to add: {len(new_brainrots)}")
    
    if already_exists:
        print(f"\n✅ Already in database:")
        for name in already_exists:
            print(f"  - {name}")
    
    if new_brainrots:
        print(f"\n➕ Will add:")
        for br in new_brainrots:
            print(f"  - {br['name']} ({br['rarity']}) - ${br['income_per_second']:,.0f}/s")
        
        # Add to current brainrots
        updated_brainrots = current_brainrots + new_brainrots
        
        # Sort by rarity and name
        rarity_order = {
            'common': 0,
            'rare': 1,
            'epic': 2,
            'legendary': 3,
            'mythic': 4,
            'brainrot_god': 5,
            'og': 6,
            'secret': 7,
            'unknown': 8
        }
        
        updated_brainrots.sort(key=lambda x: (
            rarity_order.get(x.get('rarity', 'unknown'), 99),
            x.get('name', '')
        ))
        
        # Backup old file
        import shutil
        shutil.copy('data/brainrots.json', 'data/brainrots_before_christmas.json')
        print(f"\n💾 Backed up to: data/brainrots_before_christmas.json")
        
        # Save updated database
        with open('data/brainrots.json', 'w', encoding='utf-8') as f:
            json.dump(updated_brainrots, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved to: data/brainrots.json")
        print(f"📊 Total brainrots now: {len(updated_brainrots)}")
        
        # Also update app/public version
        shutil.copy('data/brainrots.json', 'app/public/brainrots.json')
        print(f"✅ Copied to: app/public/brainrots.json")
        
    else:
        print(f"\n✅ All Christmas brainrots already in database!")
    
    return new_brainrots

if __name__ == '__main__':
    add_christmas_brainrots()

