"""
Add Winter Hour Brainrot (Reindeer Tralala)
"""

import json
import shutil

def add_winter_hour():
    # Load Winter Hour brainrots
    with open('data/winter_hour_brainrots.json', 'r', encoding='utf-8') as f:
        winter_data = json.load(f)
    
    winter_brainrots = winter_data['brainrots']
    
    # Load current brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        current_brainrots = json.load(f)
    
    if not isinstance(current_brainrots, list):
        current_brainrots = current_brainrots.get('brainrots', [])
    
    print(f"=== Adding Winter Hour Brainrots ===\n")
    
    # Check if already exists
    existing_names = {br.get('name').lower() for br in current_brainrots if br.get('name')}
    
    new_count = 0
    for winter_br in winter_brainrots:
        name = winter_br['name']
        if name.lower() not in existing_names:
            # Generate ID
            br_id = name.lower().replace(' ', '-').replace("'", '')
            
            # Add new brainrot
            new_br = {
                'id': br_id,
                'name': name,
                'cost': None,
                'income_per_second': winter_br['income_per_second'],
                'rarity': winter_br['rarity'],
                'image': None,
                'event': winter_br.get('event', 'Christmas 2024'),
                'source': winter_br['source']
            }
            current_brainrots.append(new_br)
            new_count += 1
            print(f"✅ Added: {name}")
            print(f"   {winter_br['rarity']}, ${winter_br['income_per_second']:,}/s")
            print(f"   {winter_br.get('note', '')}")
        else:
            print(f"⚠️  Already exists: {name}")
    
    if new_count > 0:
        # Sort by rarity and name
        rarity_order = {
            'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3,
            'mythic': 4, 'brainrot_god': 5, 'og': 6, 'secret': 7, 'unknown': 8
        }
        
        current_brainrots.sort(key=lambda x: (
            rarity_order.get(x.get('rarity', 'unknown'), 99),
            x.get('name', '')
        ))
        
        # Backup
        shutil.copy('data/brainrots.json', 'data/brainrots_before_winter.json')
        print(f"\n💾 Backed up to: data/brainrots_before_winter.json")
        
        # Save
        with open('data/brainrots.json', 'w', encoding='utf-8') as f:
            json.dump(current_brainrots, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved to: data/brainrots.json")
        print(f"📊 Total brainrots now: {len(current_brainrots)}")
        
        # Update app/public
        shutil.copy('data/brainrots.json', 'app/public/brainrots.json')
        print(f"✅ Updated: app/public/brainrots.json\n")
    
    return new_count

if __name__ == '__main__':
    added = add_winter_hour()
    if added == 0:
        print("\n✅ All Winter Hour brainrots already in database!")

