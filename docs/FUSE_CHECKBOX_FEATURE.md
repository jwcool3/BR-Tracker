# Fuse Checkbox Feature

**Added:** December 12, 2025  
**Feature Type:** Quick Status Tracking

## Overview

Added a simple checkbox system to track which accounts are actively fusing Santa's Fuse brainrots. This provides an at-a-glance view of fusing status across all accounts.

---

## 🎯 Purpose

The Fuse Checkbox feature helps you:
- **Quickly see** which accounts are currently fusing
- **Track fusing status** without opening each account
- **Ensure all accounts are fusing** for maximum efficiency
- **Identify idle accounts** that need attention

---

## 🔥 Where to Find It

### 1. **Account Card View** (Dashboard)
- Checkbox appears next to the rebirth info at the top
- Label: "🔥 Fusing"
- Click to toggle fusing status instantly

### 2. **Compact Row View** (Grouped Dashboard / Table View)
- Checkbox appears before the action buttons
- Shows "🔥 Fusing" on desktop, just "🔥" on mobile
- Toggle without opening the account

### 3. **Edit Account Modal**
- Checkbox at the bottom with other options
- Label: "🔥 Currently fusing"
- Part of the account settings

### 4. **Grouped Dashboard Section**
- New "🔥 Fusing (X)" section at the top
- Shows only accounts marked as fusing
- Collapsible like other sections

### 5. **Global Stats**
- New stat: "🔥 Fusing X/Y" 
- Shows number of fusing accounts vs total accounts
- Highlighted in orange for visibility

---

## 💾 Data Structure

Each account now includes an `isFusing` boolean field:

```javascript
{
  id: "account-1",
  name: "Main Account",
  rebirthLevel: 5,
  isFusing: true,  // ← New field
  favorite: false,
  tags: ["main"],
  color: "#3b82f6",
  notes: "Primary farming account"
}
```

**Default Value:** `false` (unchecked)  
**Storage:** Saved in localStorage with other account data  
**Persistence:** Survives page refreshes and sessions

---

## 🎨 Visual Design

### Checkbox Style
- Small, compact checkbox (3.5px × 3.5px)
- Fire emoji 🔥 as label
- Hover effect: subtle background highlight
- Click anywhere on the label to toggle

