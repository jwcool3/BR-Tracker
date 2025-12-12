"""
Scrape Missing Thumbnails
Downloads thumbnails for all brainrots that don't have images yet
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import time
import re

def normalize_wiki_name(name):
    """Convert brainrot name to wiki URL format"""
    # Replace spaces with underscores
    wiki_name = name.replace(' ', '_')
    # Handle special characters
    wiki_name = wiki_name.replace("'", "%27")
    return wiki_name

def download_image(url, save_path):
    """Download image from URL and save to path"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"      Error downloading: {e}")
        return False

def scrape_single_thumbnail(name, br_id, name_corrections):
    """Scrape thumbnail for a single brainrot"""
    
    # Check if there's a name correction
    corrected_name = name_corrections.get(name, name)
    wiki_name = normalize_wiki_name(corrected_name)
    
    url = f"https://stealabrainrot.fandom.com/wiki/{wiki_name}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        # Fetch page
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 404:
            return None, "404 Not Found"
        
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find image in infobox
        infobox = soup.find('aside', class_='portable-infobox')
        if infobox:
            # Look for the main image
            img = infobox.find('img', class_='pi-image-thumbnail')
            if not img:
                img = infobox.find('img')
            
            if img:
                image_url = img.get('data-src') or img.get('src')
                
                if image_url:
                    # Clean URL (remove size parameters)
                    if '/revision/' in image_url:
                        image_url = image_url.split('/revision/')[0] + '/revision/latest'
                    
                    # Generate filename
                    filename = f"{br_id}.png"
                    save_path = f"app/public/thumbnails/{filename}"
                    
                    # Download
                    if download_image(image_url, save_path):
                        return f"thumbnails/{filename}", "Success"
                    else:
                        return None, "Download failed"
        
        return None, "No image found in infobox"
        
    except requests.exceptions.Timeout:
        return None, "Timeout"
    except requests.exceptions.RequestException as e:
        return None, f"Request error: {str(e)}"
    except Exception as e:
        return None, f"Error: {str(e)}"

def scrape_missing_thumbnails():
    print("=" * 80)
    print("🖼️  MISSING THUMBNAILS SCRAPER")
    print("=" * 80)
    
    # Load missing report
    with open('data/missing_thumbnails_report.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    missing = report['missing_list']
    total = len(missing)
    
    print(f"\n📊 Found {total} brainrots missing thumbnails")
    print(f"🎯 Starting batch scrape...\n")
    
    # Load name corrections
    try:
        with open('data/wiki_name_corrections.json', 'r', encoding='utf-8') as f:
            name_corrections = json.load(f)
    except:
        name_corrections = {}
    
    # Load current brainrots
    with open('data/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    if not isinstance(brainrots, list):
        brainrots = brainrots.get('brainrots', [])
    
    # Track results
    successful = []
    failed = []
    
    # Process each missing brainrot
    for idx, item in enumerate(missing, 1):
        name = item['name']
        br_id = item['id']
        rarity = item['rarity']
        
        print(f"[{idx}/{total}] {name} ({rarity})")
        print(f"    Fetching from wiki...")
        
        # Scrape
        image_path, status = scrape_single_thumbnail(name, br_id, name_corrections)
        
        if image_path:
            # Success! Update brainrot
            for br in brainrots:
                if br.get('id') == br_id:
                    br['image'] = image_path
                    break
            
            successful.append({
                'name': name,
                'id': br_id,
                'image': image_path,
                'status': status
            })
            print(f"    ✅ {status} - Saved to {image_path}")
        else:
            failed.append({
                'name': name,
                'id': br_id,
                'status': status
            })
            print(f"    ❌ {status}")
        
        # Rate limiting (be nice to wiki)
        if idx < total:
            time.sleep(2)  # 2 second delay between requests
    
    # Save results
    print("\n" + "=" * 80)
    print("📊 SCRAPING COMPLETE")
    print("=" * 80)
    print(f"\n✅ Successful: {len(successful)} ({len(successful)/total*100:.1f}%)")
    print(f"❌ Failed: {len(failed)} ({len(failed)/total*100:.1f}%)")
    
    # Save successful
    with open('data/thumbnails_SUCCESS.json', 'w', encoding='utf-8') as f:
        json.dump({
            'count': len(successful),
            'thumbnails': successful
        }, f, indent=2, ensure_ascii=False)
    print(f"\n📄 Success log: data/thumbnails_SUCCESS.json")
    
    # Save failed
    if failed:
        with open('data/thumbnails_FAILED.json', 'w', encoding='utf-8') as f:
            json.dump({
                'count': len(failed),
                'thumbnails': failed,
                'note': 'These need manual correction or download'
            }, f, indent=2, ensure_ascii=False)
        print(f"📄 Failed log: data/thumbnails_FAILED.json")
        
        print(f"\n⚠️  Failed brainrots:")
        for fail in failed[:10]:
            print(f"  - {fail['name']}: {fail['status']}")
        if len(failed) > 10:
            print(f"  ... and {len(failed) - 10} more")
    
    # Update database if any successful
    if successful:
        import shutil
        
        # Backup
        shutil.copy('data/brainrots.json', 'data/brainrots_before_thumbnails.json')
        print(f"\n💾 Backed up to: data/brainrots_before_thumbnails.json")
        
        # Save updated brainrots
        with open('data/brainrots.json', 'w', encoding='utf-8') as f:
            json.dump(brainrots, f, indent=2, ensure_ascii=False)
        print(f"✅ Updated: data/brainrots.json")
        
        # Copy to app/public
        shutil.copy('data/brainrots.json', 'app/public/brainrots.json')
        print(f"✅ Updated: app/public/brainrots.json")
        
        # Check new coverage
        total_brainrots = len(brainrots)
        with_images = sum(1 for br in brainrots if br.get('image'))
        coverage = with_images / total_brainrots * 100
        
        print(f"\n📊 NEW COVERAGE:")
        print(f"    Before: 217/320 (67.8%)")
        print(f"    After:  {with_images}/{total_brainrots} ({coverage:.1f}%)")
        print(f"    Improvement: +{len(successful)} images (+{len(successful)/total_brainrots*100:.1f}%)")
    
    print("\n" + "=" * 80)
    print("✅ Scraping session complete!")
    print("=" * 80 + "\n")
    
    return successful, failed

if __name__ == '__main__':
    scrape_missing_thumbnails()

