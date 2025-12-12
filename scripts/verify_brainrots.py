"""
Verify Brainrots Database
Finds duplicates, near-duplicates, and potential naming errors
"""

import json
from difflib import SequenceMatcher

def similar(a, b):
    """Check if two strings are similar"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def verify_brainrots():
    # Load current brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    if not isinstance(brainrots, list):
        brainrots = brainrots.get('brainrots', [])
    
    print(f"=== Verifying {len(brainrots)} Brainrots ===\n")
    
    # Track issues
    issues = {
        'duplicate_ids': [],
        'duplicate_names': [],
        'similar_names': [],
        'missing_data': [],
        'suspicious': []
    }
    
    # Check for duplicate IDs
    id_map = {}
    for br in brainrots:
        br_id = br.get('id')
        if br_id in id_map:
            issues['duplicate_ids'].append({
                'id': br_id,
                'entries': [id_map[br_id], br]
            })
        else:
            id_map[br_id] = br
    
    # Check for duplicate names (exact, case-insensitive)
    name_map = {}
    for br in brainrots:
        name = br.get('name', '').strip()
        name_lower = name.lower()
        if name_lower in name_map:
            issues['duplicate_names'].append({
                'name': name,
                'entries': [name_map[name_lower], br]
            })
        else:
            name_map[name_lower] = br
    
    # Check for similar names (potential duplicates)
    names = [(br.get('name', ''), br) for br in brainrots]
    for i, (name1, br1) in enumerate(names):
        for name2, br2 in names[i+1:]:
            if name1 and name2:
                similarity = similar(name1, name2)
                if similarity > 0.8 and similarity < 1.0:  # Very similar but not exact
                    issues['similar_names'].append({
                        'name1': name1,
                        'name2': name2,
                        'similarity': f"{similarity*100:.1f}%",
                        'br1': br1,
                        'br2': br2
                    })
    
    # Check for missing critical data
    for br in brainrots:
        missing = []
        if not br.get('name'):
            missing.append('name')
        if not br.get('id'):
            missing.append('id')
        if br.get('income_per_second') is None:
            missing.append('income_per_second')
        if not br.get('rarity'):
            missing.append('rarity')
        
        if missing:
            issues['missing_data'].append({
                'name': br.get('name', 'UNKNOWN'),
                'id': br.get('id', 'UNKNOWN'),
                'missing': missing,
                'br': br
            })
    
    # Check for suspicious patterns
    for br in brainrots:
        name = br.get('name', '')
        
        # Check if name is just part of another brainrot's name
        for other_br in brainrots:
            if br != other_br:
                other_name = other_br.get('name', '')
                if name and other_name and len(name) > 3:
                    # Check if this name is contained in another (but not vice versa)
                    if name in other_name and name != other_name:
                        issues['suspicious'].append({
                            'type': 'name_subset',
                            'short_name': name,
                            'long_name': other_name,
                            'short_br': br,
                            'long_br': other_br
                        })
    
    # Print report
    print("=" * 80)
    print("📋 VERIFICATION REPORT")
    print("=" * 80)
    
    total_issues = sum(len(v) for v in issues.values())
    
    if total_issues == 0:
        print("\n✅ No issues found! Database is clean.\n")
        return
    
    print(f"\n⚠️  Found {total_issues} potential issues\n")
    
    # Duplicate IDs
    if issues['duplicate_ids']:
        print(f"\n❌ DUPLICATE IDs ({len(issues['duplicate_ids'])}):")
        print("-" * 80)
        for dup in issues['duplicate_ids']:
            print(f"\n  ID: {dup['id']}")
            for entry in dup['entries']:
                print(f"    - {entry.get('name')} (rarity: {entry.get('rarity')}, income: ${entry.get('income_per_second', 0):,.0f}/s)")
    
    # Duplicate Names
    if issues['duplicate_names']:
        print(f"\n❌ DUPLICATE NAMES ({len(issues['duplicate_names'])}):")
        print("-" * 80)
        for dup in issues['duplicate_names']:
            print(f"\n  Name: \"{dup['name']}\"")
            for entry in dup['entries']:
                print(f"    - ID: {entry.get('id')}, Rarity: {entry.get('rarity')}, Income: ${entry.get('income_per_second', 0):,.0f}/s")
    
    # Similar Names (likely duplicates)
    if issues['similar_names']:
        print(f"\n⚠️  SIMILAR NAMES ({len(issues['similar_names'])} pairs):")
        print("-" * 80)
        for sim in issues['similar_names']:
            print(f"\n  {sim['similarity']} similar:")
            print(f"    1. \"{sim['name1']}\" (ID: {sim['br1'].get('id')}, {sim['br1'].get('rarity')}, ${sim['br1'].get('income_per_second', 0):,.0f}/s)")
            print(f"    2. \"{sim['name2']}\" (ID: {sim['br2'].get('id')}, {sim['br2'].get('rarity')}, ${sim['br2'].get('income_per_second', 0):,.0f}/s)")
    
    # Suspicious patterns
    if issues['suspicious']:
        print(f"\n🔍 SUSPICIOUS PATTERNS ({len(issues['suspicious'])}):")
        print("-" * 80)
        
        # Group by type
        name_subsets = [s for s in issues['suspicious'] if s['type'] == 'name_subset']
        
        if name_subsets:
            print(f"\n  Name is subset of another (possible duplicates):")
            for sus in name_subsets[:10]:  # Show first 10
                print(f"\n    Short: \"{sus['short_name']}\" (ID: {sus['short_br'].get('id')})")
                print(f"    Long:  \"{sus['long_name']}\" (ID: {sus['long_br'].get('id')})")
                print(f"           Short: {sus['short_br'].get('rarity')}, ${sus['short_br'].get('income_per_second', 0):,.0f}/s")
                print(f"           Long:  {sus['long_br'].get('rarity')}, ${sus['long_br'].get('income_per_second', 0):,.0f}/s")
            
            if len(name_subsets) > 10:
                print(f"\n    ... and {len(name_subsets) - 10} more")
    
    # Missing data
    if issues['missing_data']:
        print(f"\n⚠️  MISSING DATA ({len(issues['missing_data'])}):")
        print("-" * 80)
        for missing in issues['missing_data'][:10]:  # Show first 10
            print(f"\n  {missing['name']} (ID: {missing['id']})")
            print(f"    Missing: {', '.join(missing['missing'])}")
        
        if len(issues['missing_data']) > 10:
            print(f"\n  ... and {len(issues['missing_data']) - 10} more")
    
    # Save detailed report
    report_file = 'data/verification_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_brainrots': len(brainrots),
            'total_issues': total_issues,
            'issues': {
                'duplicate_ids': len(issues['duplicate_ids']),
                'duplicate_names': len(issues['duplicate_names']),
                'similar_names': len(issues['similar_names']),
                'missing_data': len(issues['missing_data']),
                'suspicious': len(issues['suspicious'])
            },
            'details': issues
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n\n📄 Detailed report saved to: {report_file}")
    print("=" * 80)
    
    # Create cleanup recommendations
    print(f"\n\n💡 RECOMMENDATIONS:")
    print("-" * 80)
    
    if issues['duplicate_names'] or issues['duplicate_ids']:
        print("\n1. Remove exact duplicates:")
        print("   - Review duplicate_ids and duplicate_names")
        print("   - Keep the entry with most complete data")
        print("   - Delete the others")
    
    if issues['similar_names']:
        print("\n2. Check similar names:")
        print("   - These might be typos or duplicate entries")
        print("   - Cross-reference with official wiki")
        print("   - Merge or correct as needed")
    
    if issues['suspicious']:
        print("\n3. Verify suspicious patterns:")
        print("   - Example: 'Beluga' vs 'Belula Beluga'")
        print("   - Check which is the correct full name")
        print("   - Remove incorrect short versions")
    
    print("\n")
    
    return issues

if __name__ == '__main__':
    verify_brainrots()

