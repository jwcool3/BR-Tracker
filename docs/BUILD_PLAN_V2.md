# Build Plan V2: Three-View Dashboard System

## 🎯 Updated Strategy: Multi-View Approach

### Why Three Views?
1. **Dashboard** - See all accounts at once, manage slot usage
2. **Account Detail** - Manage one account's collection
3. **Total Collection** - See ALL brainrots across all accounts ✨ NEW!
4. **Natural flow** - Easy navigation between views
5. **Scalable** - Works with 1 or 20 accounts

---

## 📱 The Three-View System

### View 1: Dashboard (Home Screen)
```
Purpose: Overview of ALL accounts
Shows:  Account cards with key stats
Actions: View account, Add account, Quick edit
Goal:   Answer "Which account needs attention?"
```

### View 2: Account Detail (Single Account)
```
Purpose: Manage ONE account's brainrots
Shows:  All 439 brainrots for selected account
Actions: Mark owned, Set mutations/traits, Assign floors
Goal:   Answer "What brainrots does this account have?"
```

### View 3: Total Collection ✨ NEW!
```
Purpose: See ALL brainrots across ALL accounts
Shows:  Every brainrot with ownership status per account
Actions: Sort, filter, compare collections
Goal:   Answer "Which brainrots do I have? Where are duplicates?"
```

---

## 🗂️ Updated Folder Structure

```
src/
├── views/
│   ├── DashboardView.jsx          ← Main screen (all accounts)
│   ├── AccountDetailView.jsx      ← Detail screen (one account)
│   └── TotalCollectionView.jsx    ← Total view (all brainrots) ✨ NEW!
│
├── components/
│   ├── dashboard/
│   │   ├── AccountCard.jsx        ← Shows account summary
│   │   ├── AccountList.jsx        ← Grid of account cards
│   │   ├── GlobalStats.jsx        ← Total across all accounts
│   │   └── AddAccountButton.jsx   ← Create new account
│   │
│   ├── detail/
│   │   ├── DetailHeader.jsx       ← Account name, back button
│   │   ├── AccountControls.jsx    ← Rebirth selector, stats
│   │   ├── FilterBar.jsx          ← Search, filter, sort
│   │   └── BrainrotGrid.jsx       ← Grid of brainrot cards
│   │
│   ├── collection/                 ✨ NEW!
│   │   ├── CollectionHeader.jsx   ← Navigation, totals
│   │   ├── CollectionFilters.jsx  ← Advanced filters
│   │   ├── TotalBrainrotCard.jsx  ← Shows all account ownership
│   │   └── AccountOwnershipBadge.jsx ← Mini badges per account
│   │
│   ├── brainrot/
│   │   ├── BrainrotCard.jsx       ← Individual brainrot
│   │   ├── MutationSelector.jsx   ← Dropdown for mutations
│   │   ├── TraitCheckboxes.jsx    ← Multi-select traits
│   │   └── FloorSelector.jsx      ← Floor 1/2/3
│   │
│   ├── rebirth/
│   │   ├── RebirthSelector.jsx    ← Select 0-17
│   │   ├── FreeSpaceBar.jsx       ← Visual slot usage
│   │   └── SlotInfo.jsx           ← Detailed breakdown
│   │
│   └── common/
│       ├── Layout.jsx             ← App wrapper
│       ├── Header.jsx             ← Top bar
│       └── Modal.jsx              ← For add/edit forms
│
├── hooks/
│   ├── useLocalStorage.js         ← Persist data
│   ├── useAccounts.js             ← Account CRUD
│   ├── useCollections.js          ← Brainrot ownership
│   └── useNavigation.js           ← View switching
│
├── utils/
│   ├── incomeCalculator.js        ← From BR Tracker
│   └── rebirthCalculator.js       ← From BR Tracker
│
├── data/
│   ├── brainrots.json
│   ├── rebirths.json
│   └── mutations_traits.json
│
├── App.jsx                        ← Main app component
└── main.jsx                       ← Entry point
```

---

## 🔨 Phase-by-Phase Build Plan

### Phase 1: Setup & Foundation (30 minutes)

#### 1.1 Create Project
```bash
npm create vite@latest brainrot-tracker -- --template react
cd brainrot-tracker
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 1.2 Configure Tailwind
**tailwind.config.js:**
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Rarity colors
        common: '#808080',
        rare: '#00BFFF',
        epic: '#9370DB',
        legendary: '#FFD700',
        mythic: '#FF1493',
        secret: '#FF4500',
        og: '#FF0000',
        brainrot_god: '#00FFFF',
        // Status colors
        status: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          critical: '#ef4444',
          full: '#991b1b',
        }
      }
    },
  },
  plugins: [],
}
```

