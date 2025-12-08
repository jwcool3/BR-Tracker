#!/usr/bin/env python3
"""
Steal a Brainrot Thumbnail Scraper
Scrapes brainrot images from the wiki and saves them locally
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import time
from urllib.parse import urljoin

# Create directories
os.makedirs('thumbnails', exist_ok=True)
os.makedirs('data', exist_ok=True)

def scrape_wiki_thumbnails():
    """Scrape thumbnails from the Steal a Brainrot Wiki"""
    
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
    
    # Debug: Save HTML
    with open('debug_page.html', 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
    
    brainrots = []
    
    # The modern Fandom wiki uses img tags with class="mw-file-element" 
    # and stores the name in data-image-name attribute
    print("Searching for brainrot images...")
    
    # Find all images with mw-file-element class
    all_imgs = soup.find_all('img', class_='mw-file-element')
    print(f"Found {len(all_imgs)} mw-file-element images")
    
    for img in all_imgs:
        try:
            # Get name from data-image-name attribute (this is the best source)
            name = img.get('data-image-name')
            
            if not name:
                # Fallback to alt text if data-image-name is not present
                name = img.get('alt')
            
            if not name or name == 'Unknown':
                continue
            
            # Clean up name (remove file extension)
            name = name.replace('.png', '').replace('.jpg', '').replace('.jpeg', '').replace('.webp', '')
            
            # Get image URL from data-src (for lazy loaded) or src
            img_url = img.get('data-src') or img.get('src')
            
            if not img_url:
                continue
            
            # Skip data URIs (placeholder images)
            if img_url.startswith('data:'):
                continue
            
            # Clean up the image URL (get full resolution)
            if 'scale-to-width-down' in img_url:
                # Remove the scale-to-width-down parameter to get full resolution
                img_url = img_url.split('/scale-to-width-down')[0]
            
            # Skip if we already have this brainrot
            if any(b['name'] == name for b in brainrots):
                continue
            
            brainrots.append({
                'name': name,
                'image_url': img_url
            })
            
            print(f"Found: {name}")
            
        except Exception as e:
            print(f"Error parsing image: {e}")
            continue
    
    print(f"\nTotal brainrots found: {len(brainrots)}")
    return brainrots


def download_images(brainrots):
    """Download all brainrot images"""
    
    print("\nDownloading images...")
    
    for i, brainrot in enumerate(brainrots, 1):
        name = brainrot['name']
        url = brainrot['image_url']
        
        # Create safe filename
        safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_name = safe_name.replace(' ', '_')
        
        # Determine file extension
        ext = '.png'
        if '.jpg' in url or '.jpeg' in url:
            ext = '.jpg'
        elif '.webp' in url:
            ext = '.webp'
        
        filepath = f'thumbnails/{safe_name}{ext}'
        
        # Skip if already downloaded
        if os.path.exists(filepath):
            print(f"[{i}/{len(brainrots)}] Skipping {name} (already exists)")
            brainrot['local_path'] = filepath
            continue
        
        try:
            print(f"[{i}/{len(brainrots)}] Downloading {name}...")
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            brainrot['local_path'] = filepath
            
            # Be nice to the server
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error downloading {name}: {e}")
            brainrot['local_path'] = None


def save_metadata(brainrots):
    """Save brainrot metadata to JSON"""
    
    output_file = 'data/brainrot_thumbnails.json'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(brainrots, f, indent=2, ensure_ascii=False)
    
    print(f"\nMetadata saved to {output_file}")
    print(f"Successfully downloaded {sum(1 for b in brainrots if b.get('local_path'))} images")


if __name__ == "__main__":
    print("=== Steal a Brainrot Thumbnail Scraper ===\n")
    
    # Scrape wiki
    brainrots = scrape_wiki_thumbnails()
    
    if not brainrots:
        print("No brainrots found. The page structure may have changed.")
        exit(1)
    
    # Download images
    download_images(brainrots)
    
    # Save metadata
    save_metadata(brainrots)
    
    print("\nDone!")
