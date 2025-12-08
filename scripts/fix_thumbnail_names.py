#!/usr/bin/env python3
"""
Fix Thumbnail Names and Scrape from TechWiser Guide
The TechWiser guide has better structured data than the Fandom wiki
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import os
from difflib import SequenceMatcher


def clean_name(name):
    """Clean up names"""
    name = re.sub(r'\.(png|jpg|jpeg|webp|gif|svg)$', '', name, flags=re.IGNORECASE)
    name = ' '.join(name.split())
    name = re.sub(r'\s+(transparent|no bg|clear background|image|new)\s*$', '', name, flags=re.IGNORECASE)
    return name.strip()


def name_to_id(name):
    """Convert name to ID"""
    cleaned = re.sub(r'[^\w\s-]', '', name)
    return cleaned.lower().strip().replace(' ', '-').replace('--', '-')


def scrape_techwiser_guide():
    """Scrape the TechWiser brainrot guide which has better structured tables"""
    
    url = "https://techwiser.com/all-brainrots-and-secrets-in-steal-a-brainrot-roblox/"
    
    print(f"\nFetching TechWiser guide: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Error fetching page: {e}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    brainrots = []
    
    # Find all tables
    tables = soup.find_all('table')
    print(f"Found {len(tables)} tables")
    
    for table_idx, table in enumerate(tables, 1):
        print(f"\nProcessing table {table_idx}...")
        
        # Get headers
        header_row = table.find('tr')
        if not header_row:
            continue
        
        headers = [th.get_text(strip=True).lower() for th in header_row.find_all(['th', 'td'])]
        print(f"  Headers: {headers}")
        
        # Check if this looks like a brainrot table
        has_name = any('name' in h or 'brainrot' in h for h in headers)
        has_price_or_cost = any('cost' in h or 'price' in h for h in headers)
        
        if not (has_name and has_price_or_cost):
            print("  Skipping - not a brainrot table")
            continue
        
        # Process rows
        rows = table.find_all('tr')[1:]  # Skip header
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue
            
            cell_texts = [cell.get_text(strip=True) for cell in cells]
            
            entry = {}
            
            for i, text in enumerate(cell_texts):
                if i < len(headers):
                    header = headers[i].lower()  # Make case-insensitive
                    
                    if 'name' in header and 'brainrot' in header:
                        entry['name'] = clean_name(text)
                    elif 'name' in header and 'brainrot' not in header:
                        # Might be just "name" column
                        if 'name' not in entry:  # Only set if not already set
                            entry['name'] = clean_name(text)
                    elif 'cost' in header or 'price' in header:
                        entry['cost'] = parse_number(text)
                    elif 'income' in header or 'money' in header or '/s' in text:
                        # Parse income - handle both "Income" header and "/s" in value
                        parsed = parse_number(text)
                        if parsed is not None:
                            entry['income_per_second'] = parsed
                    elif 'rarity' in header:
                        entry['rarity'] = text.lower().strip().replace(' ', '_')
            
            if 'name' in entry and entry['name']:
                # Try to determine rarity from context if not found
                if 'rarity' not in entry:
                    entry['rarity'] = guess_rarity_from_context(entry['name'], table_idx)
                
                brainrots.append(entry)
                print(f"    ✓ {entry['name']}")
    
    return brainrots


def parse_number(text):
    """Parse numbers with K, M, B suffixes and /s suffix"""
    if not text or text in ['N/A', 'TBA', 'Unknown', '?', '-', '']:
        return None
    
    # Remove common formatting
    text = text.strip().replace(',', '').replace('$', '').upper()
    # Remove /s suffix (for income per second)
    text = text.replace('/S', '').replace('/SEC', '').strip()
    
    multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        'T': 1000000000000
    }
    
    for suffix, mult in multipliers.items():
        if suffix in text:
            try:
                num = float(text.replace(suffix, '').strip())
                return int(num * mult)
            except:
                pass
    
    try:
        return int(float(text))
    except:
        return None


def guess_rarity_from_context(name, table_idx):
    """Guess rarity based on table position and name patterns"""
    name_lower = name.lower()
    
    # Known patterns
    if name_lower.startswith('los '):
        return 'legendary'
    if 'lucky' in name_lower or 'block' in name_lower:
        return 'mythic'
    if 'admin' in name_lower:
        return 'secret'
    if 'elephant' in name_lower or 'meowl' in name_lower:
        return 'brainrot_god'
    
    # Based on table order (usually organized by rarity)
    rarity_order = ['common', 'rare', 'epic', 'legendary', 'mythic', 'secret', 'og', 'brainrot_god']
    if table_idx <= len(rarity_order):
        return rarity_order[table_idx - 1]
    
    return 'unknown'


def create_thumbnail_review_file(thumbnails):
    """Create a file for reviewing and correcting thumbnail names"""
    
    review_data = {
        "_instructions": [
            "Review each thumbnail and fix the 'corrected_name' field if needed.",
            "Check the thumbnail image file to see what it actually shows.",
            "Common issues:",
            "  - Working filenames (like 'playboi-carti' should be 'La Grand Combination')",
            "  - Version numbers (like 'EsokSekolah2' should be 'Esok Sekolah')",
            "  - Transparent/NEW/etc suffixes",
            "Set 'corrected_name' to the ACTUAL brainrot name shown in the image.",
            "Set 'is_duplicate' to true if this is a duplicate of another entry.",
            "Set 'is_junk' to true if this is not a real brainrot (icon, button, etc)."
        ],
        "thumbnails": []
    }
    
    for item in thumbnails:
        name = clean_name(item['name'])
        
        # Flag suspicious names
        flags = []
        if any(char.isdigit() for char in name[-3:]):  # Ends with numbers
            flags.append("version_number")
        if len(name.split()) == 1 and len(name) < 5:  # Very short single word
            flags.append("suspicious_short")
        if 'untitled' in name.lower() or 'image' in name.lower():
            flags.append("temp_filename")
        if '(' in name or ')' in name:
            flags.append("special_chars")
        
        review_data["thumbnails"].append({
            "original_name": item['name'],
            "cleaned_name": name,
            "corrected_name": name,  # User should edit this
            "image_path": item.get('local_path', ''),
            "flags": flags,
            "is_duplicate": False,
            "is_junk": False,
            "notes": ""
        })
    
    return review_data


def merge_all_data(scraped_data, thumbnails, corrections=None):
    """Merge scraped data with thumbnails and manual corrections"""
    
    print("\n" + "="*50)
    print("MERGING ALL DATA")
    print("="*50)
    
    # Load corrections if available
    corrections_map = {}
    if corrections:
        for item in corrections.get('thumbnails', []):
            if not item.get('is_junk') and not item.get('is_duplicate'):
                orig = item['original_name'].lower()
                corrected = item.get('corrected_name', item['cleaned_name'])
                if corrected and corrected != item['cleaned_name']:
                    corrections_map[orig] = corrected
                    print(f"  📝 Correction: '{item['original_name']}' → '{corrected}'")
    
    # Create thumbnail lookup with corrections applied
    thumbnail_map = {}
    for item in thumbnails:
        orig_name = item['name']
        corrected_name = corrections_map.get(orig_name.lower(), clean_name(orig_name))
        thumbnail_map[corrected_name.lower()] = item
    
    # Match scraped data with thumbnails
    final_brainrots = []
    matched_thumbs = set()
    
    for data in scraped_data:
        name_key = data['name'].lower()
        
        if name_key in thumbnail_map:
            thumb = thumbnail_map[name_key]
            data['image'] = thumb.get('local_path', '')
            matched_thumbs.add(name_key)
            print(f"  ✓ Matched: {data['name']}")
        else:
            # Try fuzzy matching
            best_match = None
            best_score = 0
            for thumb_name, thumb_data in thumbnail_map.items():
                score = SequenceMatcher(None, name_key, thumb_name).ratio()
                if score > best_score:
                    best_score = score
                    best_match = (thumb_name, thumb_data)
            
            if best_match and best_score > 0.7:
                data['image'] = best_match[1].get('local_path', '')
                matched_thumbs.add(best_match[0])
                print(f"  ≈ Fuzzy ({best_score:.0%}): {data['name']} → {best_match[0]}")
            else:
                data['image'] = None
                print(f"  ✗ No match: {data['name']}")
        
        # Add ID
        data['id'] = name_to_id(data['name'])
        final_brainrots.append(data)
    
    # Add unmatched thumbnails
    for thumb_name, thumb_data in thumbnail_map.items():
        if thumb_name not in matched_thumbs:
            name = clean_name(thumb_data['name'])
            if corrections_map.get(thumb_data['name'].lower()):
                name = corrections_map[thumb_data['name'].lower()]
            
            final_brainrots.append({
                'id': name_to_id(name),
                'name': name,
                'rarity': guess_rarity_from_context(name, 0),
                'cost': None,
                'income_per_second': None,
                'image': thumb_data.get('local_path', ''),
                '_source': 'thumbnail_only'
            })
            print(f"  + Added from thumbnail: {name}")
    
    return final_brainrots


def main():
    print("="*50)
    print("BRAINROT DATA FIXER & SCRAPER")
    print("="*50)
    
    # Load thumbnails
    thumbnail_file = "data/brainrot_thumbnails.json"
    if not os.path.exists(thumbnail_file):
        print(f"❌ {thumbnail_file} not found!")
        return
    
    with open(thumbnail_file, 'r', encoding='utf-8') as f:
        thumbnails = json.load(f)
    print(f"✓ Loaded {len(thumbnails)} thumbnails")
    
    # Try to scrape from TechWiser
    scraped_data = scrape_techwiser_guide()
    
    if scraped_data:
        print(f"\n✓ Scraped {len(scraped_data)} brainrots from TechWiser")
    else:
        print("\n⚠️  Could not scrape TechWiser guide")
        scraped_data = []
    
    # Create thumbnail review file
    review_file = "thumbnail_corrections.json"
    if not os.path.exists(review_file):
        print(f"\n📋 Creating thumbnail review file: {review_file}")
        review_data = create_thumbnail_review_file(thumbnails)
        with open(review_file, 'w', encoding='utf-8') as f:
            json.dump(review_data, f, indent=2, ensure_ascii=False)
        print(f"   Please review {review_file} and fix any incorrect names")
        print(f"   Then run this script again to apply corrections")
    
    # Load corrections if available
    corrections = None
    if os.path.exists(review_file):
        with open(review_file, 'r', encoding='utf-8') as f:
            corrections = json.load(f)
        print(f"\n✓ Loaded corrections from {review_file}")
    
    # Merge everything
    final_data = merge_all_data(scraped_data, thumbnails, corrections)
    
    # Sort by name
    final_data.sort(key=lambda x: x['name'].lower())
    
    # Save output
    output = {
        "brainrots": final_data,
        "_metadata": {
            "total_count": len(final_data),
            "scraped_with_data": len([b for b in final_data if b.get('cost') is not None]),
            "thumbnail_only": len([b for b in final_data if b.get('_source') == 'thumbnail_only']),
            "sources": ["techwiser_guide", "wiki_thumbnails", "manual_corrections"]
        }
    }
    
    output_file = "brainrots_final.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total brainrots: {len(final_data)}")
    print(f"  - With cost/income data: {output['_metadata']['scraped_with_data']}")
    print(f"  - Thumbnail only: {output['_metadata']['thumbnail_only']}")
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n📝 Review {review_file} for name corrections")
    print("\n✅ Done!")


if __name__ == "__main__":
    main()

