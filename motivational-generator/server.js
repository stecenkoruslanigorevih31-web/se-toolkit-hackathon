const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

app.post('/api/generate-motivation', async (req, res) => {
  try {
    const response = await axios.post(
      OLLAMA_API_URL,
      {
        model: 'mistral',
        prompt: 'Generate a short, powerful motivational message (2-3 sentences) in Russian that will inspire someone to take action today.',
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 150
        }
      }
    );

    const motivation = response.data.response;
    res.json({ motivation });
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Ollama is not running. Please start Ollama with: ollama serve' 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate motivation text' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('📡 Using Ollama API (local)');
  console.log('Make sure Ollama is running: ollama serve');
});
