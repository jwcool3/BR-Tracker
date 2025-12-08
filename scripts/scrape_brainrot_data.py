#!/usr/bin/env python3
"""
Scrape Complete Brainrot Data from Wiki
Extracts names, costs, income, rarity, and matches with thumbnails
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from difflib import SequenceMatcher


def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def clean_name(name):
    """Clean up brainrot names"""
    # Remove file extensions
    name = re.sub(r'\.(png|jpg|jpeg|webp|gif|svg)$', '', name, flags=re.IGNORECASE)
    # Remove extra whitespace
    name = ' '.join(name.split())
    # Remove "transparent", "no bg", etc.
    name = re.sub(r'\s+(transparent|no bg|clear background)\s*', ' ', name, flags=re.IGNORECASE)
    return name.strip()


def parse_number(text):
    """Parse numbers like '1K', '1M', '1B' into actual numbers"""
    if not text or text == 'N/A':
        return None
    
    text = text.strip().replace(',', '').replace('$', '').upper()
    
    multipliers = {
        'K': 1_000,
        'M': 1_000_000,
        'B': 1_000_000_000,
        'T': 1_000_000_000_000
    }
    
    for suffix, multiplier in multipliers.items():
        if suffix in text:
            try:
                number = float(text.replace(suffix, ''))
                return int(number * multiplier)
            except:
                pass
    
    try:
        return int(float(text))
    except:
        return None


def scrape_brainrot_table():
    """Scrape the main brainrot table from the wiki"""
    
    url = "https://stealabrainrot.fandom.com/wiki/Brainrots"
    
    print(f"Fetching {url}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching page: {e}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    brainrots = []
    
    # Find all tables
    tables = soup.find_all('table', class_='article-table')
    print(f"Found {len(tables)} tables on the page\n")
    
    for table_idx, table in enumerate(tables, 1):
        print(f"Processing table {table_idx}...")
        
        # Get headers
        headers_row = table.find('tr')
        if not headers_row:
            continue
        
        headers = [th.get_text(strip=True) for th in headers_row.find_all(['th', 'td'])]
        print(f"  Headers: {headers}")
        
        # Find rows with data
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 3:  # Need at least image, name, and one data field
                continue
            
            try:
                # Extract data from cells
                data = {}
                
                # Look for image
                img = row.find('img')
                if img:
                    data['wiki_image_url'] = img.get('data-src') or img.get('src')
                    data['wiki_image_name'] = img.get('data-image-name', '') or img.get('alt', '')
                
                # Extract text from each cell
                cell_texts = [cell.get_text(strip=True) for cell in cells]
                
                # Try to map columns based on headers
                for i, cell_text in enumerate(cell_texts):
                    if i < len(headers):
                        header = headers[i].lower()
                        
                        if 'name' in header or i == 1:  # Usually second column
                            if cell_text and not cell_text.startswith('http'):
                                data['name'] = clean_name(cell_text)
                        
                        if 'cost' in header or 'price' in header:
                            data['cost'] = parse_number(cell_text)
                        
                        if 'income' in header or 'money' in header:
                            data['income_per_second'] = parse_number(cell_text)
                        
                        if 'rarity' in header:
                            data['rarity'] = cell_text.lower().replace(' ', '_')
                
                # If we have at least a name, add it
                if 'name' in data and data['name']:
                    brainrots.append(data)
                    print(f"    Found: {data.get('name')}")
                
            except Exception as e:
                print(f"    Error parsing row: {e}")
                continue
    
    return brainrots


def match_thumbnails_to_brainrots(brainrots, thumbnail_data):
    """Match scraped brainrot data with downloaded thumbnails"""
    
    print("\n" + "="*50)
    print("MATCHING THUMBNAILS TO BRAINROTS")
    print("="*50 + "\n")
    
    # Create thumbnail lookup
    thumbnails = {}
    for item in thumbnail_data:
        name = clean_name(item['name'])
        thumbnails[name.lower()] = item
    
    matched = []
    unmatched_thumbnails = set(thumbnails.keys())
    unmatched_brainrots = []
    
    for brainrot in brainrots:
        brainrot_name = brainrot['name']
        best_match = None
        best_score = 0
        
        # Try exact match first
        if brainrot_name.lower() in thumbnails:
            best_match = thumbnails[brainrot_name.lower()]
            best_score = 1.0
        else:
            # Try fuzzy matching
            for thumb_name, thumb_data in thumbnails.items():
                score = similarity(brainrot_name, thumb_name)
                if score > best_score:
                    best_score = score
                    best_match = thumb_data
        
        # If we found a good match (>60% similarity)
        if best_match and best_score > 0.6:
            brainrot['image'] = best_match.get('local_path', '')
            brainrot['thumbnail_name'] = clean_name(best_match['name'])
            brainrot['match_confidence'] = round(best_score, 2)
            matched.append(brainrot)
            
            # Remove from unmatched
            thumb_key = clean_name(best_match['name']).lower()
            if thumb_key in unmatched_thumbnails:
                unmatched_thumbnails.remove(thumb_key)
            
            if best_score < 1.0:
                print(f"⚠️  Fuzzy match ({best_score:.0%}): '{brainrot_name}' → '{best_match['name']}'")
            else:
                print(f"✓ Exact match: {brainrot_name}")
        else:
            unmatched_brainrots.append(brainrot)
            print(f"❌ No match found for: {brainrot_name}")
    
    return matched, list(unmatched_thumbnails), unmatched_brainrots


def create_manual_mapping_template(unmatched_thumbnails, unmatched_brainrots):
    """Create a template file for manual name corrections"""
    
    mapping = {
        "_instructions": [
            "This file helps map incorrectly named thumbnails to actual brainrot names.",
            "Fill in the 'correct_name' field for each thumbnail.",
            "Leave 'correct_name' as null if the thumbnail is not a real brainrot.",
            "After filling in, run the merge script again."
        ],
        "thumbnail_corrections": []
    }
    
    for thumb in unmatched_thumbnails:
        mapping["thumbnail_corrections"].append({
            "thumbnail_name": thumb,
            "correct_name": None,
            "notes": ""
        })
    
    # Also list unmatched brainrots for reference
    mapping["unmatched_brainrots"] = [br['name'] for br in unmatched_brainrots]
    
    return mapping


def main():
    print("="*50)
    print("BRAINROT DATA SCRAPER")
    print("="*50 + "\n")
    
    # Load existing thumbnail data
    thumbnail_file = "data/brainrot_thumbnails.json"
    print(f"Loading thumbnails from {thumbnail_file}...")
    
    try:
        with open(thumbnail_file, 'r', encoding='utf-8') as f:
            thumbnail_data = json.load(f)
        print(f"Loaded {len(thumbnail_data)} thumbnails\n")
    except Exception as e:
        print(f"Error loading thumbnails: {e}")
        return
    
    # Scrape brainrot data from wiki
    brainrots = scrape_brainrot_table()
    
    if not brainrots:
        print("\n❌ No brainrot data found. The page structure may have changed.")
        print("Falling back to thumbnail-only mode...\n")
        
        # Just create entries from thumbnails
        output = {
            "brainrots": [],
            "_metadata": {
                "source": "thumbnails only (wiki scrape failed)",
                "total_count": len(thumbnail_data)
            }
        }
        
        for item in thumbnail_data:
            name = clean_name(item['name'])
            if name:
                output["brainrots"].append({
                    "id": re.sub(r'[^\w\s-]', '', name).lower().strip().replace(' ', '-'),
                    "name": name,
                    "rarity": "unknown",
                    "cost": None,
                    "income_per_second": None,
                    "image": item.get('local_path', ''),
                    "_thumbnail_original_name": item['name']
                })
        
        with open('brainrots_scraped.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(output['brainrots'])} entries to brainrots_scraped.json")
        return
    
    print(f"\n✅ Found {len(brainrots)} brainrots from wiki")
    
    # Match with thumbnails
    matched, unmatched_thumbs, unmatched_brainrots = match_thumbnails_to_brainrots(
        brainrots, thumbnail_data
    )
    
    print("\n" + "="*50)
    print("RESULTS")
    print("="*50)
    print(f"✅ Matched: {len(matched)}")
    print(f"📸 Unmatched thumbnails: {len(unmatched_thumbs)}")
    print(f"📝 Unmatched brainrots: {len(unmatched_brainrots)}")
    
    # Save matched data
    output = {
        "brainrots": matched,
        "_metadata": {
            "source": "wiki + thumbnails",
            "total_count": len(matched),
            "matched_count": len(matched),
            "unmatched_thumbnails": len(unmatched_thumbs),
            "unmatched_brainrots": len(unmatched_brainrots)
        }
    }
    
    output_file = "brainrots_scraped.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved matched data to {output_file}")
    
    # Create manual mapping template
    if unmatched_thumbs or unmatched_brainrots:
        mapping = create_manual_mapping_template(unmatched_thumbs, unmatched_brainrots)
        
        mapping_file = "thumbnail_name_corrections.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        
        print(f"📋 Created mapping template: {mapping_file}")
        print(f"\n⚠️  Please review {mapping_file} and fill in correct names")
        print(f"   Then run the merge script again to include corrections")
    
    print("\n✅ Done!")


if __name__ == "__main__":
    main()

