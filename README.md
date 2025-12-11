# 🎮 Steal a Brainrot Tracker

Complete tracker for managing your Steal a Brainrot collection across multiple accounts.

## ✨ Features

### 🏦 Multi-Account Management
- Create unlimited accounts
- Track rebirth levels (0-17)
- Organize with tags, colors, and favorites
- 3 dashboard views (Grouped, Card, Table)

### 🧠 Brainrot Collection
- 439+ brainrots tracked
- **Mutations** - 12 types (up to 10x multiplier)
- **Modifiers** - 20 types (stacking multipliers)
- **Floors** - 5 security levels
- **Income Calculator** - Real-time calculations

### 🖱️ Drag & Drop
- Drag brainrots between accounts
- **Bulk Mode** - Select & drag multiple
- Copy full setup (mutation + modifiers)
- Visual feedback & animations

### 📊 Total Collection View
- See all brainrots across accounts
- Track ownership status
- Advanced filtering & sorting
- Income aggregation

### 💾 Data Management
- Export to JSON
- Import from JSON
- Clear all data
- Load demo data (20 accounts)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/brainrot-tracker

# Navigate to app
cd brainrot-tracker/app

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173/** in your browser!

### First Steps

1. **Load Demo Data** - Click "Data" → "Load Demo Data"
2. **Explore Dashboard** - See 20 sample accounts
3. **View Account** - Click "View Account" on any card
4. **Try Drag & Drop** - Drag brainrots between accounts
5. **Bulk Mode** - Select multiple brainrots at once

---

## 📖 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete how-to guide
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Technical documentation
- **[Changelog](docs/CHANGELOG.md)** - Version history
- **[Scraping Guide](docs/SCRAPING_GUIDE.md)** - Update brainrot data

---

## 🏗️ Project Structure

```
brainrot-tracker/
├── app/                    # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # State contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   │   ├── views/          # Main views
│   │   └── App.jsx         # Root component
│   ├── public/
│   │   ├── brainrots.json  # Brainrot data
│   │   └── thumbnails/     # Images
│   └── package.json
├── scripts/                # Data scraping
├── data/                   # Raw data
└── docs/                   # Documentation
```

---

## 🛠️ Tech Stack

- **React** 18 - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag & drop
- **LocalStorage** - Data persistence

---

## 🎯 Key Features

### Income Calculation

```
Total Income = Base × Mutation × (1 + Sum of Modifiers)
```

**Example:**
- Base: $50M/s
- Mutation: Rainbow (10x)
- Modifiers: Zombie (+5x), Firework (+6x), Strawberry (+10x)
- **Result:** $50M × 10 × (1 + 21) = **$11B/s**

### Mutations (Best to Worst)
1. **Rainbow** - 10.0x
2. **Radioactive** - 8.5x
3. **Yin Yang** - 7.5x
4. **Lava / Galaxy** - 6.0x each
5. **Celestial / Candy** - 4.0x each

### Top Modifiers
1. **Strawberry** - +10.0x
2. **Firework / Fire / Paint / Nyan** - +6.0x each
3. **Zombie / Meowl / RIP** - +5.0x each

---

## 📱 Screenshots

### Dashboard View
Three view modes for managing 1-50+ accounts efficiently.

### Account Detail
Comprehensive brainrot management with income calculations.

### Drag & Drop
Intuitive drag-and-drop to copy brainrots between accounts.

### Total Collection
Cross-account view with ownership tracking and filtering.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/brainrot-tracker/issues)
- **Documentation:** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Wiki:** [GitHub Wiki](https://github.com/yourusername/brainrot-tracker/wiki)

---

## 🎉 Acknowledgments

- **Steal a Brainrot** - Original game
- **Fandom Wiki** - Brainrot data source
- **React Community** - Amazing ecosystem

---

## 📊 Project Stats

- **439+ Brainrots** tracked
- **12 Mutations** available
- **20 Modifiers** available
- **5 Floors** for security
- **∞ Accounts** supported

---

## 🔮 Roadmap

- [ ] Rebirth calculator integration
- [ ] Advanced analytics dashboard
- [ ] Cloud sync (multi-device)
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Trading marketplace integration

---

## 💡 Tips

- **Export regularly** - Backup your data
- **Use tags** - Organize accounts efficiently
- **Bulk mode** - Save time managing large collections
- **Demo data** - Test features risk-free
- **Drag & drop** - Fast cross-account management

---

**Enjoy your Brainrot Tracker!** 🎮✨

Built with ❤️ by the community
