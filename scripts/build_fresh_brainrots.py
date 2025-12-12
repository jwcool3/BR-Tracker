"""
Build Fresh Brainrots JSON
Creates a clean brainrots.json from wiki scraped data with validation
No merging with old data - fresh start!
"""

import json
import os
import re

def normalize_name(name):
    """Normalize brainrot name for ID generation"""
    # Remove special characters, convert to lowercase
    normalized = re.sub(r'[^a-zA-Z0-9\s]', '', name.lower())
    # Replace spaces with hyphens
    normalized = re.sub(r'\s+', '-', normalized.strip())
    return normalized

def validate_brainrot(brainrot):
    """Validate brainrot data quality"""
    issues = []
    
    # Check required fields
    if not brainrot.get('name'):
        issues.append("Missing name")
    
    # Validate cost
    cost = brainrot.get('cost')
    if cost is not None:
        if not isinstance(cost, (int, float)) or cost < 0:
            issues.append(f"Invalid cost: {cost}")
    
    # Validate income
    income = brainrot.get('income_per_second')
    if income is not None:
        if not isinstance(income, (int, float)) or income < 0:
            issues.append(f"Invalid income: {income}")
    
    # Validate rarity
    valid_rarities = ['common', 'rare', 'epic', 'legendary', 'mythic', 'secret', 'og', 'brainrot_god', 'unknown']
    rarity = brainrot.get('rarity', 'unknown')
    if rarity not in valid_rarities:
        issues.append(f"Invalid rarity: {rarity}")
    
    # Check for reasonable data (cost/income relationship)
    if cost and income:
        if cost > 0 and income > 0:
            ratio = income / cost
            # Warn if ratio seems off (too high or too low)
            if ratio > 10 or ratio < 0.001:
                issues.append(f"Unusual cost/income ratio: {ratio:.4f}")
    
    return issues

