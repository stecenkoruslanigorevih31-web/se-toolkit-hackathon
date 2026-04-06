# ✨ Motivational Generator

An AI-powered web application that generates personalized motivational sentences based on selected **fields** and **moods**. Features a beautiful three-panel responsive UI with history tracking and favorites management.

## 🚀 Features

- **AI-Powered Generation** — Uses OpenRouter's free LLM API (Llama/Gemma models)
- **Field Selection** — Sport & Fitness, Study & Learning, Career & Success
- **Mood Selection** — Energizing & Bold, Calm & Focused, Unstoppable & Driven
- **History Panel** — Scrollable list of all generated sentences with timestamps and tags
- **Favorites Panel** — Save and manage your favorite motivational quotes
- **Persistent Database** — SQLite storage that survives server restarts
- **Responsive Design** — Works on desktop (three-panel) and mobile (stacked)
- **Docker Support** — Fully containerized with Docker Compose + Nginx reverse proxy

## 📋 Prerequisites

- **Node.js** >= 18.0
- **npm** >= 9.0
- **Docker & Docker Compose** (optional, for containerized deployment)
- **OpenRouter API Key** — Get one free at [openrouter.ai](https://openrouter.ai)

## 🛠️ Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd motivational-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PORT=3000
```

### 4. Start the server

```bash
npm start
```

The application will be available at **http://localhost:3000**

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Create `.env` file** with your API key:

```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

2. **Build and start services:**

```bash
docker-compose up -d --build
```

This starts:
- **motivational-generator** — Node.js app on port 3000
- **nginx** — Reverse proxy on port 80
- **db-data volume** — Persistent SQLite database

3. **Access the app:**

- Via Nginx: **http://localhost**
- Direct: **http://localhost:3000**

4. **View logs:**

```bash
docker-compose logs -f app
```

5. **Stop services:**

```bash
docker-compose down
```

### Build Docker image manually

```bash
docker build -t motivational-generator .
docker run -p 3000:3000 --env-file .env -v db-data:/app/data motivational-generator
```

## 📁 Project Structure

```
motivational-generator/
├── data/                    # SQLite database (auto-created, gitignored)
│   └── motivational.db
├── public/                  # Frontend static files
│   ├── index.html           # Main HTML with three-panel layout
│   ├── app.js               # Client-side JavaScript
│   └── style.css            # Responsive CSS styles
├── tests/                   # Test files
│   └── api.test.js          # API endpoint tests
├── .dockerignore            # Docker ignore rules
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── nginx.conf               # Nginx reverse proxy config
├── package.json             # Node.js dependencies
└── server.js                # Express.js backend server
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/generate` | Generate motivational sentence |
| `GET` | `/api/history` | Get all generated sentences |
| `DELETE` | `/api/history` | Clear history |
| `GET` | `/api/favorites` | Get saved favorites |
| `POST` | `/api/favorites` | Add to favorites |
| `DELETE` | `/api/favorites/:id` | Remove from favorites |

### Example: Generate Motivation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"field": "sport", "mood": "energizing"}'
```

**Response:**
```json
{
  "motivation": {
    "id": 1,
    "text": "Push past your limits! Every rep counts, every drop of sweat proves you're unstoppable.",
    "field": "sport",
    "mood": "energizing",
    "createdAt": "2026-04-05T19:00:00.000Z"
  }
}
```

## 🗄️ Database

Uses **SQLite** via `sql.js` (pure JavaScript implementation):
- **No external database server required**
- **Persistent storage** — survives restarts
- **File-based** — stored in `data/motivational.db`
- **Docker volume** — mapped to `db-data` volume in production

## 🌐 Deployment to Cloud

### Deploy to Render/Railway/Fly.io

1. Push code to GitHub
2. Connect repository to hosting service
3. Add environment variable: `OPENROUTER_API_KEY`
4. Deploy!

### Deploy to VPS

```bash
# Clone repo
git clone <url> && cd motivational-generator

# Setup
cp .env.example .env
# Edit .env with your API key

# Docker Compose
docker-compose up -d --build

# Access at http://your-server-ip
```

## 🎨 UI Overview

### Desktop Layout (Three Panels)
- **Left**: Motivation History — scrollable list with timestamps and tags
- **Center**: Controls & Output — field/mood selection, generate button, display area
- **Right**: Favorites — saved quotes with remove functionality

### Mobile Layout
Panels stack vertically for optimal mobile experience.

## 🛡️ Best Practices

- **Environment Variables** — API keys never committed to Git
- **Error Handling** — All endpoints have try/catch blocks
- **Input Validation** — Validates required fields before processing
- **Health Checks** — Docker and manual health endpoints
- **Test Coverage** — Jest + Supertest for API testing
- **Docker Healthcheck** — Automatic container health monitoring
- **Nginx Reverse Proxy** — Production-ready HTTP routing

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
