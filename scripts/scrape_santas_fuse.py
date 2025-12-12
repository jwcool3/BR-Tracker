"""
Scrape Santa's Fuse Christmas Brainrots
Gets the 14 limited-time Christmas brainrots from the Santa's Fuse machine
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def parse_income(income_str):
    """Parse income string like '11/s', '1.4K/s', '3.2M/s' to number"""
    income_str = income_str.strip().replace('/s', '')
    
    multiplier = 1
    if 'K' in income_str.upper():
        multiplier = 1000
        income_str = income_str.upper().replace('K', '')
    elif 'M' in income_str.upper():
        multiplier = 1000000
        income_str = income_str.upper().replace('M', '')
    elif 'B' in income_str.upper():
        multiplier = 1000000000
        income_str = income_str.upper().replace('B', '')
    
    try:
        return float(income_str) * multiplier
    except:
        return None

def scrape_santas_fuse():
    url = "https://stealabrainrot.fandom.com/wiki/Santa%27s_Fuse"
    
    print(f"Fetching Santa's Fuse brainrots from: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Save debug HTML
        with open('data/santas_fuse_debug.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved debug HTML to data/santas_fuse_debug.html")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table with brainrots
        tables = soup.find_all('table')
        print(f"\nFound {len(tables)} tables")
        
        christmas_brainrots = []
        
        for table_idx, table in enumerate(tables):
            print(f"\n=== Processing Table {table_idx + 1} ===")
            
            rows = table.find_all('tr')
            
            if len(rows) < 2:
                continue
            
            # Get headers
            header_row = rows[0]
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            print(f"Headers: {headers}")
            
            # Check if this is the brainrot table
            if 'Brainrot' not in ' '.join(headers) or 'Income' not in ' '.join(headers):
                continue
            
            # Find column indices
            brainrot_col = next((i for i, h in enumerate(headers) if 'brainrot' in h.lower()), 0)
            rarity_col = next((i for i, h in enumerate(headers) if 'rarity' in h.lower()), 1)
            income_col = next((i for i, h in enumerate(headers) if 'income' in h.lower()), -1)
            
            print(f"Column indices - Brainrot: {brainrot_col}, Rarity: {rarity_col}, Income: {income_col}")
            
            # Process data rows
            for row_idx, row in enumerate(rows[1:], 1):
                cells = row.find_all(['td', 'th'])
                
                if len(cells) <= max(brainrot_col, rarity_col, income_col):
                    continue
                
                # Extract name
                name_cell = cells[brainrot_col]
                name_link = name_cell.find('a')
                name = name_link.get_text(strip=True) if name_link else name_cell.get_text(strip=True)
                
                # Extract rarity
                rarity_cell = cells[rarity_col]
                rarity_text = rarity_cell.get_text(strip=True)
                
                # Normalize rarity
                rarity = 'unknown'
                rarity_lower = rarity_text.lower()
                if 'common' in rarity_lower:
                    rarity = 'common'
                elif 'rare' in rarity_lower and 'epic' not in rarity_lower:
                    rarity = 'rare'
                elif 'epic' in rarity_lower:
                    rarity = 'epic'
                elif 'legendary' in rarity_lower:
                    rarity = 'legendary'
                elif 'mythic' in rarity_lower:
                    rarity = 'mythic'
                elif 'brainrot god' in rarity_lower or 'god' in rarity_lower:
                    rarity = 'brainrot_god'
                elif 'secret' in rarity_lower:
                    rarity = 'secret'
                elif 'og' in rarity_lower:
                    rarity = 'og'
                
                # Extract income
                income_cell = cells[income_col]
                income_text = income_cell.get_text(strip=True)
                income = parse_income(income_text)
                
                if name and income is not None:
                    brainrot = {
                        'name': name,
                        'rarity': rarity,
                        'income_per_second': int(income),
                        'income_text': income_text,
                        'source': 'Santa\'s Fuse'
                    }
                    christmas_brainrots.append(brainrot)
                    print(f"  {row_idx}. {name} ({rarity}) - ${income:,.0f}/s ({income_text})")
        
        print(f"\n=== Summary ===")
        print(f"Total Christmas brainrots found: {len(christmas_brainrots)}")
        
        # Save to JSON
        output_file = 'data/christmas_brainrots.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'brainrots': christmas_brainrots,
                'count': len(christmas_brainrots),
                'source': url,
                'event': 'Santa\'s Fuse (Christmas 2024)'
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved to: {output_file}")
        
        # Print by rarity
        print("\n=== By Rarity ===")
        by_rarity = {}
        for br in christmas_brainrots:
            rarity = br['rarity']
            if rarity not in by_rarity:
                by_rarity[rarity] = []
            by_rarity[rarity].append(br)
        
        for rarity in ['common', 'rare', 'epic', 'legendary', 'mythic', 'brainrot_god', 'secret']:
            if rarity in by_rarity:
                print(f"\n{rarity.upper()}:")
                for br in by_rarity[rarity]:
                    print(f"  - {br['name']}: ${br['income_per_second']:,.0f}/s")
        
        return christmas_brainrots
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == '__main__':
    scrape_santas_fuse()

