// Set environment variable before dotenv loads
process.env.OPENROUTER_API_KEY = 'test-api-key-for-testing';

// Mock sql.js before requiring server
let mockExecResult = [{ columns: ['next_val'], values: [[1]] }];

const mockDb = {
  run: jest.fn(),
  exec: jest.fn(() => mockExecResult),
  export: jest.fn(() => new Uint8Array())
};

jest.mock('sql.js', () => {
  const mockSqlJs = jest.fn().mockResolvedValue({
    Database: jest.fn().mockImplementation(() => mockDb)
  });
  return mockSqlJs;
});

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    existsSync: jest.fn(() => false),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn()
  };
});

const request = require('supertest');

describe('Motivational Generator API', () => {
  let app;

  beforeAll(async () => {
    // Mock axios for generation endpoint
    jest.mock('axios');
    const axios = require('axios');
    axios.post = jest.fn().mockResolvedValue({
      data: {
        choices: [{
          message: {
            content: 'You are capable of amazing things. Take action today!'
          }
        }]
      }
    });

    app = require('../server');
    // Wait for app to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/generate', () => {
    it('should generate motivation with field and mood', async () => {
      const res = await request(app)
        .post('/api/generate')
        .send({ field: 'sport', mood: 'energizing' })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('motivation');
      expect(res.body.motivation).toHaveProperty('text');
      expect(res.body.motivation).toHaveProperty('field', 'sport');
      expect(res.body.motivation).toHaveProperty('mood', 'energizing');
    });

    it('should return 500 when API fails', async () => {
      const axios = require('axios');
      axios.post = jest.fn().mockRejectedValue(new Error('API Error'));

      const res = await request(app)
        .post('/api/generate')
        .send({ field: 'career', mood: 'calm' })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/history', () => {
    it('should return history array', async () => {
      const res = await request(app).get('/api/history');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });

  describe('DELETE /api/history', () => {
    it('should clear history', async () => {
      const res = await request(app).delete('/api/history');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'History cleared');
    });
  });

  describe('GET /api/favorites', () => {
    it('should return favorites array', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('favorites');
      expect(Array.isArray(res.body.favorites)).toBe(true);
    });
  });

  describe('POST /api/favorites', () => {
    it('should add a favorite', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .send({ text: 'Test favorite', field: 'sport', mood: 'energizing' })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('favorite');
      expect(res.body.favorite).toHaveProperty('text', 'Test favorite');
    });

    it('should return 400 when text is missing', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .send({ field: 'sport', mood: 'energizing' })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    it('should return 404 for non-existent favorite', async () => {
      // Make exec return empty results
      mockExecResult = [];
      const res = await request(app).delete('/api/favorites/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
