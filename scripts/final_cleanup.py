#!/usr/bin/env python3
"""
Final cleanup - remove duplicate files after reorganization
"""

import os
import shutil

def cleanup():
    """Remove duplicate files from root"""
    
    # Files to remove (now in proper locations)
    files_to_remove = [
        'scrape_thumbnails.py',        # → scripts/
        'fix_thumbnail_names.py',      # → scripts/
        'scrape_brainrot_data.py',     # → scripts/
        'update_brainrots_db.py',      # → scripts/
        'debug_techwiser.py',          # → scripts/
        'incomeCalculator.js',         # → src/
        'mutations_traits.json',       # → data/
        'thumbnail_corrections.json',  # → data/
        'PROJECT_SUMMARY.md',          # → docs/
        'QUICKSTART.md',               # → docs/
        'README (1).md',               # → docs/README.md
        'brainrots_final.json',        # → data/brainrots.json
    ]
    
    # Folders to remove (copied to proper locations)
    folders_to_remove = [
        'thumbnails',  # → public/thumbnails/
    ]
    
    print("="*50)
    print("FINAL CLEANUP")
    print("="*50 + "\n")
    
    print("Removing duplicate files...")
    for f in files_to_remove:
        if os.path.exists(f):
            os.remove(f)
            print(f"  ✓ Removed {f}")
    
    print("\nRemoving duplicate folders...")
    for folder in folders_to_remove:
        if os.path.exists(folder):
            shutil.rmtree(folder)
            print(f"  ✓ Removed {folder}/")
    
    # Keep reorganize script in scripts folder
    if os.path.exists('reorganize_project.py'):
        os.makedirs('scripts', exist_ok=True)
        shutil.move('reorganize_project.py', 'scripts/reorganize_project.py')
        print(f"  ✓ Moved reorganize_project.py → scripts/")
    
    print("\n" + "="*50)
    print("✅ CLEANUP COMPLETE!")
    print("="*50)
    print("\nProject is now clean and organized!")
    print("Run 'tree' or 'ls -R' to see the final structure.")

if __name__ == "__main__":
    cleanup()

