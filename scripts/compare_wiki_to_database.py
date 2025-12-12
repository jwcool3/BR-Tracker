#!/usr/bin/env python3
"""
Compare wiki brainrots list to our database and find missing ones
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def normalize_name(name):
    """Normalize brainrot name for comparison"""
    # Remove file extensions, special chars
    name = re.sub(r'\.(png|jpg|jpeg)$', '', name, flags=re.IGNORECASE)
    name = name.strip()
    return name

def scrape_main_brainrots_page():
    """Scrape the main Brainrots wiki page"""
    print("🔍 Scraping main Brainrots wiki page...")
    url = 'https://stealabrainrot.fandom.com/wiki/Brainrots'
    
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    brainrots_found = set()
    
    # Find all links that are brainrot pages
    # They typically are in the format /wiki/Brainrot_Name
    links = soup.find_all('a', href=re.compile(r'^/wiki/[^:]+$'))
    
    for link in links:
        title = link.get('title', '').strip()
        if title and not any(skip in title.lower() for skip in [
            'category', 'file:', 'template:', 'help:', 'special:',
            'user:', 'talk:', 'gallery', 'main page', 'traits',
            'lucky block', 'fuse', 'machine', 'event', 'trader'
        ]):
            normalized = normalize_name(title)
            if normalized and len(normalized) > 2:
                brainrots_found.add(normalized)
    
    # Also look for text mentions (some brainrots might be listed as text)
    content = soup.find('div', {'class': 'mw-parser-output'})
    if content:
        # Find all headings and paragraphs
        for element in content.find_all(['h2', 'h3', 'p', 'li', 'td']):
            text = element.get_text().strip()
            # Look for capitalized names (typical brainrot pattern)
            potential_names = re.findall(r'\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,4}\b', text)
            for name in potential_names:
                name = normalize_name(name)
                if len(name) > 3 and name not in ['NOOB', 'Lucky', 'Block', 'Blocks']:
                    brainrots_found.add(name)
    
    print(f"✅ Found {len(brainrots_found)} potential brainrots on wiki")
    return brainrots_found

def load_current_database():
    """Load our current brainrots database"""
    print("\n📖 Loading current database...")
    with open('app/public/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    db_names = {normalize_name(br['name']) for br in brainrots}
    print(f"✅ Current database has {len(db_names)} brainrots")
    return db_names, brainrots

def find_missing_brainrots(wiki_brainrots, db_brainrots):
    """Find brainrots on wiki but not in database"""
    print("\n🔍 Finding missing brainrots...")
    
    # Normalize both sets for comparison
    wiki_normalized = {name.lower().replace(' ', '').replace('-', '') for name in wiki_brainrots}
    db_normalized = {name.lower().replace(' ', '').replace('-', '') for name in db_brainrots}
    
    # Create mapping back to original names
    wiki_map = {name.lower().replace(' ', '').replace('-', ''): name for name in wiki_brainrots}
    db_map = {name.lower().replace(' ', '').replace('-', ''): name for name in db_brainrots}
    
    # Find missing
    missing_normalized = wiki_normalized - db_normalized
    missing = {wiki_map[norm] for norm in missing_normalized}
    
    # Find in database but not on wiki (might be duplicates or errors)
    extra_normalized = db_normalized - wiki_normalized
    extra = {db_map[norm] for norm in extra_normalized}
    
    print(f"\n📊 Results:")
    print(f"   Wiki brainrots: {len(wiki_brainrots)}")
    print(f"   Database brainrots: {len(db_brainrots)}")
    print(f"   Missing from database: {len(missing)}")
    print(f"   In database but not on wiki: {len(extra)}")
    
    return missing, extra

def categorize_missing(missing):
    """Try to categorize missing brainrots"""
    categories = {
        'Los/Las (plural)': [],
        'Event': [],
        'Lucky Block': [],
        'Number/Special': [],
        'Regular': []
    }
    
    for name in missing:
        name_lower = name.lower()
        if name.startswith('Los ') or name.startswith('Las '):
            categories['Los/Las (plural)'].append(name)
        elif any(word in name_lower for word in ['lucky', 'block', 'advent']):
            categories['Lucky Block'].append(name)
        elif any(word in name_lower for word in ['festive', 'spooky', 'extinct', 'taco']):
            categories['Event'].append(name)
        elif re.match(r'^\d+$', name) or name in ['W or L']:
            categories['Number/Special'].append(name)
        else:
            categories['Regular'].append(name)
    
    return categories

def save_results(missing, extra):
    """Save comparison results"""
    print("\n💾 Saving results...")
    
    results = {
        'summary': {
            'missing_count': len(missing),
            'extra_count': len(extra)
        },
        'missing_from_database': sorted(list(missing)),
        'in_database_not_on_wiki': sorted(list(extra))
    }
    
    with open('data/wiki_comparison.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("✅ Saved to data/wiki_comparison.json")

def main():
    print("=" * 80)
    print("🔍 COMPARING WIKI TO DATABASE")
    print("=" * 80)
    
    # Scrape wiki
    wiki_brainrots = scrape_main_brainrots_page()
    
    # Load database
    db_brainrots, full_db = load_current_database()
    
    # Find missing
    missing, extra = find_missing_brainrots(wiki_brainrots, db_brainrots)
    
    # Categorize missing
    categorized = categorize_missing(missing)
    
    # Save results
    save_results(missing, extra)
    
    # Print detailed report
    print("\n" + "=" * 80)
    print("📋 MISSING FROM DATABASE (by category)")
    print("=" * 80)
    
    for category, names in categorized.items():
        if names:
            print(f"\n{category} ({len(names)}):")
            for name in sorted(names)[:20]:  # Show first 20
                print(f"  • {name}")
            if len(names) > 20:
                print(f"  ... and {len(names) - 20} more")
    
    print("\n" + "=" * 80)
    print("📋 IN DATABASE BUT NOT ON WIKI (might be errors)")
    print("=" * 80)
    
    if extra:
        for name in sorted(list(extra))[:30]:
            print(f"  • {name}")
        if len(extra) > 30:
            print(f"  ... and {len(extra) - 30} more")
    
    print("\n" + "=" * 80)
    print("💡 RECOMMENDATIONS")
    print("=" * 80)
    print("\n1. Add Regular brainrots - these are likely real and missing")
    print("2. Los/Las plurals - check if these are actual separate brainrots")
    print("3. Review brainrots in database but not on wiki - might be typos/duplicates")
    print("\n✅ Done! Check data/wiki_comparison.json for full list")

if __name__ == '__main__':
    main()

