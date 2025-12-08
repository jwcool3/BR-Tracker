#!/usr/bin/env python3
"""
Update Brainrots Database
Merges scraped thumbnail data with existing brainrots.json
"""

import json
import os
import re


def clean_name(name):
    """Clean up brainrot names"""
    # Remove file extensions
    name = re.sub(r'\.(png|jpg|jpeg|webp|gif)$', '', name, flags=re.IGNORECASE)
    # Remove numbers at the end (like "EsokSekolah2")
    # But keep numbers that are part of the name
    name = name.strip()
    return name


def name_to_id(name):
    """Convert name to kebab-case ID"""
    # Remove special characters but keep spaces and hyphens
    cleaned = re.sub(r'[^\w\s-]', '', name)
    # Convert to lowercase and replace spaces with hyphens
    kebab = cleaned.lower().strip().replace(' ', '-')
    # Replace multiple hyphens with single hyphen
    kebab = re.sub(r'-+', '-', kebab)
    return kebab


def guess_rarity(name):
    """Attempt to guess rarity based on name patterns"""
    name_lower = name.lower()
    
    # Known patterns
    if 'los' in name_lower and name_lower.startswith('los'):
        return "legendary"
    if 'lucky' in name_lower or 'block' in name_lower:
        return "mythic"
    if 'admin' in name_lower:
        return "secret"
    if 'strawberry elephant' in name_lower or 'meowl' in name_lower:
        return "brainrot_god"
    
    # Default to unknown
    return "unknown"


def merge_brainrots(scraped_file, existing_file, output_file):
    """Merge scraped data with existing brainrots database"""
    
    # Load scraped data
    print("Loading scraped thumbnails...")
    with open(scraped_file, 'r', encoding='utf-8') as f:
        scraped_data = json.load(f)
    print(f"Found {len(scraped_data)} scraped brainrots")
    
    # Load existing data
    existing_brainrots = []
    if os.path.exists(existing_file):
        print(f"\nLoading existing brainrots from {existing_file}...")
        with open(existing_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            existing_brainrots = existing_data.get('brainrots', [])
        print(f"Found {len(existing_brainrots)} existing brainrots")
    
    # Create a map of existing brainrots by name (case-insensitive)
    existing_map = {}
    for br in existing_brainrots:
        key = br['name'].lower().strip()
        existing_map[key] = br
    
    # Process scraped data
    updated_brainrots = []
    new_count = 0
    updated_count = 0
    skipped_count = 0
    
    for item in scraped_data:
        name = clean_name(item['name'])
        
        # Skip if name is empty or too generic
        if not name or name.lower() in ['unknown', 'image', '']:
            skipped_count += 1
            continue
        
        # Check if this brainrot already exists
        name_key = name.lower().strip()
        
        if name_key in existing_map:
            # Update existing entry
            existing = existing_map[name_key]
            # Update image path if we have a local file
            if item.get('local_path'):
                existing['image'] = item['local_path']
            updated_brainrots.append(existing)
            updated_count += 1
            print(f"  ✓ Updated: {name}")
        else:
            # Create new entry
            br_id = name_to_id(name)
            rarity = guess_rarity(name)
            
            new_entry = {
                "id": br_id,
                "name": name,
                "rarity": rarity,
                "cost": None,  # Unknown - to be filled in
                "income_per_second": None,  # Unknown - to be filled in
                "image": item.get('local_path', f"thumbnails/{name.replace(' ', '_')}.png")
            }
            
            # Add source URL as a comment for reference
            if item.get('image_url'):
                new_entry['_source_url'] = item['image_url']
            
            updated_brainrots.append(new_entry)
            new_count += 1
            print(f"  + Added: {name} (rarity: {rarity})")
    
    # Sort by name
    updated_brainrots.sort(key=lambda x: x['name'].lower())
    
    # Create output structure
    output_data = {
        "brainrots": updated_brainrots,
        "_metadata": {
            "total_count": len(updated_brainrots),
            "new_entries": new_count,
            "updated_entries": updated_count,
            "skipped_entries": skipped_count,
            "notes": [
                "Entries with 'null' values for cost/income need manual entry",
                "Rarity marked as 'unknown' should be verified",
                "Remove '_source_url' field after verification"
            ]
        }
    }
    
    # Save to output file
    print(f"\nSaving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total brainrots: {len(updated_brainrots)}")
    print(f"  - New entries: {new_count}")
    print(f"  - Updated entries: {updated_count}")
    print(f"  - Skipped entries: {skipped_count}")
    print(f"\nOutput saved to: {output_file}")
    print("\n⚠️  NEXT STEPS:")
    print("1. Review the new entries (marked with null values)")
    print("2. Add cost and income_per_second values from the wiki/game")
    print("3. Verify rarity classifications")
    print("4. Remove _source_url fields when done")
    print("5. Replace brainrots.json with the updated version")


if __name__ == "__main__":
    scraped_file = "data/brainrot_thumbnails.json"
    existing_file = "brainrots.json"
    output_file = "brainrots_updated.json"
    
    print("="*50)
    print("BRAINROT DATABASE UPDATER")
    print("="*50)
    
    if not os.path.exists(scraped_file):
        print(f"❌ Error: {scraped_file} not found!")
        print("Run scrape_thumbnails.py first")
        exit(1)
    
    merge_brainrots(scraped_file, existing_file, output_file)
    print("\n✅ Done!")

