"""
Check Missing Thumbnails
Identifies which brainrots are missing images and creates a plan
"""

import json
import os

def check_missing_thumbnails():
    # Load brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    if not isinstance(brainrots, list):
        brainrots = brainrots.get('brainrots', [])
    
    print(f"=== Checking Thumbnails for {len(brainrots)} Brainrots ===\n")
    
    # Categorize brainrots
    has_image = []
    missing_image = []
    image_not_found = []
    
    for br in brainrots:
        name = br.get('name', 'Unknown')
        image = br.get('image')
        rarity = br.get('rarity', 'unknown')
        
        if image:
            # Check if file actually exists
            if os.path.exists(f"app/public/{image}"):
                has_image.append(br)
            else:
                image_not_found.append({
                    'name': name,
                    'rarity': rarity,
                    'image_path': image,
                    'brainrot': br
                })
        else:
            missing_image.append({
                'name': name,
                'rarity': rarity,
                'brainrot': br
            })
    
    # Print summary
    print("=" * 80)
    print("📊 THUMBNAIL STATUS")
    print("=" * 80)
    print(f"\n✅ Has Image: {len(has_image)} ({len(has_image)/len(brainrots)*100:.1f}%)")
    print(f"❌ Missing Image: {len(missing_image)} ({len(missing_image)/len(brainrots)*100:.1f}%)")
    print(f"⚠️  Image Path Set But File Not Found: {len(image_not_found)}")
    
    # Group missing by rarity
    if missing_image:
        print("\n" + "=" * 80)
        print("❌ MISSING THUMBNAILS BY RARITY")
        print("=" * 80)
        
        by_rarity = {}
        for item in missing_image:
            rarity = item['rarity']
            if rarity not in by_rarity:
                by_rarity[rarity] = []
            by_rarity[rarity].append(item['name'])
        
        for rarity in ['common', 'rare', 'epic', 'legendary', 'mythic', 'brainrot_god', 'og', 'secret', 'unknown']:
            if rarity in by_rarity:
                print(f"\n{rarity.upper()} ({len(by_rarity[rarity])}):")
                for name in sorted(by_rarity[rarity])[:10]:  # Show first 10
                    print(f"  - {name}")
                if len(by_rarity[rarity]) > 10:
                    print(f"  ... and {len(by_rarity[rarity]) - 10} more")
    
    # Group missing by source/event
    if missing_image:
        print("\n" + "=" * 80)
        print("❌ MISSING THUMBNAILS BY SOURCE")
        print("=" * 80)
        
        by_source = {}
        for item in missing_image:
            br = item['brainrot']
            source = br.get('source') or br.get('event') or 'Unknown'
            if source not in by_source:
                by_source[source] = []
            by_source[source].append(item['name'])
        
        for source, names in sorted(by_source.items(), key=lambda x: -len(x[1])):
            print(f"\n{source} ({len(names)}):")
            for name in sorted(names)[:5]:
                print(f"  - {name}")
            if len(names) > 5:
                print(f"  ... and {len(names) - 5} more")
    
    # Save detailed report
    report = {
        'total_brainrots': len(brainrots),
        'has_image': len(has_image),
        'missing_image': len(missing_image),
        'image_not_found': len(image_not_found),
        'missing_list': [
            {
                'name': item['name'],
                'rarity': item['rarity'],
                'id': item['brainrot'].get('id'),
                'source': item['brainrot'].get('source') or item['brainrot'].get('event')
            }
            for item in missing_image
        ],
        'not_found_list': [
            {
                'name': item['name'],
                'rarity': item['rarity'],
                'image_path': item['image_path']
            }
            for item in image_not_found
        ]
    }
    
    with open('data/missing_thumbnails_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"📄 Detailed report saved to: data/missing_thumbnails_report.json")
    print("=" * 80)
    
    return report

if __name__ == '__main__':
    check_missing_thumbnails()