#### 1.3 Copy Data Files
```bash
cp -r ../BR\ Tracker/data ./src/
cp -r ../BR\ Tracker/public/thumbnails ./public/
cp ../BR\ Tracker/src/incomeCalculator.js ./src/utils/
cp ../BR\ Tracker/scripts/rebirthCalculator.js ./src/utils/
```

**Deliverable:** ✅ Running React app with Tailwind

---

### Phase 2: Data Layer & Navigation (45 minutes)

#### 2.1 LocalStorage Hook
**src/hooks/useLocalStorage.js:**
```javascript
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue];
}
```

#### 2.2 Navigation Hook
**src/hooks/useNavigation.js:**
```javascript
import { useState } from 'react';

export function useNavigation() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const viewAccount = (accountId) => {
    setSelectedAccount(accountId);
    setCurrentView('detail');
  };

  const backToDashboard = () => {
    setSelectedAccount(null);
    setCurrentView('dashboard');
  };

  return {
    currentView,
    selectedAccount,
    viewAccount,
    backToDashboard,
  };
}
```

#### 2.3 App.jsx Structure
```javascript
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNavigation } from './hooks/useNavigation';
import DashboardView from './views/DashboardView';
import AccountDetailView from './views/AccountDetailView';
import brainrotsData from './data/brainrots.json';

function App() {
  const [accounts, setAccounts] = useLocalStorage('accounts', [
    { id: 'default', name: 'Main Account', rebirthLevel: 0, notes: '' }
  ]);
  
  const [collections, setCollections] = useLocalStorage('collections', {
    default: []
  });

  const { currentView, selectedAccount, viewAccount, backToDashboard } = useNavigation();
  
  const brainrots = brainrotsData.brainrots;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {currentView === 'dashboard' ? (
        <DashboardView 
          accounts={accounts}
          collections={collections}
          onViewAccount={viewAccount}
          onUpdateAccount={/* ... */}
        />
      ) : (
        <AccountDetailView
          account={accounts.find(a => a.id === selectedAccount)}
          brainrots={brainrots}
          collection={collections[selectedAccount] || []}
          onBack={backToDashboard}
          onUpdateCollection={/* ... */}
        />
      )}
    </div>
  );
}
```

**Deliverable:** ✅ View switching works, data persists

---

## 📊 Total Collection View Design

### Wireframe
```
┌──────────────────────────────────────────────────────────┐
│  [Dashboard] [Total Collection] [← Account Detail]       │
│  📊 Total Collection View                                │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  [🔍 Search] [Rarity ▼] [Ownership ▼] [Sort ▼]          │
│  [Show: All | Owned Somewhere | Not Owned | Duplicates] │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  Stats: 71/439 owned somewhere | 45 duplicates           │
│  Total Income: $1.203B/s across all accounts            │
└──────────────────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ ┌──────┐│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │
│ │ Img  ││ │ Img  │ │ │ Img  │ │ │ Img  │ │ │ Img  │ │
│ │Name  ││ │ Name │ │ │ Name │ │ │ Name │ │ │ Name │ │
│ │Leg.  ││ │ Rare │ │ │ Epic │ │ │ Com. │ │ │ Myth │ │
│ │$50/s ││ │ $3/s │ │ │ $10/s│ │ │ $1/s │ │ │$100K │ │
│ │      ││ │      │ │ │      │ │ │      │ │ │      │ │
│ │Owned:││ │Owned:│ │ │Owned:│ │ │Owned:│ │ │Owned:│ │
│ │✓Main ││ │✗None │ │ │✓Main │ │ │✓Main │ │ │✓Alt  │ │
│ │✓Alt  ││ │      │ │ │✓Alt  │ │ │✗Alt  │ │ │✓Grind│ │
│ │✓Grind││ │      │ │ │✗Grind│ │ │✗Grind│ │ │✗Main │ │
│ └──────┘│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │
│ 3 accts││ 0 accts │ │ 2 accts│ │ 1 acct │ │ 2 accts│ │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Use Cases
1. **Find Duplicates** - "I have Strawberry Elephant on 3 accounts!"
2. **Missing Brainrots** - Filter: "Not Owned" → See what you don't have
3. **Cross-Account Planning** - "Which account should I put this on?"
4. **Total Value** - See combined income across all accounts
5. **Trade Planning** - "I have extra Secrets on Alt, can move to Main"

### Features
- ✅ See ownership status across all accounts at once
- ✅ Filter by "Owned Somewhere" / "Not Owned Anywhere" / "Duplicates"
- ✅ Sort by total ownership count (most duplicated first)
- ✅ Click account badge → Navigate to that account's detail view
- ✅ Aggregate stats (total owned, total income, etc.)
- ✅ Identify gaps in collection

---

### Phase 3: Dashboard View (1.5 hours)

#### 3.1 AccountCard Component
```javascript
import { calculateSlots, calculateFreeSpace } from '../utils/rebirthCalculator';

