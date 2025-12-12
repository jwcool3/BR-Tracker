#!/usr/bin/env python3
"""
Download missing thumbnails from the Steal a Brainrot wiki
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import time
from urllib.parse import unquote

def load_missing_report():
    """Load the missing thumbnails report"""
    with open('data/missing_thumbnails_report.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_name_for_wiki(name):
    """Normalize brainrot name for wiki URL"""
    # Remove (Lucky Block) suffix
    name = name.replace('(Lucky Block)', '').strip()
    name = name.replace(' (Lucky Block)', '').strip()
    
    # Replace spaces with underscores
    name = name.replace(' ', '_')
    
    return name

def search_wiki_for_image(brainrot_name):
    """Search wiki for brainrot and get image URL"""
    normalized_name = normalize_name_for_wiki(brainrot_name)
    url = f'https://stealabrainrot.fandom.com/wiki/{normalized_name}'
    
    print(f"  🔍 Searching: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 404:
            print(f"     ❌ Page not found (404)")
            return None
        
        if response.status_code != 200:
            print(f"     ❌ Error: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the main brainrot image (usually in an infobox or at the top)
        # Try multiple selectors
        image_selectors = [
            'aside.portable-infobox img',  # Infobox image
            '.pi-image img',  # Infobox image variant
            '.image img',  # Generic image
            'figure img',  # Figure image
            'a.image img',  # Link image
        ]
        
        for selector in image_selectors:
            img = soup.select_one(selector)
            if img:
                img_src = img.get('src') or img.get('data-src')
                if img_src and not img_src.endswith('.svg'):
                    # Get the full resolution image (remove size parameters)
                    if '/revision/latest' in img_src:
                        img_src = img_src.split('/revision/latest')[0] + '/revision/latest'
                    
                    print(f"     ✅ Found image: {img_src[:80]}...")
                    return img_src
        
        print(f"     ❌ No image found on page")
        return None
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        return None

def download_image(image_url, save_path):
    """Download image from URL"""
    try:
        response = requests.get(image_url, timeout=10)
        
        if response.status_code == 200:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            print(f"     💾 Saved to: {save_path}")
            return True
        else:
            print(f"     ❌ Download failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"     ❌ Download error: {e}")
        return False

def try_alternative_names(brainrot_name):
    """Try alternative name variations"""
    alternatives = []
    
    # Remove (Lucky Block)
    clean_name = brainrot_name.replace('(Lucky Block)', '').strip()
    alternatives.append(clean_name)
    
    # Try without special characters
    simple_name = clean_name.replace(' and ', '_and_')
    alternatives.append(simple_name)
    
    # Try with different capitalizations
    alternatives.append(clean_name.title())
    alternatives.append(clean_name.lower())
    
    return list(set(alternatives))

def main():
    print("=" * 80)
    print("🖼️  DOWNLOADING MISSING THUMBNAILS FROM WIKI")
    print("=" * 80)
    
    # Load missing thumbnails report
    print("\n📖 Loading missing thumbnails report...")
    report = load_missing_report()
    missing = report['missing_list']
    
    print(f"   Found {len(missing)} brainrots without thumbnails")
    
    # Download each
    results = {
        'found': [],
        'not_found': [],
        'download_failed': []
    }
    
    for i, brainrot in enumerate(missing, 1):
        name = brainrot['name']
        print(f"\n[{i}/{len(missing)}] 🔍 Searching for: {name}")
        
        # Try main name first
        image_url = search_wiki_for_image(name)
        
        # If not found, try alternatives
        if not image_url:
            print(f"  🔄 Trying alternative names...")
            alternatives = try_alternative_names(name)
            
            for alt_name in alternatives:
                if alt_name != name:
                    print(f"     Trying: {alt_name}")
                    image_url = search_wiki_for_image(alt_name)
                    if image_url:
                        break
        
        if image_url:
            # Download the image
            clean_name = name.replace('(Lucky Block)', '').strip()
            filename = clean_name.replace(' ', '_') + '.png'
            save_path = f'app/public/thumbnails/{filename}'
            
            if download_image(image_url, save_path):
                results['found'].append({
                    'name': name,
                    'filename': filename,
                    'url': image_url
                })
            else:
                results['download_failed'].append({
                    'name': name,
                    'url': image_url
                })
        else:
            results['not_found'].append(name)
        
        # Be nice to the server
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 DOWNLOAD SUMMARY")
    print("=" * 80)
    
    print(f"\n✅ Successfully downloaded: {len(results['found'])}")
    for item in results['found']:
        print(f"   • {item['name']} → {item['filename']}")
    
    print(f"\n❌ Not found on wiki: {len(results['not_found'])}")
    for name in results['not_found']:
        print(f"   • {name}")
    
    print(f"\n⚠️  Download failed: {len(results['download_failed'])}")
    for item in results['download_failed']:
        print(f"   • {item['name']}")
    
    # Save results
    with open('data/thumbnail_download_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\n📄 Full results saved to: data/thumbnail_download_results.json")
    
    print("\n" + "=" * 80)
    print(f"✅ Done! Downloaded {len(results['found'])}/{len(missing)} thumbnails")
    print("=" * 80)

if __name__ == '__main__':
    main()

