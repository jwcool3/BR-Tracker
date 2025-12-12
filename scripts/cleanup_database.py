#!/usr/bin/env python3
"""
Clean up brainrots database:
1. Remove duplicates and inconsistencies
2. Add missing real brainrots
3. Fix naming issues
"""

import json
import re
from difflib import SequenceMatcher

def load_json(filename):
    """Load JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    """Save JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def kebab_case(text):
    """Convert text to kebab-case"""
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_duplicates(brainrots):
    """Find duplicate and similar brainrots"""
    duplicates = []
    seen_names = {}
    
    for br in brainrots:
        name = br['name']
        name_lower = name.lower().replace(' ', '').replace('-', '')
        
        if name_lower in seen_names:
            duplicates.append({
                'type': 'exact_duplicate',
                'original': seen_names[name_lower],
                'duplicate': br
            })
        else:
            seen_names[name_lower] = br
            
            # Check for similar names (might be typos)
            for existing_name, existing_br in seen_names.items():
                if existing_name != name_lower:
                    sim = similarity(name, existing_br['name'])
                    if sim > 0.90 and sim < 1.0:  # Very similar but not exact
                        duplicates.append({
                            'type': 'similar',
                            'similarity': sim,
                            'original': existing_br,
                            'duplicate': br
                        })
    
    return duplicates

def remove_invalid_entries(brainrots):
    """Remove entries that are clearly not brainrots"""
    invalid_patterns = [
        r'^\d+$',  # Just numbers (except specific ones like "67", "25")
        r'\(Lucky Block\)$',  # Names ending with (Lucky Block)
        r'^Los Lucky Blocks?$',
        r'^Las Lucky Blocks?$',
        r'Lucky Block$',
        r'Admin$',
        r'^Common$',
        r'^Rare$',
        r'^Epic$',
        r'^Legendary$',
        r'^Mythic$',
        r'^Secret$',
        r'^OG$',
    ]
    
    # Known valid numbers
    valid_numbers = {'25', '67'}
    
    cleaned = []
    removed = []
    
    for br in brainrots:
        name = br['name']
        
        # Check if it's a valid number brainrot
        if re.match(r'^\d+$', name) and name not in valid_numbers:
            removed.append({'name': name, 'reason': 'Invalid number'})
            continue
        
        # Check if ends with (Lucky Block) - remove suffix
        if '(Lucky Block)' in name:
            original_name = name
            name = name.replace('(Lucky Block)', '').strip()
            br['name'] = name
            br['id'] = kebab_case(name)
            print(f"  ✏️  Fixed: '{original_name}' → '{name}'")
        
        # Check other invalid patterns
        is_invalid = False
        for pattern in invalid_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                removed.append({'name': name, 'reason': f'Matches pattern: {pattern}'})
                is_invalid = True
                break
        
        if not is_invalid:
            cleaned.append(br)
    
    return cleaned, removed

def fix_typos(brainrots):
    """Fix known typos and naming inconsistencies"""
    fixes = {
        'Bombardini Tortinii': 'Bombardini Tortini',
        'Agarrini Ia Palini': 'Agarrini La Palini',
        'Brutto Gialutto': 'Bruto Gialutto',
        'Carlooooo': 'Carloo',
        'Carloooo (Lucky Block)': 'Carloo',
        'DUG DUG DUG BRAINROT': 'Dug Dug Dug',
        'Chilin': 'Chillin Chili',
        'EsokSekolah2': 'Esok Sekolah',
        'Developini': 'Developini Braziliaspidini',
        'Cookie': 'Cooki and Milki',
        'Cocosini': 'Cocosini Mama',
        'Chick fil a': 'Chick Fil A',
        'Alvin and the chipmunks': 'Alvin And The Chipmunks',
    }
    
    fixed_count = 0
    for br in brainrots:
        if br['name'] in fixes:
            old_name = br['name']
            new_name = fixes[old_name]
            br['name'] = new_name
            br['id'] = kebab_case(new_name)
            print(f"  ✏️  Fixed typo: '{old_name}' → '{new_name}'")
            fixed_count += 1
    
    return brainrots, fixed_count

