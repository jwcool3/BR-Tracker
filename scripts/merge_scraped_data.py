#!/usr/bin/env python3
"""
Merge Scraped Wiki Data
Merges the accurate wiki scraped data with existing brainrots (to preserve thumbnails)
Prioritizes scraped data over old data
"""

import json
import os

def merge_data():
    print("="*70)
    print("MERGING SCRAPED DATA")
    print("="*70 + "\n")
    
    # Load scraped data
    if not os.path.exists('data/brainrots_wiki_scraped.json'):
        print("[ERROR] data/brainrots_wiki_scraped.json not found!")
        print("Please run the scraper first.")
        return
    
    with open('data/brainrots_wiki_scraped.json', 'r', encoding='utf-8') as f:
        scraped_file = json.load(f)
        scraped_brainrots = scraped_file.get('brainrots', [])
    
    print(f"Loaded {len(scraped_brainrots)} scraped brainrots\n")
    
    # Load existing data (for thumbnails)
    existing_brainrots = []
    if os.path.exists('data/brainrots.json'):
        with open('data/brainrots.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            existing_brainrots = existing_data.get('brainrots', []) if isinstance(existing_data, dict) else existing_data
        
        print(f"Loaded {len(existing_brainrots)} existing brainrots\n")
    
    # Create lookup by name for existing data (to get thumbnails)
    existing_lookup = {}
    for br in existing_brainrots:
        name = br.get('name', '')
        if name:
            existing_lookup[name] = br
    
    # Merge: prioritize scraped data, but keep thumbnails from existing
    merged_brainrots = []
    
    for scraped in scraped_brainrots:
        name = scraped['name']
        
        # Start with scraped data (it's more accurate)
        merged_br = {
            'id': scraped['id'],
            'name': scraped['name'],
            'cost': scraped['cost'],
            'income_per_second': scraped['income_per_second'],
            'rarity': scraped['rarity']
        }
        
        # Add thumbnail from existing data if available
        if name in existing_lookup:
            existing = existing_lookup[name]
            if existing.get('image'):
                merged_br['image'] = existing['image']
        
        # If scraped data already has image, keep it
        if scraped.get('image'):
            merged_br['image'] = scraped['image']
        
        merged_brainrots.append(merged_br)
    
    # Sort by name
    merged_brainrots.sort(key=lambda x: x['name'])
    
    print(f"\n[SUCCESS] Merged {len(merged_brainrots)} brainrots\n")
    
    # Show statistics
    with_images = sum(1 for br in merged_brainrots if br.get('image'))
    with_cost = sum(1 for br in merged_brainrots if br.get('cost'))
    with_income = sum(1 for br in merged_brainrots if br.get('income_per_second'))
    
    print("="*70)
    print("STATISTICS")
    print("="*70)
    print(f"Total brainrots: {len(merged_brainrots)}")
    print(f"With cost data: {with_cost}/{len(merged_brainrots)} ({with_cost/len(merged_brainrots)*100:.1f}%)")
    print(f"With income data: {with_income}/{len(merged_brainrots)} ({with_income/len(merged_brainrots)*100:.1f}%)")
    print(f"With images: {with_images}/{len(merged_brainrots)} ({with_images/len(merged_brainrots)*100:.1f}%)")
    
    # Count rarities
    rarity_counts = {}
    for br in merged_brainrots:
        rarity = br.get('rarity', 'unknown')
        rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
    
    print("\nRarity distribution:")
    for rarity, count in sorted(rarity_counts.items(), key=lambda x: x[0] or 'unknown'):
        print(f"  {rarity or 'unknown'}: {count}")
    
    # Save merged data
    output = {
        'metadata': {
            'total_count': len(merged_brainrots),
            'source': 'Fandom Wiki (scraped) + Local thumbnails',
            'complete_data': with_cost,
            'with_images': with_images
        },
        'brainrots': merged_brainrots
    }
    
    # Save to multiple locations
    os.makedirs('data', exist_ok=True)
    
    # 1. Save as final merged file
    final_file = 'data/brainrots_final_merged.json'
    with open(final_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Saved to {final_file}")
    
    # 2. Backup old data
    if os.path.exists('data/brainrots.json'):
        backup_file = 'data/brainrots_old_backup.json'
        with open('data/brainrots.json', 'r', encoding='utf-8') as f:
            old_data = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(old_data)
        print(f"[OK] Backed up old data to {backup_file}")
    
    # 3. Replace data/brainrots.json
    with open('data/brainrots.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"[OK] Replaced data/brainrots.json with accurate data")
    
    # 4. Copy to app/public
    os.makedirs('app/public', exist_ok=True)
    with open('app/public/brainrots.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"[OK] Copied to app/public/brainrots.json")
    
    # Show sample
    print("\n" + "="*70)
    print("SAMPLE DATA (first 5)")
    print("="*70)
    for br in merged_brainrots[:5]:
        print(f"\n{br['name']}:")
        print(f"  ID: {br['id']}")
        print(f"  Cost: ${br['cost']:,}" if br.get('cost') else "  Cost: None")
        print(f"  Income: ${br['income_per_second']:,}/s" if br.get('income_per_second') else "  Income: None")
        print(f"  Rarity: {br.get('rarity', 'unknown')}")
        print(f"  Image: {br.get('image', 'None')}")
    
    print("\n" + "="*70)
    print("COMPLETE!")
    print("="*70)
    print("\n[SUCCESS] Data merged and replaced successfully!")
    print("\n[FILES] Updated files:")
    print("  - data/brainrots_final_merged.json (merged data)")
    print("  - data/brainrots_old_backup.json (backup of old data)")
    print("  - data/brainrots.json (REPLACED with accurate data)")
    print("  - app/public/brainrots.json (UPDATED for React app)")
    
    print("\n[NEXT] Next steps:")
    print("  1. Test the React app to verify data loads correctly")
    print("  2. Spot-check a few brainrots in-game for accuracy")
    print("  3. If all looks good, you're done!")
    print("\n[INFO] Old data has been backed up to data/brainrots_old_backup.json")
    print("       If you need to revert, just copy it back.")

if __name__ == '__main__':
    merge_data()

