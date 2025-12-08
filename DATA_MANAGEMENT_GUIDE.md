# 💾 Data Management Guide

## Overview

Your Brainrot Tracker data is **automatically saved** to your browser's localStorage, but we've added powerful export/import features for:
- 📤 Backing up your data
- 🔄 Transferring between browsers/computers
- 👥 Sharing account setups with friends
- 🛡️ Protection against data loss

---

## 🎯 Features

### **1. Auto-Save (Always On)**
- ✅ Data saves automatically after every change
- ✅ Survives page refresh
- ✅ No action needed from you
- ⚠️ Only available in current browser

### **2. Export to File**
- 💾 Download your data as a JSON file
- 📅 Includes export date for tracking
- 📊 Contains all accounts and collections
- ✅ Perfect for backups

### **3. Import from File**
- 📥 Restore from a backup file
- ⚠️ Replaces ALL current data
- ✅ Validates file before importing
- 🔒 Confirmation required

### **4. Clear All Data**
- 🗑️ Delete everything
- ⚠️ Requires double confirmation
- 💥 Cannot be undone
- 🔒 Safety mechanism included

---

## 📖 How to Use

### **Accessing Data Management**

Look for the **"Data"** button in the top-right corner of the header:

```
🎮 Brainrot Tracker    Dashboard    📊 Total Collection    [💾 Data]
                                                            ↑ Click here!
```

This opens the Data Management modal with all options.

---

## 💾 Exporting Your Data

### **When to Export:**
- ✅ Before clearing browser data
- ✅ When switching computers
- ✅ As a regular backup (weekly/monthly)
- ✅ Before major changes
- ✅ To share with friends

### **Steps:**
1. Click the **"Data"** button in header
2. Click **"Export Data"** (blue button)
3. File downloads automatically
4. Filename: `brainrot-tracker-backup-2025-12-08.json`

### **What's Included:**
```json
{
  "version": "1.0.0",
  "exportDate": "2025-12-08T15:30:00.000Z",
  "accounts": [...],      // All your accounts
  "collections": {...},   // All brainrots per account
  "metadata": {
    "totalAccounts": 5,
    "totalBrainrots": 67
  }
}
```

### **File Size:**
- Empty: ~500 bytes
- 10 accounts with brainrots: ~5-10 KB
- 50 accounts with brainrots: ~20-50 KB

**→ Very small files, easy to share!**

---

## 📥 Importing Data

### **When to Import:**
- ✅ Restoring from backup
- ✅ Switching computers/browsers
- ✅ Using a friend's setup
- ✅ After clearing data by mistake

### **Steps:**
1. Click the **"Data"** button in header
2. Click **"Import Data"** (green button)
3. Select your backup `.json` file
4. Review the confirmation dialog:
   ```
   Import 5 accounts with 67 total brainrots?
   
   This will REPLACE your current data.
   
   Backup exported: 12/8/2025, 3:30 PM
   ```
5. Click **OK** to confirm
6. See success message: "✅ Data imported successfully!"

### **⚠️ Important:**
- **REPLACES** all current data (not merge)
- Make sure you have the right file
- Export current data first if you want to keep it
- Cannot be undone (but you can re-import old backup)

---

## 🗑️ Clearing All Data

### **When to Clear:**
- ✅ Starting fresh
- ✅ Testing the app
- ✅ Before importing new data
- ⚠️ Only if you're sure!

### **Steps:**
1. Click the **"Data"** button in header
2. Click **"Clear All Data"** (red button, half transparent)
3. Button pulses red: **"Click Again to Confirm"**
4. Click again to confirm
5. All data deleted
6. See message: "🗑️ All data cleared!"

### **Safety Features:**
- ❌ Cannot be undone
- 🔒 Requires TWO clicks (prevent accidents)
- ⚠️ Warning messages
- 🔴 Red pulsing button
- ⏰ Confirmation timeout (closes modal if you wait)

---

## 💡 Best Practices

### **Backup Strategy:**
```
📅 Weekly: Export backup before major changes
📅 Monthly: Export and save to cloud storage
📅 Before Updates: Export before browser/app updates
```

### **File Organization:**
```
backups/
├── brainrot-tracker-backup-2025-12-01.json  (Monthly)
├── brainrot-tracker-backup-2025-12-08.json  (Weekly)
└── brainrot-tracker-backup-2025-12-15.json  (Latest)
```

### **Sharing with Friends:**
```
1. Export your data
2. Send the .json file (email, Discord, etc.)
3. They click Import
4. They now have your exact setup!
```

### **Multiple Setups:**
```
brainrot-main.json      (Your main accounts)
brainrot-storage.json   (Storage-only accounts)
brainrot-grind.json     (Grinding accounts)
```
Load different setups as needed!

---

## 🛡️ Data Safety

### **Where is Data Stored?**

**LocalStorage (Default):**
- Location: Browser's localStorage
- Persistence: Until you clear browser data
- Size Limit: ~5-10 MB (plenty for this app)
- Scope: Current browser only

