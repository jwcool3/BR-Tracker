#!/usr/bin/env python3
"""
Explore the Steal a Brainrot wiki to find all categories and brainrot pages
"""

import requests
from bs4 import BeautifulSoup
import json
import time

def get_wiki_categories():
    """Get all categories from the wiki"""
    print("🔍 Finding all wiki categories...")
    
    categories = [
        'Brainrots',
        'Secret_Brainrots',
        'Brainrot_God',
        'OG_Brainrots',
        'Mythic_Brainrots',
        'Legendary_Brainrots',
        'Epic_Brainrots',
        'Rare_Brainrots',
        'Common_Brainrots',
        'Halloween',
        'Christmas',
        'Limited_Brainrots',
        'Event_Brainrots',
        'Machines'
    ]
    
    return categories

def explore_category(category_name):
    """Explore a specific category and list all pages"""
    url = f'https://stealabrainrot.fandom.com/wiki/Category:{category_name}'
    print(f"\n📂 Exploring: {category_name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url)
        if response.status_code == 404:
            print(f"   ❌ Category not found (404)")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all category member links
        members = soup.select('.category-page__member-link')
        
        pages = []
        for member in members:
            title = member.get('title', '').strip()
            if title and not title.startswith('Category:'):
                pages.append(title)
        
        print(f"   ✅ Found {len(pages)} pages")
        return pages
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return []

def check_special_pages():
    """Check special event pages"""
    special_pages = [
        "Santa's_Fuse",
        "Witch_Fuse",
        "Fuse_Machine",
        "Halloween_Event",
        "Christmas_Event",
        "Taco_Tuesday",
        "Admin_Abuse",
        "Extinct_Event",
        "Upcoming_Features/Brainrots",
        "Limited_Quantity_Truck"
    ]
    
    print("\n" + "=" * 80)
    print("🎯 CHECKING SPECIAL EVENT PAGES")
    print("=" * 80)
    
    found_pages = []
    
    for page in special_pages:
        url = f'https://stealabrainrot.fandom.com/wiki/{page}'
        print(f"\n🔍 Checking: {page}")
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"   ✅ Found! {url}")
                found_pages.append({
                    'name': page,
                    'url': url,
                    'status': 200
                })
            else:
                print(f"   ❌ Not found ({response.status_code})")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(0.5)  # Be nice to the server
    
    return found_pages

def main():
    print("=" * 80)
    print("🔍 EXPLORING STEAL A BRAINROT WIKI")
    print("=" * 80)
    
    all_brainrot_pages = set()
    
    # Explore categories
    categories = get_wiki_categories()
    
    for category in categories:
        pages = explore_category(category)
        all_brainrot_pages.update(pages)
        time.sleep(0.5)  # Be nice to the server
    
    # Check special pages
    special_pages = check_special_pages()
    
    # Save results
    print("\n" + "=" * 80)
    print("💾 SAVING RESULTS")
    print("=" * 80)
    
    results = {
        'total_brainrots': len(all_brainrot_pages),
        'brainrot_pages': sorted(list(all_brainrot_pages)),
        'special_event_pages': special_pages,
        'categories_checked': categories
    }
    
    with open('data/wiki_exploration_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Found {len(all_brainrot_pages)} unique brainrot pages!")
    print(f"✅ Found {len(special_pages)} special event pages!")
    print("\n📄 Results saved to: data/wiki_exploration_results.json")
    
    # Print summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"\nTotal unique brainrot pages: {len(all_brainrot_pages)}")
    print(f"Special event pages found: {len(special_pages)}")
    
    print("\n🎯 Special Pages Found:")
    for page in special_pages:
        print(f"  • {page['name']}")
    
    print("\n💡 Next Steps:")
    print("  1. Compare these with your current database (328 brainrots)")
    print("  2. Scrape any special event pages that were found")
    print("  3. Update database with missing brainrots")

if __name__ == '__main__':
    main()

