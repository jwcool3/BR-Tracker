/**
 * Claude API Proxy Server
 * Bypasses CORS restrictions by proxying requests from browser to Claude API
 * 
 * Usage: node proxy-server.js
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Claude API Proxy is running',
    hasApiKey: !!process.env.CLAUDE_API_KEY
  });
});

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ 
        error: 'No Claude API key configured',
        message: 'Add CLAUDE_API_KEY to your .env file'
      });
    }

    console.log('📤 Proxying request to Claude API...');
    console.log('   Model:', req.body.model);
    console.log('   Max tokens:', req.body.max_tokens);

    // Forward request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Claude API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Claude API response received');
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Claude API Proxy Server Started!');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API Key: ${process.env.CLAUDE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('\n💡 Make sure your React app is calling http://localhost:3001/api/claude\n');
});

