"""
Cleanup Duplicate Brainrots
Intelligently removes duplicates and keeps the best version
"""

import json
import shutil

def cleanup_duplicates():
    # Load current brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    if not isinstance(brainrots, list):
        brainrots = brainrots.get('brainrots', [])
    
    print(f"=== Cleaning {len(brainrots)} Brainrots ===\n")
    
    # Manual corrections based on verification
    # Format: (incorrect_id, correct_id, reason)
    corrections = [
        # Frogo Elfo is the Christmas brainrot, Frogo Elgo already exists with full data
        ('frogo-elfo', 'frogo-elgo', 'Frogo Elfo is duplicate of Frogo Elgo (typo in Christmas event)'),
        
        # Guest666t is likely a typo of Guest 666
        ('guest666t', 'guest-666', 'Guest666t is typo of Guest 666'),
        
        # Tralaledon is shorter version of Tralalalaledon
        ('tralaledon', 'tralalalaledon', 'Tralaledon is short version'),
        
        # Trenostruzzo4000 vs Trenostruzzo Turbo 4000
        ('trenostruzzo4000', 'trenostruzzo-turbo-4000', 'Missing "Turbo" in name'),
    ]
    
    # IDs to remove (short/incorrect versions)
    to_remove = []
    
    # Check each correction
    for incorrect_id, correct_id, reason in corrections:
        incorrect_br = next((br for br in brainrots if br.get('id') == incorrect_id), None)
        correct_br = next((br for br in brainrots if br.get('id') == correct_id), None)
        
        if incorrect_br and correct_br:
            print(f"✅ Found pair: {incorrect_br.get('name')} → {correct_br.get('name')}")
            print(f"   Reason: {reason}")
            print(f"   Will remove: {incorrect_br.get('name')}")
            to_remove.append(incorrect_id)
        elif incorrect_br and not correct_br:
            print(f"⚠️  Incorrect exists but correct doesn't: {incorrect_id} → {correct_id}")
        elif not incorrect_br and correct_br:
            print(f"✅ Already fixed: {correct_id}")
        else:
            print(f"❓ Neither found: {incorrect_id} / {correct_id}")
    
    # Remove short versions that are subsets (keep longer, more complete names)
    subset_rules = [
        # (short_id, long_id, keep_long)
        ('raccooni', 'raccooni-jandelini', True),  # Keep long version
        ('wombo', 'wombo-rollo', True),
        ('cocosini', 'cocosini-mama', True),
        ('toiletto', 'toiletto-focaccino', True),
        ('pakrah', 'pakrahmatmamat', True),
    ]
    
    for short_id, long_id, keep_long in subset_rules:
        short_br = next((br for br in brainrots if br.get('id') == short_id), None)
        long_br = next((br for br in brainrots if br.get('id') == long_id), None)
        
        if short_br and long_br:
            # Check if they have same rarity and similar income (likely duplicates)
            short_rarity = short_br.get('rarity')
            long_rarity = long_br.get('rarity')
            short_income = short_br.get('income_per_second', 0)
            long_income = long_br.get('income_per_second', 0)
            
            # If same rarity and similar income, remove short version
            if short_rarity == long_rarity and abs(short_income - long_income) < 1000:
                print(f"\n🔍 Subset pair: {short_br.get('name')} vs {long_br.get('name')}")
                print(f"   Both {short_rarity}, income: ${short_income:,.0f} vs ${long_income:,.0f}")
                if keep_long:
                    print(f"   ✂️  Removing short version: {short_br.get('name')}")
                    to_remove.append(short_id)
    
    # Actually remove the duplicates
    if to_remove:
        print(f"\n{'='*80}")
        print(f"📝 CLEANUP SUMMARY")
        print(f"{'='*80}\n")
        print(f"Will remove {len(to_remove)} duplicate brainrots:\n")
        
        for remove_id in to_remove:
            br = next((br for br in brainrots if br.get('id') == remove_id), None)
            if br:
                print(f"  ❌ {br.get('name')} (ID: {remove_id})")
                print(f"     {br.get('rarity')}, ${br.get('income_per_second', 0):,.0f}/s")
        
        # Backup
        shutil.copy('data/brainrots.json', 'data/brainrots_before_cleanup.json')
        print(f"\n💾 Backed up to: data/brainrots_before_cleanup.json")
        
        # Remove
        cleaned = [br for br in brainrots if br.get('id') not in to_remove]
        
        # Save
        with open('data/brainrots.json', 'w', encoding='utf-8') as f:
            json.dump(cleaned, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Cleaned database saved: data/brainrots.json")
        print(f"📊 Before: {len(brainrots)} brainrots")
        print(f"📊 After: {len(cleaned)} brainrots")
        print(f"📊 Removed: {len(brainrots) - len(cleaned)} duplicates")
        
        # Update app/public
        shutil.copy('data/brainrots.json', 'app/public/brainrots.json')
        print(f"✅ Updated: app/public/brainrots.json")
        
        print(f"\n{'='*80}\n")
        
        return len(to_remove)
    else:
        print("\n✅ No duplicates to remove!")
        return 0

if __name__ == '__main__':
    cleanup_duplicates()

