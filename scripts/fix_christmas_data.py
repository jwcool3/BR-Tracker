#!/usr/bin/env python3
"""
Download Christmas brainrot thumbnails and fix database values
"""

import requests
from bs4 import BeautifulSoup
import json
import os

def download_image(url, save_path):
    """Download image from URL"""
    try:
        # Get the page first to extract image
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"❌ Page error: {response.status_code}")
            return False
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find image in infobox
        img = soup.select_one('aside.portable-infobox img, .pi-image img, figure img')
        
        if not img:
            print(f"❌ No image found on page")
            return False
        
        img_src = img.get('src') or img.get('data-src')
        if not img_src:
            print(f"❌ No image source")
            return False
        
        # Get full resolution
        if '/revision/latest' in img_src:
            img_src = img_src.split('/revision/latest')[0] + '/revision/latest'
        
        print(f"  📥 Downloading from: {img_src[:80]}...")
        
        # Download image
        img_response = requests.get(img_src, timeout=10)
        if img_response.status_code == 200:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb') as f:
                f.write(img_response.content)
            print(f"  ✅ Saved to: {save_path}")
            return True
        else:
            print(f"  ❌ Image download failed: {img_response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("=" * 80)
    print("🎄 FIXING CHRISTMAS BRAINROT DATA")
    print("=" * 80)
    
    # Download thumbnails
    print("\n📥 Step 1: Downloading thumbnails...")
    
    downloads = [
        {
            'name': 'Reindeer Tralala',
            'url': 'https://stealabrainrot.fandom.com/wiki/Reindeer_Tralala',
            'filename': 'app/public/thumbnails/Reindeer_Tralala.png'
        },
        {
            'name': 'La Jolly Grande',
            'url': 'https://stealabrainrot.fandom.com/wiki/La_Jolly_Grande',
            'filename': 'app/public/thumbnails/La_Jolly_Grande.png'
        }
    ]
    
    for item in downloads:
        print(f"\n🔍 {item['name']}...")
        download_image(item['url'], item['filename'])
    
    # Fix database values
    print("\n" + "=" * 80)
    print("📝 Step 2: Fixing database values...")
    print("=" * 80)
    
    # Load database
    with open('app/public/brainrots.json', 'r', encoding='utf-8') as f:
        brainrots = json.load(f)
    
    updates = [
        {
            'name': 'Reindeer Tralala',
            'cost': 160000000,  # $160M
            'income_per_second': 600000,  # $600K/s
            'image': 'thumbnails/Reindeer_Tralala.png'
        },
        {
            'name': 'La Jolly Grande',
            'cost': 3500000000,  # $3.5B
            'income_per_second': 30000000,  # $30M/s
            'image': 'thumbnails/La_Jolly_Grande.png'
        }
    ]
    
    updated_count = 0
    for update in updates:
        for br in brainrots:
            if br['name'] == update['name']:
                old_income = br.get('income_per_second', 0)
                old_cost = br.get('cost', 0)
                
                br['income_per_second'] = update['income_per_second']
                br['cost'] = update['cost']
                br['image'] = update['image']
                
                print(f"\n✅ Updated: {update['name']}")
                if old_income != update['income_per_second']:
                    print(f"   Income: ${old_income:,}/s → ${update['income_per_second']:,}/s")
                if old_cost != update['cost']:
                    print(f"   Cost: ${old_cost:,} → ${update['cost']:,}")
                
                updated_count += 1
                break
    
    # Save updated database
    with open('app/public/brainrots.json', 'w', encoding='utf-8') as f:
        json.dump(brainrots, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"✅ Updated {updated_count} brainrots in database")
    print("💾 Saved to app/public/brainrots.json")
    print("=" * 80)
    
    print("\n🎯 Next steps:")
    print("  1. Refresh your browser")
    print("  2. Test floor scanner again")
    print("  3. Income mismatch warnings should be gone!")

if __name__ == '__main__':
    main()