**Export Files (Backup):**
- Location: Your computer
- Persistence: Forever (until you delete)
- Size: Small (~10-50 KB)
- Scope: Portable, shareable

### **What Happens If...**

**Q: I clear browser cache?**
- ❌ LocalStorage data is LOST
- ✅ Import from backup file

**Q: I switch browsers?**
- ❌ Data doesn't transfer
- ✅ Export from old, import to new

**Q: I clear browser data?**
- ❌ LocalStorage data is LOST
- ✅ Import from backup file

**Q: I reinstall my OS?**
- ❌ Everything is lost
- ✅ Import from backup (if you exported)

**Q: I accidentally click Clear All Data?**
- ❌ Data is gone (but requires 2 clicks)
- ✅ Import from backup file

**→ ALWAYS keep recent export files!**

---

## 🔧 Troubleshooting

### **Export Not Working?**

**Problem:** Export button doesn't download file

**Solutions:**
1. Check browser permissions (allow downloads)
2. Check popup blocker
3. Try different browser
4. Open console (F12) for errors

### **Import Not Working?**

**Problem:** "Invalid backup file format"

**Causes:**
- File is corrupted
- Wrong file selected
- File from different app
- Manual editing broke JSON

**Solutions:**
1. Re-download original export
2. Validate JSON structure
3. Try older backup
4. Create new data and export

### **Data Not Saving?**

**Problem:** Changes disappear after refresh

**Causes:**
- LocalStorage disabled
- Browser in Incognito/Private mode
- Storage quota exceeded
- Browser extension blocking

**Solutions:**
1. Exit private/incognito mode
2. Enable localStorage in browser settings
3. Clear old localStorage data
4. Disable interfering extensions
5. Export immediately after changes

---

## 📊 Data Structure

### **Export File Format:**

```json
{
  "version": "1.0.0",
  "exportDate": "2025-12-08T20:00:00.000Z",
  "accounts": [
    {
      "id": "acc-1733688000000",
      "name": "Main Account",
      "rebirthLevel": 10,
      "notes": "Primary account",
      "tags": ["main", "grinding"],
      "color": "#3b82f6",
      "favorite": true,
      "hidden": false,
      "createdAt": "2025-12-08T20:00:00.000Z"
    }
  ],
  "collections": {
    "acc-1733688000000": [
      {
        "brainrotId": "strawberry-elephant",
        "mutation": "rainbow",
        "traits": ["zombie", "firework"],
        "floor": 5,
        "calculatedIncome": 55000000000
      }
    ]
  },
  "metadata": {
    "totalAccounts": 1,
    "totalBrainrots": 1
  }
}
```

### **File is Human-Readable!**

You can:
- ✅ Open in text editor
- ✅ Validate structure
- ✅ Manually edit (advanced users)
- ⚠️ Be careful with manual edits!

---

## 🎯 Common Scenarios

### **Scenario 1: Computer Upgrade**

**Old Computer:**
1. Click "Data" → Export
2. Save file to USB/Cloud

**New Computer:**
1. Open tracker in browser
2. Click "Data" → Import
3. Select your backup file
4. ✅ All data restored!

### **Scenario 2: Sharing with Friend**

**You:**
1. Export your setup
2. Send file to friend

**Friend:**
1. Opens tracker
2. Imports your file
3. ✅ They have your exact accounts!

### **Scenario 3: Multiple Devices**

**Phone:**
1. Export → Save to cloud
2. Work on phone

**Computer:**
1. Download from cloud
2. Import → Continue where you left off

**Keep files in sync!**

### **Scenario 4: Accidental Changes**

**Before big changes:**
1. Export → `backup-before-changes.json`
2. Make experimental changes
3. If you don't like it: Import old backup
4. ✅ Rolled back!

---

## ✅ Quick Reference

| Action | Button | Color | Confirmation | Undoable? |
|--------|--------|-------|--------------|-----------|
| **Export** | Download icon | Blue | None | N/A |
| **Import** | Upload icon | Green | Yes | Via export |
| **Clear All** | Trash icon | Red | 2 clicks | No |

---

## 🔥 Pro Tips

1. **Export Before Major Changes**
   - Before adding 20+ accounts
   - Before bulk deleting
   - Before experimenting

2. **Name Your Backups**
   - Rename exports with dates
   - `brainrot-2025-12-08-before-rebirth.json`

3. **Cloud Storage**
   - Keep exports in Dropbox/Google Drive
   - Auto-sync across devices

4. **Regular Backups**
   - Weekly exports (habit!)
   - Version control your progress

5. **Share Strategies**
   - Export your "perfect setup"
   - Share with Discord/Reddit
   - Help others optimize

---

## 🎉 Summary

**You Have 4 Ways to Manage Data:**

1. **Auto-Save** (default) - No action needed
2. **Export** - Download backup file
3. **Import** - Restore from file
4. **Clear** - Start fresh

**Remember:**
- ✅ Export regularly (weekly!)
- ✅ Keep backups in safe place
- ✅ Test import on another device
- ⚠️ Import REPLACES data (not merge)
- ⚠️ Clear is permanent

**Your data is safe as long as you export!** 💾✨

