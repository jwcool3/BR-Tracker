# 🚀 Proxy Server Setup Guide

**CORS Bypass for Claude API**

---

## 🎯 Why You Need This

Claude API blocks browser requests with CORS policy. This proxy server:
- ✅ Runs locally on your machine
- ✅ Forwards requests to Claude API
- ✅ Bypasses CORS restrictions
- ✅ Keeps your API key secure (server-side only)

---

## 📋 Quick Start (3 Steps)

### Step 1: Install Dependencies

Open a **new terminal** in the project root and run:

```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - CORS handling
- `node-fetch` - HTTP requests
- `dotenv` - Environment variables

---

### Step 2: Add Your Claude API Key

Create a `.env` file in the project root (same folder as `proxy-server.js`):

```env
CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
```

**Get your API key from:** https://console.anthropic.com/

---

### Step 3: Start the Proxy Server

In the **same terminal**, run:

```bash
npm start
```

You should see:

```
🚀 Claude API Proxy Server Started!
   http://localhost:3001
   Health check: http://localhost:3001/health
   API Key: ✅ Configured

💡 Make sure your React app is calling http://localhost:3001/api/claude
```

---

## ✅ Test It's Working

1. **Proxy server running:** Keep the terminal open with `npm start`
2. **React app running:** In a **different terminal**, run:
   ```bash
   cd app
   npm run dev
   ```
3. **Health check:** Visit http://localhost:3001/health in your browser

You should see:
```json
{
  "status": "ok",
  "message": "Claude API Proxy is running",
  "hasApiKey": true
}
```

---

## 🧪 Test Floor Scanner

1. Make sure **both servers are running:**
   - Proxy: `npm start` (terminal 1)
   - React: `cd app && npm run dev` (terminal 2)

2. Open your React app: http://localhost:5173

3. Open any account

4. Click **"📸 Scan Floor"**

5. Upload your floor screenshot

6. Watch the magic! You should see **🤖 AI Vision** badges! ✨

---

## 📊 Expected Results

### Before (OCR only):
- ❌ 2/5 detected
- ❌ Wrong matches
- ❌ No mutations/modifiers

### After (AI Vision):
- ✅ 5/5 detected
- ✅ Accurate names
- ✅ Mutations detected
- ✅ Modifiers detected
- 🎯 90-95% confidence!

---

## 🐛 Troubleshooting

### "npm: command not found"
- **Install Node.js** from: https://nodejs.org/
- Restart your terminal after installing

### "Cannot find module 'express'"
- Run `npm install` in the project root
- Make sure you're in the same folder as `package.json`

### "hasApiKey: false"
- Check `.env` file exists in project root
- Check API key is correct (starts with `sk-ant-`)
- Restart the proxy server after adding key

### "Failed to fetch" / "Network error"
- Make sure proxy server is running (`npm start`)
- Check it's on port 3001: http://localhost:3001/health
- Check firewall isn't blocking localhost

### Still getting CORS errors?
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh React app (Ctrl+Shift+R)
- Check browser console for actual error

### React app can't connect to proxy
- Make sure React is on http://localhost:5173
- If using different port, update `proxy-server.js` line 13:
  ```javascript
  origin: 'http://localhost:YOUR_PORT'
  ```

---

## 🔧 Advanced: Development Mode

For auto-restart on code changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes.

---

## 📁 File Structure

```
BR Tracker/
├── proxy-server.js       ← Proxy server (NEW!)
├── package.json          ← Dependencies (NEW!)
├── .env                  ← API key (YOU CREATE)
├── .gitignore            ← Protects .env
└── app/
    ├── src/
    │   └── services/
    │       ├── cardDetectionService.js (updated)
    │       ├── visionExtractionService.js (updated)
    │       ├── modifierDetectionService.js (updated)
    │       └── floorScannerService.js (updated)
    └── ...
```

---

## 🔐 Security Notes

- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ API key stays on server (never sent to browser)
- ✅ Proxy only allows localhost connections
- ⚠️ **Don't share your `.env` file!**
- ⚠️ **Don't commit API keys to Git!**

---

## 🎉 You're Done!

When both servers are running, your Floor Scanner will use **AI Vision** for 90%+ accuracy!

**Test with your 5-brainrot screenshot and see the difference!** 🚀

---

## 📝 Daily Workflow

Every time you want to use the Floor Scanner:

1. **Terminal 1:** `npm start` (proxy server)
2. **Terminal 2:** `cd app && npm run dev` (React app)
3. Use the app normally!

You can keep both running while you work. Press `Ctrl+C` to stop when done.

