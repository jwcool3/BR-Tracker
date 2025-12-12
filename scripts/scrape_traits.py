"""
Scrape Traits from Steal a Brainrot Wiki
Gets accurate trait names, multipliers, and details
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def scrape_traits():
    url = "https://stealabrainrot.fandom.com/wiki/Traits"
    
    print(f"Fetching traits from: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Save debug HTML
        with open('data/traits_debug.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved debug HTML to data/traits_debug.html")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all tables on the page
        tables = soup.find_all('table')
        print(f"\nFound {len(tables)} tables")
        
        all_traits = []
        
        for table_idx, table in enumerate(tables):
            print(f"\n=== Processing Table {table_idx + 1} ===")
            
            # Get all rows
            rows = table.find_all('tr')
            
            # Skip if less than 2 rows (need header + data)
            if len(rows) < 2:
                continue
            
            # Get headers from first row
            header_row = rows[0]
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            print(f"Headers: {headers}")
            
            # Try to find multiplier column
            multiplier_col = None
            name_col = None
            
            for idx, header in enumerate(headers):
                if 'multiplier' in header.lower():
                    multiplier_col = idx
                if 'name' in header.lower():
                    name_col = idx
            
            if multiplier_col is None:
                print(f"No multiplier column found in table {table_idx + 1}")
                continue
            
            if name_col is None:
                name_col = 0  # Default to first column
            
            # Process data rows
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) <= max(name_col, multiplier_col):
                    continue
                
                # Extract name
                name_cell = cells[name_col]
                name = name_cell.get_text(strip=True)
                
                # Extract multiplier
                multiplier_cell = cells[multiplier_col]
                multiplier_text = multiplier_cell.get_text(strip=True)
                
                # Parse multiplier
                multiplier = None
                if 'x' in multiplier_text.lower():
                    # Format: "8x"
                    match = re.search(r'([\d.]+)x', multiplier_text, re.IGNORECASE)
                    if match:
                        multiplier = float(match.group(1))
                elif '÷' in multiplier_text:
                    # Format: "÷2" (divide)
                    match = re.search(r'÷([\d.]+)', multiplier_text)
                    if match:
                        divisor = float(match.group(1))
                        multiplier = -1.0 / divisor  # Store as negative for division
                
                if name and multiplier is not None:
                    trait = {
                        'name': name,
                        'multiplier': multiplier,
                        'raw_text': multiplier_text
                    }
                    all_traits.append(trait)
                    print(f"  Found: {name} = {multiplier}x")
        
        print(f"\n=== Summary ===")
        print(f"Total traits found: {len(all_traits)}")
        
        # Save to JSON
        output_file = 'data/traits_scraped.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'traits': all_traits,
                'count': len(all_traits),
                'source': url
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved to: {output_file}")
        
        # Print organized summary
        print("\n=== Traits by Multiplier ===")
        sorted_traits = sorted(all_traits, key=lambda x: x['multiplier'], reverse=True)
        for trait in sorted_traits:
            print(f"{trait['name']}: {trait['multiplier']}x")
        
        return all_traits
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == '__main__':
    scrape_traits()

