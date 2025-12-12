"""
Download Christmas Brainrot Thumbnails
Scrapes the wiki pages to find the correct image URLs
"""

import requests
from bs4 import BeautifulSoup
from pathlib import Path
import time

def scrape_thumbnail_from_wiki(wiki_url, brainrot_name):
    """Scrape the thumbnail image from a wiki page."""
    
    try:
        print(f"🔍 Scraping {brainrot_name} from wiki...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(wiki_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try multiple selectors for the main image
        image = None
        
        # Try infobox image first
        infobox_img = soup.select_one('.pi-image-thumbnail')
        if infobox_img:
            image = infobox_img.get('src')
        
        # Try article image
        if not image:
            article_img = soup.select_one('.mw-parser-output img')
            if article_img:
                image = article_img.get('src')
        
        # Try any image with the brainrot name
        if not image:
            all_imgs = soup.find_all('img')
            for img in all_imgs:
                src = img.get('src', '')
                if brainrot_name.replace(' ', '').lower() in src.lower():
                    image = src
                    break
        
        if image:
            # Clean up URL
            if image.startswith('//'):
                image = 'https:' + image
            elif image.startswith('/'):
                image = 'https://stealabrainrot.fandom.com' + image
            
            # Remove size parameters to get full resolution
            if '/revision/latest/scale-to-width-down/' in image:
                image = image.split('/revision/latest/scale-to-width-down/')[0] + '/revision/latest'
            
            print(f"✅ Found image URL: {image}")
            return image
        else:
            print(f"❌ Could not find image for {brainrot_name}")
            return None
            
    except Exception as e:
        print(f"❌ Error scraping {brainrot_name}: {e}")
        return None

def download_image(url, filename):
    """Download an image from URL."""
    
    try:
        print(f"📥 Downloading {filename}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        thumb_dir = Path("app/public/thumbnails")
        thumb_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = thumb_dir / filename
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded: {filename} ({len(response.content)} bytes)")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False

def main():
    """Download thumbnails for List List List Sahur and Please my Present."""
    
    brainrots = [
        {
            "name": "List List List Sahur",
            "wiki_url": "https://stealabrainrot.fandom.com/wiki/List_List_List_Sahur",
            "filename": "List_List_List_Sahur.png"
        },
        {
            "name": "Please my Present",
            "wiki_url": "https://stealabrainrot.fandom.com/wiki/Please_my_Present",
            "filename": "Please_my_Present.png"
        }
    ]
    
    print("🎄 Downloading Christmas Brainrot Thumbnails 🎄\n")
    print("=" * 60)
    
    success_count = 0
    
    for br in brainrots:
        print(f"\n📦 {br['name']}")
        print("-" * 60)
        
        # Check if already exists
        filepath = Path("app/public/thumbnails") / br['filename']
        if filepath.exists():
            print(f"⏭️  {br['filename']} already exists - skipping")
            success_count += 1
            continue
        
        # Scrape the image URL
        image_url = scrape_thumbnail_from_wiki(br['wiki_url'], br['name'])
        
        if image_url:
            # Download the image
            if download_image(image_url, br['filename']):
                success_count += 1
        
        # Be nice to the server
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print(f"\n✅ Complete! Successfully downloaded {success_count}/{len(brainrots)} thumbnails")

if __name__ == "__main__":
    main()

