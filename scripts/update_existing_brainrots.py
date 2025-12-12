"""
Update Existing Brainrots Database
- Checks for missing thumbnails
- Downloads missing thumbnails from wiki
- Compares existing thumbnails with wiki versions
- Optionally updates brainrot data (income, cost, rarity)
"""

import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import time
import re
import hashlib
from PIL import Image
import io

class BrainrotUpdater:
    def __init__(self):
        self.db_path = Path("app/public/brainrots.json")
        self.thumb_dir = Path("app/public/thumbnails")
        self.thumb_dir.mkdir(parents=True, exist_ok=True)
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        self.stats = {
            'total': 0,
            'thumbnails_missing': 0,
            'thumbnails_downloaded': 0,
            'thumbnails_failed': 0,
            'thumbnails_compared': 0,
            'thumbnails_different': 0,
            'thumbnails_updated': 0,
            'data_updated': 0,
            'wiki_not_found': 0
        }
    
    def load_database(self):
        """Load the brainrots database."""
        with open(self.db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_database(self, brainrots):
        """Save the updated database."""
        # Sort by income
        brainrots.sort(key=lambda x: x.get('income_per_second') or 0)
        
        with open(self.db_path, 'w', encoding='utf-8') as f:
            json.dump(brainrots, f, indent=2, ensure_ascii=False)
        
        print("💾 Database saved!")
    
    def name_to_wiki_url(self, name):
        """Convert brainrot name to wiki URL."""
        # Replace spaces with underscores
        wiki_name = name.replace(' ', '_')
        return f"https://stealabrainrot.fandom.com/wiki/{wiki_name}"
    
    def check_thumbnail_exists(self, image_path):
        """Check if thumbnail file exists."""
        if not image_path:
            return False
        filepath = Path("app/public") / image_path
        return filepath.exists()
    
    def scrape_brainrot_data(self, name):
        """Scrape brainrot data from wiki."""
        wiki_url = self.name_to_wiki_url(name)
        
        try:
            response = requests.get(wiki_url, headers=self.headers, timeout=10)
            
            if response.status_code == 404:
                return None
            
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            data = {
                'name': name,
                'wiki_url': wiki_url
            }
            
            # Find thumbnail image
            image = None
            infobox_img = soup.select_one('.pi-image-thumbnail')
            if infobox_img:
                image = infobox_img.get('src')
            
            if not image:
                article_img = soup.select_one('.mw-parser-output img')
                if article_img:
                    image = article_img.get('src')
            
            if image:
                if image.startswith('//'):
                    image = 'https:' + image
                elif image.startswith('/'):
                    image = 'https://stealabrainrot.fandom.com' + image
                
                # Remove size parameters
                if '/revision/latest/scale-to-width-down/' in image:
                    image = image.split('/revision/latest/scale-to-width-down/')[0] + '/revision/latest'
                
                data['image_url'] = image
            
            # Find income and cost in infobox
            infobox_data = soup.select('.pi-data-value')
            for item in infobox_data:
                text = item.get_text(strip=True)
                
                # Income (e.g., "$2M/s", "$500K/s")
                if '/s' in text:
                    income_str = text.replace('$', '').replace('/s', '').strip()
                    income = self.parse_income_string(income_str)
                    if income:
                        data['income_per_second'] = income
                
                # Cost (e.g., "$550M", "$10K")
                elif '$' in text and '/s' not in text:
                    cost_str = text.replace('$', '').strip()
                    cost = self.parse_income_string(cost_str)
                    if cost:
                        data['cost'] = cost
            
            # Find rarity
            rarity_elem = soup.find(string=re.compile(r'Secret|Brainrot God|OG|Legendary|Mythic|Epic|Rare|Common'))
            if rarity_elem:
                rarity = rarity_elem.strip().lower().replace(' ', '_')
                data['rarity'] = rarity
            
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"  ⚠️  Error accessing wiki: {e}")
            return None
    
    def parse_income_string(self, s):
        """Parse income string like '2M', '500K', '1.5B' to number."""
        s = s.strip().upper()
        
        try:
            if 'B' in s:
                return int(float(s.replace('B', '')) * 1_000_000_000)
            elif 'M' in s:
                return int(float(s.replace('M', '')) * 1_000_000)
            elif 'K' in s:
                return int(float(s.replace('K', '')) * 1_000)
            else:
                return int(float(s))
        except:
            return None
    
    def get_image_hash(self, image_data):
        """Get perceptual hash of image for comparison."""
        try:
            img = Image.open(io.BytesIO(image_data))
            # Convert to RGB and resize to standard size for comparison
            img = img.convert('RGB').resize((64, 64), Image.Resampling.LANCZOS)
            return hashlib.md5(img.tobytes()).hexdigest()
        except Exception as e:
            return None
    
    def compare_images(self, local_path, wiki_url):
        """Compare local thumbnail with wiki version."""
        try:
            # Read local image
            with open(local_path, 'rb') as f:
                local_data = f.read()
            local_hash = self.get_image_hash(local_data)
            local_size = len(local_data)
            
            # Download wiki image
            response = requests.get(wiki_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            wiki_data = response.content
            wiki_hash = self.get_image_hash(wiki_data)
            wiki_size = len(wiki_data)
            
            # Compare
            is_same = (local_hash == wiki_hash)
            size_diff = abs(local_size - wiki_size)
            size_diff_pct = (size_diff / local_size * 100) if local_size > 0 else 0
            
            return {
                'is_same': is_same,
                'local_size': local_size,
                'wiki_size': wiki_size,
                'size_diff': size_diff,
                'size_diff_pct': size_diff_pct,
                'wiki_data': wiki_data if not is_same else None
            }
        except Exception as e:
            print(f"  ⚠️  Comparison failed: {e}")
            return None
    
    def download_thumbnail(self, image_url, filename):
        """Download thumbnail image."""
        try:
            response = requests.get(image_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            filepath = self.thumb_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return True
        except Exception as e:
            print(f"  ❌ Download failed: {e}")
            return False
    
    def update_brainrot(self, brainrot, update_data=True, compare_thumbnails=False):
        """Update a single brainrot (thumbnail and optionally data)."""
        name = brainrot['name']
        print(f"\n📦 {name}")
        print("-" * 60)
        
        # Check if thumbnail exists
        has_thumbnail = self.check_thumbnail_exists(brainrot.get('image'))
        
        if not has_thumbnail:
            print("  ❌ Thumbnail missing - scraping wiki...")
            self.stats['thumbnails_missing'] += 1
        elif compare_thumbnails:
            print("  ✅ Thumbnail exists - will compare with wiki")
        else:
            print("  ✅ Thumbnail exists")
            return False
        
        # Scrape wiki
        wiki_data = self.scrape_brainrot_data(name)
        
        if not wiki_data:
            print("  ⚠️  Wiki page not found")
            self.stats['wiki_not_found'] += 1
            self.stats['thumbnails_failed'] += 1
            return False
        
        updated = False
        
        # Handle thumbnail
        if 'image_url' in wiki_data:
            filename = name.replace(' ', '_') + '.png'
            filepath = self.thumb_dir / filename
            
            # If thumbnail exists and we're comparing
            if has_thumbnail and compare_thumbnails:
                print(f"  🔍 Comparing with wiki version...")
                self.stats['thumbnails_compared'] += 1
                
                comparison = self.compare_images(filepath, wiki_data['image_url'])
                
                if comparison:
                    if comparison['is_same']:
                        print(f"  ✅ Thumbnail matches wiki (identical)")
                    else:
                        print(f"  ⚠️  Thumbnail DIFFERENT from wiki!")
                        print(f"      Local:  {comparison['local_size']:,} bytes")
                        print(f"      Wiki:   {comparison['wiki_size']:,} bytes")
                        print(f"      Diff:   {comparison['size_diff_pct']:.1f}%")
                        self.stats['thumbnails_different'] += 1
                        
                        # Update with wiki version
                        if comparison['wiki_data']:
                            with open(filepath, 'wb') as f:
                                f.write(comparison['wiki_data'])
                            print(f"  ✅ Updated with wiki version")
                            self.stats['thumbnails_updated'] += 1
                            updated = True
            
            # If thumbnail missing, download it
            elif not has_thumbnail:
                print(f"  📥 Downloading thumbnail...")
                if self.download_thumbnail(wiki_data['image_url'], filename):
                    print(f"  ✅ Downloaded: {filename}")
                    brainrot['image'] = f"thumbnails/{filename}"
                    self.stats['thumbnails_downloaded'] += 1
                    updated = True
                else:
                    self.stats['thumbnails_failed'] += 1
        else:
            if not has_thumbnail:
                print("  ⚠️  No image found on wiki")
                self.stats['thumbnails_failed'] += 1
        
        # Update data if requested
        if update_data:
            data_updated = False
            
            if 'income_per_second' in wiki_data:
                old_income = brainrot.get('income_per_second', 0)
                new_income = wiki_data['income_per_second']
                if old_income != new_income:
                    print(f"  📊 Income: ${old_income:,}/s → ${new_income:,}/s")
                    brainrot['income_per_second'] = new_income
                    brainrot['base_income'] = new_income
                    data_updated = True
            
            if 'cost' in wiki_data:
                old_cost = brainrot.get('cost', 0)
                new_cost = wiki_data['cost']
                if old_cost != new_cost:
                    print(f"  💰 Cost: ${old_cost:,} → ${new_cost:,}")
                    brainrot['cost'] = new_cost
                    data_updated = True
            
            if 'rarity' in wiki_data:
                old_rarity = brainrot.get('rarity', '')
                new_rarity = wiki_data['rarity']
                if old_rarity != new_rarity:
                    print(f"  ⭐ Rarity: {old_rarity} → {new_rarity}")
                    brainrot['rarity'] = new_rarity
                    data_updated = True
            
            if data_updated:
                self.stats['data_updated'] += 1
                updated = True
        
        return updated
    
    def update_all(self, update_data=True, compare_thumbnails=False, save_every=10):
        """Update all brainrots in the database."""
        print("🔄 Loading database...")
        brainrots = self.load_database()
        self.stats['total'] = len(brainrots)
        
        print(f"📊 Found {len(brainrots)} brainrots\n")
        print("=" * 60)
        
        any_updated = False
        update_count = 0
        
        for i, brainrot in enumerate(brainrots, 1):
            if self.update_brainrot(brainrot, update_data, compare_thumbnails):
                any_updated = True
                update_count += 1
                
                # Save periodically
                if update_count % save_every == 0:
                    print("\n💾 Saving progress...")
                    self.save_database(brainrots)
            
            # Be nice to the server
            time.sleep(0.5)
            
            # Progress indicator
            if i % 20 == 0:
                print(f"\n📊 Progress: {i}/{len(brainrots)}")
        
        # Final save
        if any_updated:
            print("\n" + "=" * 60)
            print("\n💾 Saving final changes...")
            self.save_database(brainrots)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print summary of updates."""
        print("\n" + "=" * 60)
        print("\n📊 SUMMARY")
        print("=" * 60)
        print(f"Total brainrots:       {self.stats['total']}")
        print(f"Missing thumbnails:    {self.stats['thumbnails_missing']}")
        print(f"Thumbnails downloaded: {self.stats['thumbnails_downloaded']}")
        print(f"Thumbnails compared:   {self.stats['thumbnails_compared']}")
        print(f"Thumbnails different:  {self.stats['thumbnails_different']}")
        print(f"Thumbnails updated:    {self.stats['thumbnails_updated']}")
        print(f"Download failures:     {self.stats['thumbnails_failed']}")
        print(f"Data updated:          {self.stats['data_updated']}")
        print(f"Wiki not found:        {self.stats['wiki_not_found']}")
        print("=" * 60)

def main():
    """Main function."""
    import sys
    
    print("🔄 Brainrot Database Updater 🔄\n")
    
    # Parse arguments
    update_data = '--update-data' in sys.argv or '-u' in sys.argv
    compare_thumbnails = '--compare' in sys.argv or '-c' in sys.argv
    
    # Display mode
    modes = []
    if compare_thumbnails:
        modes.append("Compare existing thumbnails with wiki")
    else:
        modes.append("Download missing thumbnails")
    
    if update_data:
        modes.append("Update brainrot data (income, cost, rarity)")
    
    print("📊 Mode:")
    for mode in modes:
        print(f"   ✅ {mode}")
    
    if not compare_thumbnails:
        print("\n   💡 Use --compare or -c to compare existing thumbnails with wiki")
    if not update_data:
        print("   💡 Use --update-data or -u to also update brainrot data")
    
    print("\n" + "=" * 60)
    
    # Create updater and run
    updater = BrainrotUpdater()
    updater.update_all(update_data=update_data, compare_thumbnails=compare_thumbnails)
    
    print("\n✅ Complete!")

if __name__ == "__main__":
    main()

