#!/usr/bin/env python3
"""
Debug TechWiser scraper to see what data is actually available
"""

import requests
from bs4 import BeautifulSoup
import json

url = "https://techwiser.com/all-brainrots-and-secrets-in-steal-a-brainrot-roblox/"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

print(f"Fetching {url}...")
response = requests.get(url, headers=headers, timeout=30)

soup = BeautifulSoup(response.content, 'html.parser')

# Save the HTML for inspection
with open('techwiser_debug.html', 'w', encoding='utf-8') as f:
    f.write(soup.prettify())

print("Saved to techwiser_debug.html")

# Find all tables
tables = soup.find_all('table')
print(f"\nFound {len(tables)} tables\n")

# Check first table structure
if tables:
    table = tables[0]
    print("="*50)
    print("FIRST TABLE STRUCTURE")
    print("="*50)
    
    # Get header
    header_row = table.find('tr')
    if header_row:
        headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
        print(f"Headers: {headers}")
    
    # Get first few data rows
    rows = table.find_all('tr')[1:4]
    print(f"\nFirst 3 data rows:")
    for i, row in enumerate(rows, 1):
        cells = row.find_all(['td', 'th'])
        cell_data = [cell.get_text(strip=True) for cell in cells]
        print(f"\nRow {i}:")
        for j, cell in enumerate(cell_data):
            header_name = headers[j] if j < len(headers) else f"Column {j}"
            print(f"  {header_name}: {cell}")

print("\n" + "="*50)
print("Check techwiser_debug.html for full page content")

