#!/usr/bin/env python3
"""
Steal a Brainrot Wiki Card Scraper
Scrapes from individual brainrot cards/figures on the wiki
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import os
import time

def parse_number(text):
    """Parse numbers with K, M, B, T suffixes"""
    if not text or text in ['N/A', '?', 'Unknown', '']:
        return None
    
    # Remove dollar signs, spaces, commas, "/s" suffix
    text = str(text).replace('$', '').replace(',', '').replace(' ', '').replace('/s', '').strip()
    
    if not text:
        return None
    
    # Handle K, M, B, T suffixes
    multipliers = {
        'K': 1_000,
        'M': 1_000_000,
        'B': 1_000_000_000,
        'T': 1_000_000_000_000
    }
    
    for suffix, multiplier in multipliers.items():
        if text.upper().endswith(suffix):
            try:
                number = float(text[:-1])
                return int(number * multiplier)
            except:
                return None
    
    # Try parsing as plain number
    try:
        return int(float(text))
    except:
        return None


def generate_id(name):
    """Generate URL-safe ID from name"""
    id_str = name.lower()
    id_str = re.sub(r'[^a-z0-9]+', '-', id_str)
    id_str = id_str.strip('-')
    return id_str


def scrape_brainrot_page(name):
    """Scrape individual brainrot wiki page"""
    
    url_name = name.replace(' ', '_')
    url = f"https://stealabrainrot.fandom.com/wiki/{url_name}"
    
    print(f"  Fetching {name}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"    [WARN] Could not fetch page: {e}")
        return None
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    data = {
        'name': name,
        'cost': None,
        'income_per_second': None,
        'rarity': None,
        'id': generate_id(name)
    }
    
    # Look for portable-infobox
    infobox = soup.find('aside', class_='portable-infobox')
    
    if infobox:
        # Find all data items
        data_items = infobox.find_all('div', class_='pi-data')
        
        for item in data_items:
            label_elem = item.find('h3', class_='pi-data-label')
            value_elem = item.find('div', class_='pi-data-value')
            
            if not label_elem or not value_elem:
                continue
            
            label = label_elem.get_text(strip=True).lower()
            value = value_elem.get_text(strip=True)
            
            if 'cost' in label or 'price' in label:
                data['cost'] = parse_number(value)
            elif 'income' in label or 'money' in label or '/s' in label:
                data['income_per_second'] = parse_number(value)
            elif 'rarity' in label or 'tier' in label or 'type' in label:
                data['rarity'] = value.lower().replace(' ', '_')
    
    if data['cost'] or data['income_per_second']:
        print(f"    [OK] Cost: ${data['cost']}, Income: ${data['income_per_second']}/s, Rarity: {data['rarity']}")
        return data
    else:
        print(f"    [WARN] No data found in infobox")
        return None


def main():
    print("="*70)
    print("STEAL A BRAINROT WIKI CARD SCRAPER")
    print("Scrapes accurate data from individual brainrot wiki pages")
    print("="*70 + "\n")
    
    # Load existing brainrots to get names and thumbnails
    if not os.path.exists('data/brainrots.json'):
        print("[ERROR] data/brainrots.json not found!")
        print("We need this file to know which brainrots to scrape.")
        return
    
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
        existing_brainrots = existing_data.get('brainrots', []) if isinstance(existing_data, dict) else existing_data
    
    print(f"Loaded {len(existing_brainrots)} brainrot names\n")
    
    # Load name corrections
    name_corrections = {}
    if os.path.exists('data/wiki_name_corrections.json'):
        with open('data/wiki_name_corrections.json', 'r', encoding='utf-8') as f:
            corrections_data = json.load(f)
            name_corrections = corrections_data.get('corrections', {})
        print(f"Loaded {len(name_corrections)} name corrections\n")
    
    # Create lookup for existing data (to preserve thumbnails)
    existing_lookup = {}
    for br in existing_brainrots:
        name = br.get('name', '')
        if name:
            existing_lookup[name] = br
    
    print(f"Created lookup for {len(existing_lookup)} existing brainrots\n")
    
    # Scrape ALL brainrots
    print(f"Starting full scrape of {len(existing_brainrots)} brainrots...")
    print(f"This will take approximately {len(existing_brainrots) * 0.5 / 60:.1f} minutes\n")
    print("Progress will be shown every 10 brainrots...\n")
    
    # Get all brainrot names from existing data
    brainrot_names = []
    for br in existing_brainrots:
        name = br.get('name', '')
        if name:
            brainrot_names.append(name)
    
    scraped_data = []
    failed_scrapes = []
    incomplete_data = []
    successful = 0
    failed = 0
    
    for idx, name in enumerate(brainrot_names, 1):
        # Progress indicator every 10 items
        if idx % 10 == 0 or idx == 1:
            print(f"\n[{idx}/{len(brainrot_names)}] Progress: {idx/len(brainrot_names)*100:.1f}%")
        
        result = scrape_brainrot_page(name)
        
        # If failed and we have a correction, try the corrected name
        if not result and name in name_corrections:
            corrected_name = name_corrections[name]
            print(f"    [RETRY] Trying corrected name: {corrected_name}")
            result = scrape_brainrot_page(corrected_name)
            if result:
                # Use the original name in the result
                result['name'] = name
                result['id'] = generate_id(name)
                print(f"    [OK] Success with corrected name!")
        
        if result:
            # Merge with existing data to preserve thumbnails
            if name in existing_lookup:
                existing = existing_lookup[name]
                if existing.get('image'):
                    result['image'] = existing['image']
            
            # Check if data is complete
            if result['cost'] is not None and result['income_per_second'] is not None:
                scraped_data.append(result)
                successful += 1
            else:
                # Data is incomplete - preserve what we have from existing data
                if name in existing_lookup:
                    existing = existing_lookup[name]
                    result['cost'] = result['cost'] or existing.get('cost')
                    result['income_per_second'] = result['income_per_second'] or existing.get('income_per_second')
                    result['rarity'] = result['rarity'] or existing.get('rarity')
                
                incomplete_data.append({
                    'name': name,
                    'id': result['id'],
                    'cost': result['cost'],
                    'income_per_second': result['income_per_second'],
                    'rarity': result['rarity'],
                    'image': result.get('image'),
                    'reason': 'Missing cost or income data',
                    'wiki_url': f"https://stealabrainrot.fandom.com/wiki/{name_corrections.get(name, name).replace(' ', '_')}"
                })
                print(f"    [WARN] Incomplete data (added to manual fix list)")
        else:
            # Failed to scrape even with corrections
            wiki_name = name_corrections.get(name, name)
            failed_scrapes.append({
                'name': name,
                'corrected_name': name_corrections.get(name),
                'reason': 'Failed to fetch or parse page',
                'wiki_url': f"https://stealabrainrot.fandom.com/wiki/{wiki_name.replace(' ', '_')}"
            })
            failed += 1
        
        # Be nice to the server (0.5 second delay)
        time.sleep(0.5)
    
    print("\n" + "="*70)
    print("SCRAPING COMPLETE!")
    print("="*70)
    print(f"[SUCCESS] Successfully scraped: {successful}/{len(brainrot_names)}")
    print(f"[WARN] Incomplete data: {len(incomplete_data)}/{len(brainrot_names)}")
    print(f"[FAILED] Failed: {len(failed_scrapes)}/{len(brainrot_names)}")
    
    # Save all files
    os.makedirs('data', exist_ok=True)
    
    # 1. Save successfully scraped data
    if scraped_data:
        output_file = 'data/brainrots_wiki_scraped.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'total_scraped': len(scraped_data),
                    'total_attempted': len(brainrot_names),
                    'success_rate': f"{len(scraped_data)/len(brainrot_names)*100:.1f}%",
                    'source': 'Fandom Wiki individual pages',
                    'incomplete': len(incomplete_data),
                    'failed': len(failed_scrapes)
                },
                'brainrots': scraped_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n[OK] Saved {len(scraped_data)} complete brainrots to {output_file}")
    
    # 2. Save incomplete data for manual fixing
    if incomplete_data:
        incomplete_file = 'data/brainrots_incomplete_MANUAL_FIX.json'
        
        with open(incomplete_file, 'w', encoding='utf-8') as f:
            json.dump({
                'instructions': 'These brainrots have incomplete data. Please fill in missing values manually.',
                'total': len(incomplete_data),
                'brainrots': incomplete_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"[WARN] Saved {len(incomplete_data)} incomplete brainrots to {incomplete_file}")
    
    # 3. Save failed scrapes for manual review
    if failed_scrapes:
        failed_file = 'data/brainrots_failed_MANUAL_FIX.json'
        
        with open(failed_file, 'w', encoding='utf-8') as f:
            json.dump({
                'instructions': 'These brainrots failed to scrape. Please add data manually or check wiki URLs.',
                'total': len(failed_scrapes),
                'brainrots': failed_scrapes
            }, f, indent=2, ensure_ascii=False)
        
        print(f"[FAILED] Saved {len(failed_scrapes)} failed brainrots to {failed_file}")
    
    # Show sample of scraped data
    if scraped_data:
        print("\n" + "="*70)
        print("SAMPLE SCRAPED DATA (first 5)")
        print("="*70)
        for br in scraped_data[:5]:
            print(f"\n{br['name']}:")
            print(f"  ID: {br['id']}")
            print(f"  Cost: ${br['cost']:,}" if br['cost'] else "  Cost: Unknown")
            print(f"  Income: ${br['income_per_second']:,}/s" if br['income_per_second'] else "  Income: Unknown")
            print(f"  Rarity: {br['rarity']}" if br['rarity'] else "  Rarity: Unknown")
    
    # Summary and next steps
    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    
    if scraped_data:
        print("[SUCCESS] Scraping successful!")
        print(f"\n[FILES] Files created:")
        print(f"   1. data/brainrots_wiki_scraped.json - {len(scraped_data)} complete brainrots")
        
        if incomplete_data:
            print(f"   2. data/brainrots_incomplete_MANUAL_FIX.json - {len(incomplete_data)} to fix manually")
        
        if failed_scrapes:
            print(f"   3. data/brainrots_failed_MANUAL_FIX.json - {len(failed_scrapes)} to add manually")
        
        print("\n[NEXT] To use this data:")
        print("   1. Review the scraped data for accuracy")
        print("   2. Manually fix incomplete/failed entries")
        print("   3. Merge with existing thumbnails")
        print("   4. Replace data/brainrots.json with the merged data")
        print("   5. Copy to app/public/brainrots.json")
    else:
        print("[ERROR] No data was successfully scraped")
        print("\nAll brainrots need manual entry. Check:")
        print("   - data/brainrots_incomplete_MANUAL_FIX.json")
        print("   - data/brainrots_failed_MANUAL_FIX.json")


if __name__ == '__main__':
    main()