def add_missing_brainrots():
    """Add missing real brainrots that were found on wiki"""
    missing = [
        # Real brainrots that are definitely missing
        {
            "name": "Ballerina Cappuccina",
            "rarity": "legendary",
            "cost": 100000,
            "income_per_second": 500,
            "image": "thumbnails/Ballerina_Cappuccina.png"
        },
        {
            "name": "Chimpanzini Bananini",
            "rarity": "legendary",
            "cost": 50000,
            "income_per_second": 300,
            "image": "thumbnails/Chimpanzini_Bananini.png"
        },
        {
            "name": "Bulbito Bandito Traktorito",
            "rarity": "brainrot_god",
            "cost": 15000000,
            "income_per_second": 100000,
            "image": "thumbnails/Bulbito_Bandito_Traktorito.png"
        },
        {
            "name": "Bombardiro Crocodilo",
            "rarity": "mythic",
            "cost": 2000000,
            "income_per_second": 9000,
            "image": "thumbnails/Bombardiro_Crocodilo.png"
        },
        {
            "name": "Coffin Tung Tung Tung Sahur",
            "rarity": "secret",
            "cost": 50000000,
            "income_per_second": 200000,
            "image": "thumbnails/Coffin_Tung_Tung_Tung_Sahur.png"
        },
        {
            "name": "Guest 666",
            "rarity": "og",
            "cost": 500000000,
            "income_per_second": 1500000,
            "image": "thumbnails/Guest_666.png"
        },
        {
            "name": "1x1x1x1",
            "rarity": "og",
            "cost": 500000000,
            "income_per_second": 1500000,
            "image": "thumbnails/1x1x1x1.png"
        },
        {
            "name": "Headless Horseman",
            "rarity": "secret",
            "cost": 100000000,
            "income_per_second": 500000,
            "image": "thumbnails/Headless_Horseman.png"
        },
        {
            "name": "Spooky and Pumpky",
            "rarity": "secret",
            "cost": 75000000,
            "income_per_second": 350000,
            "image": "thumbnails/Spooky_and_Pumpky.png"
        },
        {
            "name": "Reindeer Tralala",
            "rarity": "secret",
            "cost": 50000000,
            "income_per_second": 250000,
            "image": "thumbnails/Reindeer_Tralala.png"
        }
    ]
    
    # Add IDs
    for br in missing:
        br['id'] = kebab_case(br['name'])
    
    return missing

def main():
    print("=" * 80)
    print("🧹 DATABASE CLEANUP")
    print("=" * 80)
    
    # Load current database
    print("\n📖 Loading current database...")
    brainrots = load_json('app/public/brainrots.json')
    original_count = len(brainrots)
    print(f"   Original count: {original_count}")
    
    # Backup
    print("\n💾 Creating backup...")
    save_json(brainrots, 'data/brainrots_backup.json')
    print("   ✅ Backup saved to data/brainrots_backup.json")
    
    # Step 1: Remove invalid entries
    print("\n🗑️  Step 1: Removing invalid entries...")
    brainrots, removed = remove_invalid_entries(brainrots)
    print(f"   Removed {len(removed)} invalid entries")
    if removed:
        print("   Examples:")
        for item in removed[:5]:
            print(f"     • {item['name']} ({item['reason']})")
    
    # Step 2: Fix typos
    print("\n✏️  Step 2: Fixing typos and inconsistencies...")
    brainrots, fixed_count = fix_typos(brainrots)
    print(f"   Fixed {fixed_count} typos")
    
    # Step 3: Find and remove duplicates
    print("\n🔍 Step 3: Finding duplicates...")
    duplicates = find_duplicates(brainrots)
    
    if duplicates:
        print(f"   Found {len(duplicates)} potential duplicates")
        
        # Remove exact duplicates
        seen_ids = set()
        unique_brainrots = []
        dup_removed = 0
        
        for br in brainrots:
            br_id = br['id']
            if br_id not in seen_ids:
                seen_ids.add(br_id)
                unique_brainrots.append(br)
            else:
                print(f"   🗑️  Removing duplicate: {br['name']}")
                dup_removed += 1
        
        brainrots = unique_brainrots
        print(f"   Removed {dup_removed} exact duplicates")
    else:
        print("   ✅ No duplicates found!")
    
    # Step 4: Add missing brainrots
    print("\n➕ Step 4: Adding missing brainrots...")
    missing = add_missing_brainrots()
    
    existing_names = {br['name'].lower() for br in brainrots}
    added_count = 0
    
    for new_br in missing:
        if new_br['name'].lower() not in existing_names:
            brainrots.append(new_br)
            print(f"   ✅ Added: {new_br['name']}")
            added_count += 1
        else:
            print(f"   ⏭️  Skipped {new_br['name']} (already exists)")
    
    print(f"   Added {added_count} new brainrots")
    
    # Step 5: Sort by income
    print("\n📊 Step 5: Sorting by income...")
    brainrots.sort(key=lambda x: x.get('income_per_second', 0) or 0)
    
    # Step 6: Validate all entries
    print("\n✅ Step 6: Validating entries...")
    for br in brainrots:
        # Ensure all required fields
        if 'id' not in br or not br['id']:
            br['id'] = kebab_case(br['name'])
        if 'income_per_second' not in br:
            br['income_per_second'] = 0
        if 'cost' not in br:
            br['cost'] = 0
        if 'image' not in br:
            br['image'] = f"thumbnails/{br['name'].replace(' ', '_')}.png"
    
    # Save cleaned database
    print("\n💾 Saving cleaned database...")
    save_json(brainrots, 'app/public/brainrots.json')
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CLEANUP SUMMARY")
    print("=" * 80)
    print(f"\n  Original count:     {original_count}")
    print(f"  Invalid removed:    -{len(removed)}")
    print(f"  Duplicates removed: -{dup_removed if duplicates else 0}")
    print(f"  New brainrots added: +{added_count}")
    print(f"  Typos fixed:        {fixed_count}")
    print(f"  Final count:        {len(brainrots)}")
    print(f"\n  Net change:         {len(brainrots) - original_count:+d}")
    
    print("\n✅ Database cleaned successfully!")
    print("📁 Backup saved at: data/brainrots_backup.json")
    print("\n💡 Next step: Refresh your browser and test the floor scanner!")

if __name__ == '__main__':
    main()

