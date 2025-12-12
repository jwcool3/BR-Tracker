"""
Verify Brainrots Against Official Wiki
Cross-checks our database with the wiki's brainrot list to find invalid entries
"""

import requests
from bs4 import BeautifulSoup
import json
import time

def get_wiki_brainrot_list():
    """Scrape the main brainrots page to get list of all valid brainrots"""
    url = "https://stealabrainrot.fandom.com/wiki/Brainrots"
    
    print(f"Fetching brainrot list from wiki: {url}\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Save debug HTML
        with open('data/wiki_brainrots_list_debug.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("✅ Saved debug HTML to data/wiki_brainrots_list_debug.html\n")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all links to brainrot pages
        wiki_brainrots = set()
        
        # Look for links in the content
        content = soup.find('div', class_='mw-parser-output')
        if content:
            links = content.find_all('a')
            
            for link in links:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                
                # Check if it's a brainrot link (not category, special page, etc.)
                if href.startswith('/wiki/') and text and len(text) > 2:
                    # Skip special pages
                    if any(skip in href.lower() for skip in ['category:', 'special:', 'file:', 'template:', 'help:', 'talk:']):
                        continue
                    
                    # Skip obvious non-brainrot pages
                    if any(skip in href.lower() for skip in ['traits', 'mutations', 'fuse', 'gallery', 'event']):
                        continue
                    
                    # Extract brainrot name from link text
                    if text not in ['Edit', 'Main Page', 'Discuss', 'Help', 'Rules']:
                        wiki_brainrots.add(text)
        
        # Also look for gallery links (format: Name/Gallery)
        gallery_pattern = r'/wiki/([^/]+)/Gallery'
        import re
        for match in re.finditer(gallery_pattern, response.text):
            name = match.group(1).replace('_', ' ')
            if name:
                wiki_brainrots.add(name)
        
        print(f"📊 Found {len(wiki_brainrots)} brainrots on wiki")
        
        return wiki_brainrots
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return set()

def verify_against_wiki():
    print("=" * 80)
    print("🔍 VERIFYING BRAINROTS AGAINST OFFICIAL WIKI")
    print("=" * 80)
    print()
    
    # Get wiki brainrot list
    wiki_brainrots = get_wiki_brainrot_list()
    
    if not wiki_brainrots:
        print("❌ Failed to fetch wiki brainrot list. Check network connection.")
        return
    
    # Normalize wiki names for comparison
    wiki_brainrots_lower = {name.lower().strip() for name in wiki_brainrots}
    
    # Load our database
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        our_brainrots = json.load(f)
    
    if not isinstance(our_brainrots, list):
        our_brainrots = our_brainrots.get('brainrots', [])
    
    print(f"📊 Our database: {len(our_brainrots)} brainrots")
    print(f"📊 Wiki list: {len(wiki_brainrots)} brainrots\n")
    
    # Check each of our brainrots
    not_on_wiki = []
    on_wiki = []
    
    for br in our_brainrots:
        name = br.get('name', '')
        name_lower = name.lower().strip()
        
        # Try exact match
        if name_lower in wiki_brainrots_lower:
            on_wiki.append(br)
        else:
            # Try partial matches (for Lucky Block variants, etc.)
            found = False
            for wiki_name in wiki_brainrots_lower:
                # Check if wiki name contains our name or vice versa
                if name_lower in wiki_name or wiki_name in name_lower:
                    # Likely a match (e.g., "Los Primos" matches "Los Primos (Lucky Block)")
                    found = True
                    on_wiki.append(br)
                    break
            
            if not found:
                not_on_wiki.append(br)
    
    # Print results
    print("=" * 80)
    print("📋 VERIFICATION RESULTS")
    print("=" * 80)
    
    print(f"\n✅ Verified on Wiki: {len(on_wiki)} ({len(on_wiki)/len(our_brainrots)*100:.1f}%)")
    print(f"⚠️  Not Found on Wiki: {len(not_on_wiki)} ({len(not_on_wiki)/len(our_brainrots)*100:.1f}%)")
    
    if not_on_wiki:
        print("\n" + "=" * 80)
        print("⚠️  BRAINROTS NOT FOUND ON WIKI")
        print("=" * 80)
        print("\nThese brainrots are in our database but couldn't be verified on the wiki:")
        print("They might be: incorrect names, removed from game, or wiki pages not found\n")
        
        # Group by rarity
        by_rarity = {}
        for br in not_on_wiki:
            rarity = br.get('rarity', 'unknown')
            if rarity not in by_rarity:
                by_rarity[rarity] = []
            by_rarity[rarity].append(br)
        
        for rarity in ['common', 'rare', 'epic', 'legendary', 'mythic', 'brainrot_god', 'og', 'secret', 'unknown']:
            if rarity in by_rarity:
                print(f"\n{rarity.upper()} ({len(by_rarity[rarity])}):")
                for br in by_rarity[rarity]:
                    print(f"  - {br.get('name')} (ID: {br.get('id')})")
                    print(f"    Income: ${br.get('income_per_second', 0):,.0f}/s")
                    print(f"    Source: {br.get('source', 'Unknown')}")
                    print()
    
    # Save detailed report
    report = {
        'total_brainrots': len(our_brainrots),
        'verified_on_wiki': len(on_wiki),
        'not_found_on_wiki': len(not_on_wiki),
        'wiki_list_size': len(wiki_brainrots),
        'not_found_list': [
            {
                'name': br.get('name'),
                'id': br.get('id'),
                'rarity': br.get('rarity'),
                'income_per_second': br.get('income_per_second'),
                'source': br.get('source', 'Unknown'),
                'has_image': bool(br.get('image'))
            }
            for br in not_on_wiki
        ]
    }
    
    with open('data/wiki_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"📄 Detailed report saved to: data/wiki_verification_report.json")
    print("=" * 80)
    
    if not_on_wiki:
        print("\n💡 NEXT STEPS:")
        print("-" * 80)
        print("1. Review the brainrots listed above")
        print("2. Search wiki manually to verify they exist")
        print("3. If they don't exist, consider removing them")
        print("4. If they exist with different names, add to wiki_name_corrections.json")
        print()
    else:
        print("\n✅ All brainrots verified on wiki! Database is clean.")
        print()
    
    return not_on_wiki

if __name__ == '__main__':
    verify_against_wiki()