export function AccountCard({ account, collectionSize, onView, onEdit, onDelete }) {
  const slots = calculateSlots(account.rebirthLevel);
  const space = calculateFreeSpace(account.rebirthLevel, collectionSize);
  
  const statusColors = {
    LOW: 'bg-status-low',
    MEDIUM: 'bg-status-medium',
    HIGH: 'bg-status-high',
    CRITICAL: 'bg-status-critical',
    FULL: 'bg-status-full'
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{account.name}</h3>
        <button onClick={onView} className="btn-primary">
          View →
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-400">
          Rebirth {account.rebirthLevel} | {slots.totalSlots} slots
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
            <div 
              className={`h-full ${statusColors[space.status]}`}
              style={{ width: `${space.percentFull}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${statusColors[space.status]}`}>
            {space.status}
          </span>
        </div>

        <div className="text-sm">
          {collectionSize}/{slots.totalSlots} used ({space.freeSlots} free)
        </div>

        <div className="text-sm text-gray-400">
          {collectionSize} brainrots | {/* Calculate total income */}
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 DashboardView Component
```javascript
export function DashboardView({ accounts, collections, onViewAccount, onAddAccount }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Accounts</h1>
        <button onClick={onAddAccount} className="btn-primary">
          + Add Account
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            collectionSize={collections[account.id]?.length || 0}
            onView={() => onViewAccount(account.id)}
          />
        ))}
      </div>

      <GlobalStats accounts={accounts} collections={collections} />
    </div>
  );
}
```

**Deliverable:** ✅ Dashboard shows all accounts with status

---

### Phase 4: Account Detail View (1.5 hours)

#### 4.1 BrainrotCard Component (Simplified First)
```javascript
export function BrainrotCard({ brainrot, isOwned, onToggleOwned }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <img 
        src={brainrot.image} 
        alt={brainrot.name}
        className="w-full h-32 object-contain mb-2"
      />
      
      <h3 className="font-bold text-sm mb-1">{brainrot.name}</h3>
      
      <div className={`inline-block px-2 py-1 rounded text-xs mb-2 bg-${brainrot.rarity}`}>
        {brainrot.rarity}
      </div>

      <div className="text-xs text-gray-400 mb-2">
        {brainrot.cost ? `$${brainrot.cost.toLocaleString()}` : 'Unknown'}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isOwned}
          onChange={onToggleOwned}
          className="w-4 h-4"
        />
        <span className="text-sm">I have this</span>
      </label>
    </div>
  );
}
```

#### 4.2 AccountDetailView Component
```javascript
export function AccountDetailView({ account, brainrots, collection, onBack, onUpdateCollection }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const ownedIds = new Set(collection.map(c => c.brainrotId));
  
  const filteredBrainrots = brainrots.filter(br => 
    br.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOwned = (brainrotId) => {
    if (ownedIds.has(brainrotId)) {
      // Remove from collection
      onUpdateCollection(collection.filter(c => c.brainrotId !== brainrotId));
    } else {
      // Add to collection
      onUpdateCollection([...collection, {
        brainrotId,
        mutation: null,
        traits: [],
        floor: 1,
        calculatedIncome: 0
      }]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <button onClick={onBack} className="btn-secondary mb-4">
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-4">{account.name}</h1>

      <input
        type="text"
        placeholder="Search brainrots..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input-primary mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredBrainrots.map(brainrot => (
          <BrainrotCard
            key={brainrot.id}
            brainrot={brainrot}
            isOwned={ownedIds.has(brainrot.id)}
            onToggleOwned={() => toggleOwned(brainrot.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Deliverable:** ✅ Can view account, mark brainrots owned, navigate back

---

### Phase 5: Enhanced BrainrotCard (1.5 hours)

Add mutations, traits, and floor selectors when owned.

```javascript
export function BrainrotCard({ brainrot, collectionEntry, onUpdate }) {
  const isOwned = !!collectionEntry;
  
  // Show basic card if not owned
  if (!isOwned) return <BasicBrainrotCard />;
  
  // Show enhanced card with selectors if owned
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Image, name, rarity ... */}
      
      <MutationSelector 
        value={collectionEntry.mutation}
        onChange={(mut) => onUpdate({ ...collectionEntry, mutation: mut })}
      />
      
      <TraitCheckboxes
        selected={collectionEntry.traits}
        onChange={(traits) => onUpdate({ ...collectionEntry, traits })}
      />
      
      <FloorSelector
        value={collectionEntry.floor}
        maxFloors={/* based on rebirth */}
        onChange={(floor) => onUpdate({ ...collectionEntry, floor })}
      />
      
      <div className="text-lg font-bold text-green-400">
        ${calculatedIncome.toLocaleString()}/s
      </div>
    </div>
  );
}
```

**Deliverable:** ✅ Full brainrot management with income calculation

---

### Phase 6: Rebirth & Slots (1 hour)

Add rebirth selector to AccountCard and detail header.

**Deliverable:** ✅ Can change rebirth, slots auto-update

---

### Phase 7: Filters & Search (1 hour)

Add comprehensive filtering in detail view.

**Deliverable:** ✅ Can filter by rarity, ownership, floor, sort options

---

### Phase 8: Total Collection View (1.5 hours) ✨ NEW!

#### 8.1 Navigation Update
Update navigation hook to support three views:
```javascript
export function useNavigation() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const viewAccount = (accountId) => {
    setSelectedAccount(accountId);
    setCurrentView('detail');
  };

  const viewTotalCollection = () => {
    setSelectedAccount(null);
    setCurrentView('collection');
  };

  const backToDashboard = () => {
    setSelectedAccount(null);
    setCurrentView('dashboard');
  };

  return {
    currentView,
    selectedAccount,
    viewAccount,
    viewTotalCollection,
    backToDashboard,
  };
}
```

#### 8.2 TotalBrainrotCard Component
```javascript
export function TotalBrainrotCard({ brainrot, accounts, collections }) {
  // Calculate which accounts own this brainrot
  const ownership = accounts.map(account => ({
    account,
    isOwned: collections[account.id]?.some(c => c.brainrotId === brainrot.id),
    collectionEntry: collections[account.id]?.find(c => c.brainrotId === brainrot.id)
  }));

  const ownedByCount = ownership.filter(o => o.isOwned).length;
  const totalIncome = ownership.reduce((sum, o) => 
    sum + (o.collectionEntry?.calculatedIncome || 0), 0
  );

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <img src={brainrot.image} className="w-full h-32 object-contain" />
      <h3 className="font-bold">{brainrot.name}</h3>
      <div className={`badge bg-${brainrot.rarity}`}>{brainrot.rarity}</div>
      
      <div className="mt-2 space-y-1">
        <div className="text-sm font-bold">
          Owned by {ownedByCount}/{accounts.length} accounts
        </div>
        
        {ownership.map(({ account, isOwned, collectionEntry }) => (
          <div key={account.id} className="flex items-center gap-2 text-xs">
            {isOwned ? '✓' : '✗'}
            <span className={isOwned ? 'text-green-400' : 'text-gray-500'}>
              {account.name}
            </span>
            {isOwned && collectionEntry && (
              <span className="text-gray-400">
                ${collectionEntry.calculatedIncome?.toLocaleString()}/s
              </span>
            )}
            {isOwned && (
              <button 
                onClick={() => /* navigate to account detail */}
                className="text-blue-400 hover:underline"
              >
                View →
              </button>
            )}
          </div>
        ))}
      </div>

      {totalIncome > 0 && (
        <div className="mt-2 text-sm font-bold text-green-400">
          Total: ${totalIncome.toLocaleString()}/s
        </div>
      )}
    </div>
  );
}
```

#### 8.3 Collection Filters
```javascript
export function CollectionFilters({ onFilterChange }) {
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  
  return (
    <div className="flex gap-2">
      <select 
        value={ownershipFilter}
        onChange={(e) => {
          setOwnershipFilter(e.target.value);
          onFilterChange({ ownership: e.target.value });
        }}
      >
        <option value="all">All Brainrots</option>
        <option value="owned">Owned Somewhere</option>
        <option value="not-owned">Not Owned Anywhere</option>
        <option value="duplicates">Duplicates (2+ accounts)</option>
        <option value="unique">Unique (1 account only)</option>
      </select>
      
      {/* Rarity, Sort, etc. */}
    </div>
  );
}
```

#### 8.4 TotalCollectionView Component
```javascript
export function TotalCollectionView({ accounts, collections, brainrots, onViewAccount, onBack }) {
  const [filters, setFilters] = useState({ ownership: 'all', search: '' });

  // Calculate ownership for each brainrot
  const brainrotsWithOwnership = brainrots.map(br => {
    const ownedBy = accounts.filter(acc => 
      collections[acc.id]?.some(c => c.brainrotId === br.id)
    );
    return { ...br, ownedBy, ownedByCount: ownedBy.length };
  });

  // Apply filters
  let filtered = brainrotsWithOwnership;
  
  if (filters.ownership === 'owned') {
    filtered = filtered.filter(br => br.ownedByCount > 0);
  } else if (filters.ownership === 'not-owned') {
    filtered = filtered.filter(br => br.ownedByCount === 0);
  } else if (filters.ownership === 'duplicates') {
    filtered = filtered.filter(br => br.ownedByCount >= 2);
  } else if (filters.ownership === 'unique') {
    filtered = filtered.filter(br => br.ownedByCount === 1);
  }

  if (filters.search) {
    filtered = filtered.filter(br => 
      br.name.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  // Calculate stats
  const totalOwned = brainrotsWithOwnership.filter(br => br.ownedByCount > 0).length;
  const duplicates = brainrotsWithOwnership.filter(br => br.ownedByCount >= 2).length;
  const totalIncome = accounts.reduce((sum, acc) => {
    const accIncome = collections[acc.id]?.reduce((s, c) => s + (c.calculatedIncome || 0), 0) || 0;
    return sum + accIncome;
  }, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 Total Collection</h1>
        <button onClick={onBack} className="btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      <CollectionFilters onFilterChange={setFilters} />

      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalOwned}/439</div>
            <div className="text-sm text-gray-400">Owned Somewhere</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{duplicates}</div>
            <div className="text-sm text-gray-400">Duplicates</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${(totalIncome/1e9).toFixed(2)}B/s</div>
            <div className="text-sm text-gray-400">Total Income</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(brainrot => (
          <TotalBrainrotCard
            key={brainrot.id}
            brainrot={brainrot}
            accounts={accounts}
            collections={collections}
            onViewAccount={onViewAccount}
          />
        ))}
      </div>

      <div className="text-center text-gray-400 mt-6">
        Showing {filtered.length} of {brainrots.length} brainrots
      </div>
    </div>
  );
}
```

**Deliverable:** ✅ Can see all brainrots with cross-account ownership

---

### Phase 9: Polish & Deploy (1 hour)

- Loading states
- Error boundaries
- Mobile responsive tweaks
- Deploy to Vercel/Netlify

**Deliverable:** ✅ Production-ready app

---

## 🎯 Success Milestones

**After Phase 3:** ✅ Can see all accounts on dashboard  
**After Phase 4:** ✅ Can view account and mark brainrots owned  
**After Phase 5:** ✅ Full income calculation working  
**After Phase 6:** ✅ Rebirth tracking functional  
**After Phase 7:** ✅ Professional filtering/search  
**After Phase 8:** ✅ Total collection view with cross-account ownership ✨  
**After Phase 9:** ✅ Live on the internet!

---

## 🎨 Navigation Header Update

Add "Total Collection" button to main navigation:

```javascript
<Header>
  <nav className="flex gap-4">
    <button 
      onClick={() => setCurrentView('dashboard')}
      className={currentView === 'dashboard' ? 'active' : ''}
    >
      Dashboard
    </button>
    
    <button 
      onClick={() => setCurrentView('collection')}
      className={currentView === 'collection' ? 'active' : ''}
    >
      📊 Total Collection
    </button>
    
    {currentView === 'detail' && (
      <span className="text-gray-400">
        → {selectedAccount.name}
      </span>
    )}
  </nav>
</Header>
```

---

## 📊 Updated Time Estimate

```
Phase 1 (30m):  Setup + Tailwind
Phase 2 (45m):  Data layer + Navigation
Phase 3 (1.5h): Dashboard View
Phase 4 (1.5h): Detail View (basic)
Phase 5 (1.5h): Enhanced cards (mutations/traits)
Phase 6 (1h):   Rebirth system
Phase 7 (1h):   Filters & search
Phase 8 (1.5h): Total Collection View ✨ NEW!
Phase 9 (1h):   Polish & deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~11 hours (was 10, added Collection View)
```

---

## 🚀 Ready to Start!

The three-view system gives you:
1. **Dashboard** - Account overview & management
2. **Detail** - Individual account brainrot management
3. **Total Collection** - Cross-account overview ✨

Perfect for multi-account tracking! Let's build it! 🎉