### Global Stats Display
- Orange color (#f97316) for the fusing count
- Format: "X/Y" (e.g., "5/20" = 5 out of 20 accounts fusing)
- Prominent placement in the stats row

### Grouped Dashboard Section
- Appears at the very top (above Favorites)
- Only visible if at least one account is marked as fusing
- Same collapsible design as other sections
- Fire emoji 🔥 for quick recognition

---

## 📋 How to Use

### **Quick Workflow:**

1. **Mark accounts as fusing:**
   - Check the "🔥 Fusing" box on each account that's currently fusing
   - Do this directly from the dashboard (no need to open account)

2. **Check global status:**
   - Look at Global Stats: "🔥 Fusing 5/20"
   - Quickly see if you have accounts that aren't fusing

3. **View all fusing accounts:**
   - Switch to "Grouped" view
   - Expand the "🔥 Fusing (5)" section
   - See all actively fusing accounts in one place

4. **Update status when complete:**
   - Uncheck the box when a fuse completes
   - Mark it again when you start a new fuse

---

## 🔗 Integration with Fuse Readiness Analyzer

This simple checkbox complements the existing Fuse Readiness Analyzer:

| Feature | Fuse Checkbox | Fuse Readiness Analyzer |
|---------|---------------|-------------------------|
| **Purpose** | Quick status tracking | Detailed analysis & recommendations |
| **Usage** | Manual checkbox | Automatic calculation |
| **Location** | Dashboard (all views) | Organization tab |
| **Info Shown** | Is it fusing? (yes/no) | Can it fuse? What should it fuse? |
| **Best For** | Daily tracking | Strategic planning |

**Recommended Workflow:**
1. Use **Fuse Readiness Analyzer** to plan which accounts should fuse what
2. Start the fuses in-game
3. Use **Fuse Checkbox** to mark which accounts are actively fusing
4. Monitor the global stats to ensure all accounts are fusing

---

## ✨ Benefits

### **At a Glance Tracking**
- No need to remember which accounts are fusing
- Visual confirmation directly on the dashboard
- Quick mental checklist: "Are all my accounts fusing?"

### **Grouped Organization**
- "Fusing" section groups all active accounts
- Easy to review timers or check status
- Separate from other organization (favorites, storage, etc.)

### **Global Overview**
- "5/20 accounts fusing" tells you immediately if you have idle accounts
- Orange color draws attention
- Motivates you to keep all accounts productive

### **Fast Updates**
- Toggle directly from card or row view
- No need to open account or navigate away
- One click to update status

---

## 🎮 Example Use Cases

### **Santa's Fuse Event**
You have 20 accounts and want to ensure they're all fusing:
1. Check Global Stats: "🔥 Fusing 15/20"
2. Realize 5 accounts aren't fusing
3. Switch to Grouped view
4. Look at accounts NOT in the "Fusing" section
5. Start fuses on those 5 accounts
6. Check their boxes
7. Global Stats now shows "20/20" ✅

### **Daily Checklist**
Morning routine:
1. Open BR Tracker
2. Check Global Stats: "🔥 Fusing 18/20"
3. Open "🔥 Fusing (18)" section in Grouped view
4. Review which 2 accounts aren't fusing
5. Log into game and start their fuses
6. Mark them as fusing
7. Done! All accounts productive.

### **Long-Term Tracking**
If you fuse 24/7:
- Always keep the checkbox checked
- If you see "19/20 fusing", investigate immediately
- Maybe that account's fuse finished early
- Start a new fuse and re-check the box

---

## 🔧 Technical Details

### **Files Modified:**

1. **`app/src/components/dashboard/AccountCard.jsx`**
   - Added checkbox next to rebirth info
   - Calls `onEdit({ isFusing: value })`

2. **`app/src/components/dashboard/CompactAccountRow.jsx`**
   - Added checkbox before action buttons
   - Responsive: "🔥 Fusing" on desktop, "🔥" on mobile

3. **`app/src/components/dashboard/EditAccountModal.jsx`**
   - Added `isFusing` state
   - Added checkbox in form
   - Includes in save payload

4. **`app/src/components/dashboard/GlobalStats.jsx`**
   - Added `fusingCount` calculation
   - Added 5th stat card for fusing count
   - Orange color for visual emphasis

5. **`app/src/components/dashboard/GroupedDashboard.jsx`**
   - Added "fusing" section to expanded sections
   - Added fusing group to account grouping
   - Renders "🔥 Fusing (X)" section at top

### **Data Flow:**

```
User clicks checkbox
  ↓
BrainrotCard/CompactAccountRow: onChange event
  ↓
onEdit({ isFusing: newValue })
  ↓
DashboardView: onUpdateAccount(accountId, updates)
  ↓
App.jsx: Updates account in state
  ↓
localStorage: Persists change
  ↓
GlobalStats & GroupedDashboard: Re-render with new counts
```

---

## 🚀 Future Enhancements (Optional)

### **Potential Additions:**

1. **Fuse Timer Tracking**
   - Store when the fuse started
   - Calculate and display remaining time
   - Auto-uncheck when timer expires

2. **Fuse History**
   - Track completed fuses
   - Show "Last fused: 2 hours ago"
   - Analytics on fusing patterns

3. **Bulk Fusing Actions**
   - "Mark all as fusing" button
   - "Mark all as not fusing" button
   - Filter: "Show only not fusing"

4. **Fuse Notifications**
   - Browser notification when fuse completes
   - Reminder if account hasn't fused in X hours
   - Daily summary: "18/20 accounts fused today"

5. **Integration with Fuse Readiness**
   - Auto-check "isFusing" when you start a recommended fuse
   - Show fusing status in Fuse Readiness panel
   - Highlight accounts that are fusing but shouldn't be (wrong brainrots)

---

## 📊 Quick Stats (After Implementation)

**Time to Add Feature:** ~15 minutes  
**Files Modified:** 5  
**Lines Changed:** ~100  
**New UI Elements:** 6 (checkbox in 5 locations + stats card)  
**Data Fields Added:** 1 (`isFusing` boolean)  
**Testing Time:** Instant (try it now!)  

---

## ✅ Testing Checklist

- [x] Checkbox appears on AccountCard
- [x] Checkbox appears on CompactAccountRow
- [x] Checkbox appears in EditAccountModal
- [x] Global Stats shows fusing count
- [x] Grouped Dashboard has "Fusing" section
- [x] Checking box updates Global Stats
- [x] Fusing section only appears when at least one account is fusing
- [x] State persists on page refresh
- [x] No linter errors

---

## 🎉 Summary

The Fuse Checkbox is a **simple but powerful** addition that makes daily tracking effortless. It answers the question: **"Which of my accounts are currently fusing?"** in 2 seconds instead of 2 minutes.

**Key Takeaway:** Sometimes the best features are the simplest ones. A single checkbox can save hours of mental tracking across 20+ accounts. 🔥✅

---

**Ready to use!** Check the box and start tracking your fuses! 🚀

