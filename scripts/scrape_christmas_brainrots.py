#!/usr/bin/env python3
"""
Scrape Christmas Brainrots from Santa's Fuse and Christmas Brainrots wiki pages
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def parse_income(income_str):
    """Convert income string like '$3.2M/s' to number"""
    if not income_str:
        return 0
    
    # Remove $, /s, and spaces
    clean = income_str.replace('$', '').replace('/s', '').strip()
    
    # Handle K, M, B suffixes
    if 'B' in clean:
        return int(float(clean.replace('B', '')) * 1_000_000_000)
    elif 'M' in clean:
        return int(float(clean.replace('M', '')) * 1_000_000)
    elif 'K' in clean:
        return int(float(clean.replace('K', '')) * 1_000)
    else:
        return int(float(clean))

def parse_cost(cost_str):
    """Convert cost string like '$600K' to number"""
    if not cost_str:
        return 0
    
    # Remove $, spaces
    clean = cost_str.replace('$', '').strip()
    
    # Handle K, M, B suffixes
    if 'B' in clean:
        return int(float(clean.replace('B', '')) * 1_000_000_000)
    elif 'M' in clean:
        return int(float(clean.replace('M', '')) * 1_000_000)
    elif 'K' in clean:
        return int(float(clean.replace('K', '')) * 1_000)
    else:
        return int(float(clean))

def normalize_rarity(rarity_str):
    """Normalize rarity string"""
    rarity_map = {
        'common': 'common',
        'rare': 'rare',
        'epic': 'epic',
        'legendary': 'legendary',
        'mythic': 'mythic',
        'brainrot god': 'brainrot_god',
        'secret': 'secret',
        'og': 'og'
    }
    return rarity_map.get(rarity_str.lower().strip(), rarity_str.lower())

def scrape_santas_fuse():
    """Scrape brainrots from Santa's Fuse page"""
    print("🎅 Scraping Santa's Fuse...")
    
    url = 'https://stealabrainrot.fandom.com/wiki/Santa%27s_Fuse'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    brainrots = []
    
    # Find the table with brainrots
    table = soup.find('table')
    if not table:
        print("❌ No table found on Santa's Fuse page")
        return brainrots
    
    rows = table.find_all('tr')[1:]  # Skip header
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) < 4:
            continue
        
        # Extract name from link
        name_link = cols[0].find('a')
        if not name_link:
            continue
        
        name = name_link.get('title', '').strip()
        rarity = cols[1].get_text().strip()
        income = cols[3].get_text().strip()
        
        if name:
            brainrot = {
                'name': name,
                'rarity': normalize_rarity(rarity),
                'income': income,
                'income_per_second': parse_income(income),
                'source': 'Santa\'s Fuse'
            }
            brainrots.append(brainrot)
            print(f"  ✅ {name} ({rarity}, {income})")
    
    print(f"\n✅ Found {len(brainrots)} brainrots from Santa's Fuse")
    return brainrots

def scrape_christmas_page():
    """Scrape brainrots from Christmas Brainrots page"""
    print("\n🎄 Scraping Christmas Brainrots page...")
    
    url = 'https://stealabrainrot.fandom.com/wiki/Christmas_Brainrots'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    brainrots = []
    
    # Find all tables (each brainrot has its own stats table)
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        
        # Extract data from table rows
        name = None
        rarity = None
        cost = None
        income = None
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                key = cols[0].get_text().strip()
                value = cols[1].get_text().strip()
                
                if key == 'Rarity':
                    rarity = value
                elif key == 'Cost':
                    cost = value
                elif key == 'Income':
                    income = value
        
        # Try to find name from heading before table
        heading = table.find_previous(['h2', 'h3'])
        if heading:
            # Extract name from heading text (remove "**" and "(Link)")
            name_text = heading.get_text()
            name = re.sub(r'\*\*|\(Link\)|\[edit\]|\[\]', '', name_text).strip()
        
        if name and rarity and income:
            brainrot = {
                'name': name,
                'rarity': normalize_rarity(rarity),
                'cost': cost,
                'cost_value': parse_cost(cost) if cost else 0,
                'income': income,
                'income_per_second': parse_income(income),
                'source': 'Christmas Event'
            }
            brainrots.append(brainrot)
            print(f"  ✅ {name} ({rarity}, {income})")
    
    print(f"\n✅ Found {len(brainrots)} brainrots from Christmas page")
    return brainrots

def merge_and_deduplicate(santas_fuse_br, christmas_br):
    """Merge and deduplicate brainrots"""
    print("\n🔄 Merging and deduplicating...")
    
    merged = {}
    
    # Add Santa's Fuse brainrots
    for br in santas_fuse_br:
        merged[br['name']] = br
    
    # Add Christmas page brainrots (prefer these if they have cost)
    for br in christmas_br:
        if br['name'] in merged:
            # Merge data, preferring Christmas page if it has cost
            if br.get('cost_value', 0) > 0:
                merged[br['name']].update({
                    'cost': br['cost'],
                    'cost_value': br['cost_value']
                })
        else:
            merged[br['name']] = br
    
    return list(merged.values())

def save_to_json(brainrots, filename='data/christmas_brainrots.json'):
    """Save brainrots to JSON file"""
    print(f"\n💾 Saving to {filename}...")
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(brainrots, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(brainrots)} Christmas brainrots!")

def main():
    print("=" * 80)
    print("🎄 CHRISTMAS BRAINROTS SCRAPER")
    print("=" * 80)
    
    # Scrape both sources
    santas_fuse = scrape_santas_fuse()
    christmas_page = scrape_christmas_page()
    
    # Merge and deduplicate
    all_christmas = merge_and_deduplicate(santas_fuse, christmas_page)
    
    # Save to JSON
    save_to_json(all_christmas)
    
    print("\n" + "=" * 80)
    print(f"✅ DONE! Total: {len(all_christmas)} Christmas brainrots")
    print("=" * 80)
    
    # Print summary
    print("\n📊 Summary by rarity:")
    rarity_counts = {}
    for br in all_christmas:
        rarity = br['rarity']
        rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
    
    for rarity, count in sorted(rarity_counts.items()):
        print(f"  {rarity.capitalize()}: {count}")

if __name__ == '__main__':
    main()