def load_scraped_data():
    """Load wiki scraped data"""
    scraped_path = 'data/brainrots_wiki_scraped.json'
    
    if not os.path.exists(scraped_path):
        print(f"❌ Error: {scraped_path} not found!")
        print("Run scrape_wiki_cards.py first.")
        return None
    
    with open(scraped_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # Handle both formats: direct array or {brainrots: []}
        if isinstance(data, dict) and 'brainrots' in data:
            return data['brainrots']
        elif isinstance(data, list):
            return data
        else:
            print("❌ Error: Unexpected data format!")
            return None

def load_thumbnail_data():
    """Load thumbnail mappings (for image paths)"""
    thumb_path = 'data/brainrot_thumbnails.json'
    
    if not os.path.exists(thumb_path):
        return {}
    
    with open(thumb_path, 'r', encoding='utf-8') as f:
        thumbs = json.load(f)
        # Create lookup by normalized name
        lookup = {}
        for thumb in thumbs:
            normalized = normalize_name(thumb['name'])
            lookup[normalized] = thumb.get('local_path', thumb.get('image_url', ''))
        return lookup

def load_incomplete_data():
    """Load incomplete brainrots that have been manually fixed"""
    incomplete_path = 'data/brainrots_incomplete_MANUAL_FIX.json'
    
    if not os.path.exists(incomplete_path):
        return []
    
    with open(incomplete_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('brainrots', [])

def build_fresh_brainrots():
    """Build fresh brainrots.json from scraped data"""
    
    print("🔨 Building Fresh Brainrots JSON\n")
    print("=" * 60)
    
    # Load scraped data
    print("\n📥 Loading scraped data...")
    scraped_data = load_scraped_data()
    if not scraped_data:
        return
    
    print(f"✅ Loaded {len(scraped_data)} scraped brainrots")
    
    # Load thumbnails
    print("\n🖼️  Loading thumbnail mappings...")
    thumbnails = load_thumbnail_data()
    print(f"✅ Loaded {len(thumbnails)} thumbnail mappings")
    
    # Load incomplete/manually fixed data
    print("\n📝 Loading incomplete (manually fixed) data...")
    incomplete_data = load_incomplete_data()
    print(f"✅ Loaded {len(incomplete_data)} incomplete brainrots")
    
    # Merge incomplete into scraped (incomplete takes priority as it's manually fixed)
    all_data = scraped_data + incomplete_data
    print(f"\n📊 Total brainrots to process: {len(all_data)}")
    
    # Build fresh list
    print("\n🏗️  Building fresh brainrot list...")
    fresh_brainrots = []
    valid_count = 0
    warning_count = 0
    
    for scraped in all_data:
        name = scraped.get('name', '')
        
        # Generate ID
        brainrot_id = normalize_name(name)
        
        # Get thumbnail
        thumb_path = scraped.get('image')
        if not thumb_path:
            # Try to find in thumbnails lookup
            thumb_path = thumbnails.get(brainrot_id, '')
        
        # Clean rarity
        rarity = scraped.get('rarity', 'unknown')
        if rarity is None or not isinstance(rarity, str):
            rarity = 'unknown'
        # Clean up invalid rarities
        rarity = rarity.lower().strip()
        if rarity not in ['common', 'rare', 'epic', 'legendary', 'mythic', 'secret', 'og', 'brainrot_god']:
            # Try to extract valid rarity from messy strings
            if 'brainrot_god' in rarity or 'brainrot god' in rarity:
                rarity = 'brainrot_god'
            elif 'admin' in rarity:
                rarity = 'secret'  # Assume admin brainrots are secret tier
            else:
                rarity = 'unknown'
        
        # Build brainrot object
        brainrot = {
            'id': brainrot_id,
            'name': name,
            'cost': scraped.get('cost'),
            'income_per_second': scraped.get('income_per_second'),
            'rarity': rarity,
            'image': thumb_path
        }
        
        # Validate
        issues = validate_brainrot(brainrot)
        
        if issues:
            warning_count += 1
            print(f"\n⚠️  {name}:")
            for issue in issues:
                print(f"   - {issue}")
        else:
            valid_count += 1
        
        fresh_brainrots.append(brainrot)
    
    # Sort by name
    fresh_brainrots.sort(key=lambda x: x['name'])
    
    # Statistics
    print("\n" + "=" * 60)
    print("\n📊 Statistics:")
    print(f"   Total brainrots: {len(fresh_brainrots)}")
    print(f"   ✅ Valid: {valid_count}")
    print(f"   ⚠️  With warnings: {warning_count}")
    
    # Count by rarity
    rarity_counts = {}
    cost_income_complete = 0
    has_thumbnail = 0
    
    for br in fresh_brainrots:
        rarity = br['rarity']
        rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
        
        if br['cost'] is not None and br['income_per_second'] is not None:
            cost_income_complete += 1
        
        if br['image']:
            has_thumbnail += 1
    
    print(f"\n   Complete data (cost+income): {cost_income_complete}")
    print(f"   Has thumbnail: {has_thumbnail}")
    
    print("\n   Rarity breakdown:")
    for rarity, count in sorted(rarity_counts.items(), key=lambda x: str(x[0] or 'unknown')):
        print(f"      {rarity}: {count}")
    
    # Save to data/brainrots.json
    print("\n💾 Saving to data/brainrots.json...")
    output_path = 'data/brainrots.json'
    
    # Backup existing if it exists
    if os.path.exists(output_path):
        backup_path = 'data/brainrots_old_merged_backup.json'
        # Remove old backup if it exists
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(output_path, backup_path)
        print(f"   Backed up old file to: {backup_path}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(fresh_brainrots, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(fresh_brainrots)} brainrots")
    
    # Copy to app/public/
    print("\n📋 Copying to app/public/brainrots.json...")
    app_output_path = 'app/public/brainrots.json'
    
    # Backup app version
    if os.path.exists(app_output_path):
        app_backup_path = 'app/public/brainrots_old_backup.json'
        # Remove old backup if it exists
        if os.path.exists(app_backup_path):
            os.remove(app_backup_path)
        os.rename(app_output_path, app_backup_path)
        print(f"   Backed up app version to: {app_backup_path}")
    
    with open(app_output_path, 'w', encoding='utf-8') as f:
        json.dump(fresh_brainrots, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Copied to app/public/")
    
    # Summary
    print("\n" + "=" * 60)
    print("\n✨ Fresh brainrots.json built successfully!")
    print("\n📝 Next steps:")
    print("   1. Review warnings above")
    print("   2. Check data/brainrots_failed_MANUAL_FIX.json for failures")
    print("   3. Test app: cd app && npm run dev")
    print("   4. Verify brainrot count and data quality")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    build_fresh_brainrots()

