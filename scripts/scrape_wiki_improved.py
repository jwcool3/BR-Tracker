#!/usr/bin/env python3
"""
Steal a Brainrot Wiki Card Scraper - IMPROVED
1. First scrapes main wiki page to get CORRECT brainrot names
2. Then scrapes individual pages for detailed data
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


def get_correct_brainrot_names():
    """Scrape main wiki page to get CORRECT brainrot names"""
    
    url = "https://stealabrainrot.fandom.com/wiki/Brainrots"
    
    print(f"🔍 Fetching main wiki page to get correct brainrot names...")
    print(f"URL: {url}\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Error fetching main page: {e}")
        return None
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Save for debugging
    with open('debug_main_wiki.html', 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
    print("📄 Saved debug_main_wiki.html for inspection\n")
    
    brainrot_names = []
    
    # Method 1: Find all links to brainrot pages
    print("Method 1: Searching for brainrot links...")
    
    # Find all links in tables
    tables = soup.find_all('table', class_='article-table')
    print(f"Found {len(tables)} tables\n")
    
    for table_idx, table in enumerate(tables, 1):
        links = table.find_all('a')
        
        for link in links:
            href = link.get('href', '')
            title = link.get('title', '')
            text = link.get_text(strip=True)
            
            # Skip non-wiki links
            if not href.startswith('/wiki/'):
                continue
            
            # Skip special pages
            if any(skip in href.lower() for skip in ['category:', 'file:', 'special:', 'template:']):
                continue
            
            # Get the name from link text or title
            name = text or title
            
            if name and len(name) > 2:  # Must be a real name
                # Clean the name
                name = name.strip()
                
                # Skip if it's just a number or symbol
                if not re.match(r'^[A-Za-z]', name):
                    continue
                
                # Skip if it looks like a page title
                if name.lower() in ['brainrots', 'list', 'home', 'main page']:
                    continue
                
                if name not in brainrot_names:
                    brainrot_names.append(name)
    
    print(f"✅ Found {len(brainrot_names)} unique brainrot names from tables\n")
    
    # Method 2: Also check for images with data-image-name
    print("Method 2: Searching for brainrot images...")
    
    images = soup.find_all('img', {'data-image-name': True})
    print(f"Found {len(images)} images with data-image-name\n")
    
    for img in images:
        img_name = img.get('data-image-name', '')
        
        # Remove file extension
        name = re.sub(r'\.(png|jpg|jpeg|webp|gif)$', '', img_name, flags=re.IGNORECASE)
        name = name.replace('_', ' ').strip()
        
        # Skip if not a proper name
        if not name or len(name) < 3:
            continue
        
        # Skip "transparent" and other non-brainrot names
        if any(skip in name.lower() for skip in ['transparent', 'icon', 'logo', 'banner']):
            continue
        
        if name not in brainrot_names:
            brainrot_names.append(name)
    
    print(f"✅ Total unique brainrot names: {len(brainrot_names)}\n")
    
    # Sort alphabetically
    brainrot_names.sort()
    
    return brainrot_names


def scrape_brainrot_page(name):
    """Scrape individual brainrot wiki page"""
    
    url_name = name.replace(' ', '_')
    url = f"https://stealabrainrot.fandom.com/wiki/{url_name}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
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
    
    return data if (data['cost'] is not None or data['income_per_second'] is not None) else None


def match_thumbnails_to_names(brainrot_names, thumbnail_file='data/brainrot_thumbnails.json'):
    """Match thumbnail files to correct brainrot names"""
    
    if not os.path.exists(thumbnail_file):
        print(f"⚠️  No thumbnail file found at {thumbnail_file}")
        return {}
    
    print(f"📸 Loading thumbnails from {thumbnail_file}...\n")
    
    with open(thumbnail_file, 'r', encoding='utf-8') as f:
        thumbnails = json.load(f)
    
    # Create mapping: correct_name -> thumbnail_data
    name_to_thumbnail = {}
    
    # First pass: exact matches
    for thumb_key, thumb_data in thumbnails.items():
        thumb_name = thumb_data.get('name', '')
        # Clean thumbnail name
        clean_thumb = re.sub(r'\.(png|jpg|jpeg|webp)$', '', thumb_name, flags=re.IGNORECASE)
        clean_thumb = clean_thumb.replace('_', ' ').strip()
        
        # Check for exact match
        for correct_name in brainrot_names:
            if correct_name.lower() == clean_thumb.lower():
                name_to_thumbnail[correct_name] = thumb_data
                break
    
    print(f"✅ Matched {len(name_to_thumbnail)}/{len(brainrot_names)} thumbnails (exact matches)\n")
    
    # Second pass: fuzzy matches for remaining
    from difflib import SequenceMatcher
    
    unmatched_names = [name for name in brainrot_names if name not in name_to_thumbnail]
    unmatched_thumbs = [(k, v) for k, v in thumbnails.items() 
                        if not any(v == thumb for thumb in name_to_thumbnail.values())]
    
    if unmatched_names and unmatched_thumbs:
        print(f"🔍 Attempting fuzzy matching for {len(unmatched_names)} remaining names...\n")
        
        for correct_name in unmatched_names:
            best_match = None
            best_score = 0.7  # Minimum threshold
            
            for thumb_key, thumb_data in unmatched_thumbs:
                thumb_name = thumb_data.get('name', '')
                clean_thumb = re.sub(r'\.(png|jpg|jpeg|webp)$', '', thumb_name, flags=re.IGNORECASE)
                clean_thumb = clean_thumb.replace('_', ' ').strip()
                
                score = SequenceMatcher(None, correct_name.lower(), clean_thumb.lower()).ratio()
                
                if score > best_score:
                    best_score = score
                    best_match = thumb_data
            
            if best_match:
                name_to_thumbnail[correct_name] = best_match
                print(f"  Fuzzy match ({best_score:.0%}): '{correct_name}' → '{best_match['name']}'")
    
    print(f"\n✅ Total matched: {len(name_to_thumbnail)}/{len(brainrot_names)} thumbnails\n")
    
    return name_to_thumbnail


def main():
    print("="*70)
    print("STEAL A BRAINROT WIKI SCRAPER - IMPROVED VERSION")
    print("Gets correct names from main page, then scrapes individual pages")
    print("="*70 + "\n")
    
    # Step 1: Get correct brainrot names from main wiki page
    brainrot_names = get_correct_brainrot_names()
    
    if not brainrot_names:
        print("❌ Could not get brainrot names from main wiki page")
        print("\nPlease save the wiki page manually:")
        print("1. Go to: https://stealabrainrot.fandom.com/wiki/Brainrots")
        print("2. Right-click → Save As → brainrots_wiki.html")
        print("3. Run this script again")
        return
    
    print(f"📝 Saving brainrot names list...\n")
    os.makedirs('data', exist_ok=True)
    
    with open('data/brainrot_names_correct.json', 'w', encoding='utf-8') as f:
        json.dump({
            'total': len(brainrot_names),
            'source': 'Fandom Wiki main page',
            'names': brainrot_names
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(brainrot_names)} names to data/brainrot_names_correct.json\n")
    
    # Show first 20 names
    print("First 20 brainrot names:")
    for i, name in enumerate(brainrot_names[:20], 1):
        print(f"  {i}. {name}")
    print(f"  ... and {len(brainrot_names) - 20} more\n")
    
    # Step 2: Match thumbnails to correct names
    name_to_thumbnail = match_thumbnails_to_names(brainrot_names)
    
    # Step 3: Ask user if they want to continue with scraping
    print("="*70)
    print("READY TO SCRAPE")
    print("="*70)
    print(f"Total brainrots to scrape: {len(brainrot_names)}")
    print(f"Estimated time: {len(brainrot_names) * 0.5 / 60:.1f} minutes")
    print(f"Thumbnails matched: {len(name_to_thumbnail)}/{len(brainrot_names)}")
    print("\nThis will make 1 request per brainrot (being nice to the server)")
    
    response = input("\nContinue with scraping? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("\n✋ Scraping cancelled")
        print(f"📁 Saved correct names to: data/brainrot_names_correct.json")
        print("Run this script again when ready to scrape")
        return
    
    print("\n🚀 Starting scrape...\n")
    
    # Step 4: Scrape individual pages
    scraped_data = []
    failed_scrapes = []
    successful = 0
    
    for idx, name in enumerate(brainrot_names, 1):
        # Progress indicator every 25 items
        if idx % 25 == 0 or idx == 1:
            print(f"\n[{idx}/{len(brainrot_names)}] Progress: {idx/len(brainrot_names)*100:.1f}%")
        
        print(f"  {idx}. {name}...", end=' ')
        
        result = scrape_brainrot_page(name)
        
        if result:
            # Add thumbnail if we have it
            if name in name_to_thumbnail:
                result['image'] = name_to_thumbnail[name].get('local_path', '')
            
            scraped_data.append(result)
            successful += 1
            print(f"✅ Cost: ${result['cost']}, Income: ${result['income_per_second']}/s")
        else:
            failed_scrapes.append({
                'name': name,
                'reason': 'Failed to fetch or parse page',
                'wiki_url': f"https://stealabrainrot.fandom.com/wiki/{name.replace(' ', '_')}",
                'image': name_to_thumbnail.get(name, {}).get('local_path', '')
            })
            print("❌ Failed")
        
        # Be nice to the server
        time.sleep(0.5)
    
    print("\n" + "="*70)
    print("SCRAPING COMPLETE!")
    print("="*70)
    print(f"✅ Successfully scraped: {successful}/{len(brainrot_names)} ({successful/len(brainrot_names)*100:.1f}%)")
    print(f"❌ Failed: {len(failed_scrapes)}/{len(brainrot_names)} ({len(failed_scrapes)/len(brainrot_names)*100:.1f}%)")
    
    # Save results
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
                    'failed': len(failed_scrapes),
                    'with_thumbnails': sum(1 for br in scraped_data if br.get('image'))
                },
                'brainrots': scraped_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved {len(scraped_data)} brainrots to {output_file}")
    
    # 2. Save failed scrapes
    if failed_scrapes:
        failed_file = 'data/brainrots_failed_MANUAL_FIX.json'
        
        with open(failed_file, 'w', encoding='utf-8') as f:
            json.dump({
                'instructions': 'These brainrots failed to scrape. Please add data manually.',
                'total': len(failed_scrapes),
                'brainrots': failed_scrapes
            }, f, indent=2, ensure_ascii=False)
        
        print(f"❌ Saved {len(failed_scrapes)} failed brainrots to {failed_file}")
    
    # Show sample
    if scraped_data:
        print("\n" + "="*70)
        print("SAMPLE DATA (first 5)")
        print("="*70)
        for br in scraped_data[:5]:
            print(f"\n{br['name']}:")
            print(f"  ID: {br['id']}")
            print(f"  Cost: ${br['cost']:,}" if br['cost'] else "  Cost: Unknown")
            print(f"  Income: ${br['income_per_second']:,}/s" if br['income_per_second'] else "  Income: Unknown")
            print(f"  Rarity: {br['rarity']}" if br['rarity'] else "  Rarity: Unknown")
            print(f"  Image: {br.get('image', 'No thumbnail')}")
    
    # Summary
    print("\n" + "="*70)
    print("FILES CREATED")
    print("="*70)
    print("1. data/brainrot_names_correct.json - List of correct names from wiki")
    print(f"2. data/brainrots_wiki_scraped.json - {len(scraped_data)} scraped brainrots")
    if failed_scrapes:
        print(f"3. data/brainrots_failed_MANUAL_FIX.json - {len(failed_scrapes)} failed brainrots")
    print("4. debug_main_wiki.html - Main wiki page for debugging")
    
    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("1. Review data/brainrots_wiki_scraped.json")
    print("2. Manually fix failed brainrots (if any)")
    print("3. Replace data/brainrots.json with scraped data")
    print("4. Test in your app!")


if __name__ == '__main__':
    main()
