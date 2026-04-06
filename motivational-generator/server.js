const express = require('express');
const axios = require('axios');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DB_PATH = path.join(__dirname, 'data', 'motivational.db');

if (!OPENROUTER_API_KEY) {
  console.error('❌ ERROR: OPENROUTER_API_KEY not found in .env file');
  console.error('Get a free key from: https://openrouter.ai');
  process.exit(1);
}

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

// Initialize SQLite database
async function initDatabase() {
  try {
    // Load sql.js
    const SQL = await initSqlJs();

    // Load or create database
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        field TEXT NOT NULL,
        mood TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        field TEXT NOT NULL,
        mood TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS next_id (
        table_name TEXT PRIMARY KEY,
        next_val INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Initialize next_id counters if not exist
    db.run(`INSERT OR IGNORE INTO next_id (table_name, next_val) VALUES ('history', 1)`);
    db.run(`INSERT OR IGNORE INTO next_id (table_name, next_val) VALUES ('favorites', 1)`);

    saveDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getNextId(tableName) {
  const results = db.exec(`SELECT next_val FROM next_id WHERE table_name = '${tableName}'`);
  const nextId = results[0].values[0][0];
  db.run(`UPDATE next_id SET next_val = next_val + 1 WHERE table_name = ?`, [tableName]);
  return nextId;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate motivational message using OpenRouter
app.post('/api/generate', async (req, res) => {
  try {
    const { field, mood } = req.body;

    // Build system prompt based on mood
    const moodPrompts = {
      'energizing': 'You are an energetic and bold motivational coach. Use powerful, high-energy language that pumps someone up.',
      'calm': 'You are a calm, mindful mentor. Use peaceful, focused language that centers and grounds someone.',
      'unstoppable': 'You are a relentless, driven success coach. Use intense, determined language that pushes someone to keep going.'
    };

    const systemPrompt = moodPrompts[mood] || moodPrompts['energizing'];

    // Build user prompt based on field
    const fieldPrompts = {
      'sport': 'Generate a short, powerful motivational message about sport and physical fitness.',
      'study': 'Generate a short, powerful motivational message about studying, learning, and academic growth.',
      'career': 'Generate a short, powerful motivational message about career growth and professional success.'
    };

    const userPrompt = fieldPrompts[field] || fieldPrompts['career'];

    console.log(`📤 Sending request to OpenRouter API... [Field: ${field}, Mood: ${mood}]`);

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Motivational Generator',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('📥 Response received from OpenRouter');

    let motivation = '';

    if (response.data?.choices?.[0]?.message?.content) {
      motivation = response.data.choices[0].message.content.trim();
    } else if (response.data?.output) {
      motivation = response.data.output.trim();
    } else if (response.data?.choices?.[0]?.text) {
      motivation = response.data.choices[0].text.trim();
    } else {
      throw new Error('Unexpected API response format');
    }

    if (!motivation || motivation.length < 5) {
      throw new Error('Empty or invalid response from API');
    }

    // Save to history in SQLite
    const id = getNextId('history');
    db.run(
      `INSERT INTO history (id, text, field, mood, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
      [id, motivation, field || 'career', mood || 'energizing']
    );
    saveDatabase();

    const historyItem = {
      id,
      text: motivation,
      field: field || 'career',
      mood: mood || 'energizing',
      createdAt: new Date().toISOString()
    };

    console.log('✅ Motivation generated and saved to database');
    res.json({ motivation: historyItem });

  } catch (error) {
    console.error('❌ Error calling OpenRouter API:');
    console.error('Status:', error.response?.status);
    console.error('Full error response:', error.response?.data);
    console.error('Error message:', error.message);

    res.status(500).json({
      error: 'Failed to generate motivation text',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get history
app.get('/api/history', (req, res) => {
  try {
    const results = db.exec('SELECT id, text, field, mood, created_at FROM history ORDER BY created_at DESC');
    const history = results.length > 0 ? results[0].values.map(row => ({
      id: row[0],
      text: row[1],
      field: row[2],
      mood: row[3],
      createdAt: row[4]
    })) : [];
    res.json({ history });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Clear history
app.delete('/api/history', (req, res) => {
  try {
    db.run('DELETE FROM history');
    saveDatabase();
    res.json({ message: 'History cleared' });
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Get favorites
app.get('/api/favorites', (req, res) => {
  try {
    const results = db.exec('SELECT id, text, field, mood, created_at FROM favorites ORDER BY created_at DESC');
    const favorites = results.length > 0 ? results[0].values.map(row => ({
      id: row[0],
      text: row[1],
      field: row[2],
      mood: row[3],
      createdAt: row[4]
    })) : [];
    res.json({ favorites });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
app.post('/api/favorites', (req, res) => {
  try {
    const { text, field, mood } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const id = getNextId('favorites');
    db.run(
      `INSERT INTO favorites (id, text, field, mood, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
      [id, text.trim(), field || 'General', mood || 'General']
    );
    saveDatabase();

    const favItem = {
      id,
      text: text.trim(),
      field: field || 'General',
      mood: mood || 'General',
      createdAt: new Date().toISOString()
    };

    console.log(`⭐ Added to favorites: "${favItem.text.substring(0, 50)}..."`);
    res.status(201).json({ favorite: favItem });
  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
app.delete('/api/favorites/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = db.exec(`SELECT id, text, field, mood FROM favorites WHERE id = ${id}`);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    const row = result[0].values[0];
    const removed = {
      id: row[0],
      text: row[1] || '',
      field: row[2],
      mood: row[3]
    };

    db.run(`DELETE FROM favorites WHERE id = ${id}`);
    saveDatabase();

    console.log(`🗑️ Removed from favorites: "${(removed.text || '').substring(0, 50)}..."`);
    res.json({ message: 'Favorite removed', favorite: removed });
  } catch (error) {
    console.error('❌ Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Start server after database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log('🤝 Using OpenRouter API');
    console.log(`💾 Database: ${DB_PATH}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API endpoint: POST http://localhost:${PORT}/api/generate`);
  });
});

module.exports = app;
