# Steal a Brainrot Tracker - React App

A modern React application for tracking your Steal a Brainrot collections across multiple accounts.

## Features

- 🎮 **Dashboard View**: Overview of all accounts with slot usage
- 📋 **Account Detail View**: Manage individual account collections
- 📊 **Total Collection View**: See all brainrots across all accounts
- 🔄 **Rebirth System**: Track rebirth levels and slot calculations
- 💾 **LocalStorage**: All data persists in browser
- 🎨 **Modern UI**: Built with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── dashboard/       # Dashboard view components
│   │   ├── detail/          # Account detail components
│   │   ├── collection/      # Total collection components
│   │   ├── brainrot/        # Brainrot card component
│   │   └── common/          # Shared components (Header, etc.)
│   ├── views/               # Main view components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── styles/              # CSS files
│   └── App.jsx              # Main app component
├── public/
│   ├── brainrots.json       # All 439 brainrots data
│   └── rebirths.json        # Rebirth system data
└── package.json
```

## Data Files

- **brainrots.json**: Contains all 439 brainrots with cost, income, rarity
- **rebirths.json**: Rebirth levels 0-17 with requirements and rewards

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## Development

The app is organized into three main views:

1. **Dashboard View** (`views/DashboardView.jsx`)
   - Shows all accounts
   - Displays slot usage with color-coded alerts
   - Quick access to each account

2. **Account Detail View** (`views/AccountDetailView.jsx`)
   - Manage one account's brainrots
   - Filter by rarity, ownership, floor
   - Set mutations and traits
   - Track income calculations

3. **Total Collection View** (`views/TotalCollectionView.jsx`)
   - See all brainrots across all accounts
   - Find duplicates
   - Identify missing brainrots
   - Quick navigation to specific accounts

## Next Steps

1. Load brainrots.json in App.jsx
2. Add mutation/trait calculation logic
3. Implement thumbnail loading
4. Add export/import functionality
5. Add dark/light theme toggle

## License

MIT

