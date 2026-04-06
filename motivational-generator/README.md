# ✨ Motivational Generator

AI-powered web application that generates personalized motivational sentences based on selected fields and moods.

---

## Demo

> **Screenshot 1 — Main Interface**
> 
> Three-panel layout: History (left), Controls & Output (center), Favorites (right)
> 
> ![Screenshot placeholder — open http://localhost:3000 for live demo]

> **Screenshot 2 — Generated Motivation**
>
> User selects "Career & Success" + "Unstoppable & Driven", receives AI-generated motivational text
>
> ![Screenshot placeholder — open http://localhost:3000 for live demo]

---

## Product Context

### End Users
Students and professionals who need daily motivation, inspiration, and encouragement tailored to their current situation.

### Problem
Lack of personalized, context-specific motivational content. Generic motivational quotes don't match the user's specific field (sport, study, career) or current mood (energizing, calm, unstoppable).

### Our Solution
An AI-powered generator where users select:
- **Field**: Sport & Fitness, Study & Learning, Career & Success
- **Mood**: Energizing & Bold, Calm & Focused, Unstoppable & Driven

The AI generates personalized motivational sentences. Users can save favorites, view history, and organize their inspiration library.

---

## Features

### Implemented ✅
| Feature | Description |
|---------|-------------|
| AI Generation | OpenRouter free API (Llama/Gemma models) |
| Field Selection | 3 toggle buttons (Sport, Study, Career) |
| Mood Selection | 3 toggle buttons (Energizing, Calm, Unstoppable) |
| Output Display | Prominent text area with loading state |
| Save to Favorites | One-click save with dedicated panel |
| History Panel | Scrollable list with timestamps and tags |
| Favorites Panel | Saved quotes with remove functionality |
| Persistent Database | SQLite (sql.js) — data survives restarts |
| Responsive Design | Desktop (3-panel) and mobile (stacked) |
| Docker Support | Docker Compose + Nginx reverse proxy |
| Test Suite | Jest + Supertest (9 tests passing) |
| Health Checks | Docker and manual health endpoints |

### Not Yet Implemented
| Feature | Priority |
|---------|----------|
| User authentication | Low |
| Share to social media | Low |
| Text-to-speech playback | Low |
| Daily notification emails | Low |

---

## Usage

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd motivational-generator

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY (free from https://openrouter.ai)

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

### Using the App

1. **Select a Field** — click one of: Sport & Fitness, Study & Learning, Career & Success
2. **Select a Mood** — click one of: Energizing & Bold, Calm & Focused, Unstoppable & Driven
3. **Click "Generate Motivation"** — AI generates a personalized motivational sentence
4. **Save to Favorites** — click the ★ Save button to keep your favorite quotes
5. **View History** — see all generated sentences in the left panel
6. **Manage Favorites** — view saved quotes in the right panel, remove ones you don't want

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/generate` | Generate motivation (body: `{field, mood}`) |
| `GET` | `/api/history` | Get all generated sentences |
| `DELETE` | `/api/history` | Clear history |
| `GET` | `/api/favorites` | Get saved favorites |
| `POST` | `/api/favorites` | Add to favorites |
| `DELETE` | `/api/favorites/:id` | Remove from favorites |

---

## Deployment

### Target OS
Ubuntu 24.04 LTS (same as university VMs)

### Prerequisites (what should be installed on the VM)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Git
sudo apt install -y git
```

### Option A: Docker Compose (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd motivational-generator

# Create environment file
cp .env.example .env
# Edit .env and add OPENROUTER_API_KEY

# Build and deploy
docker-compose up -d --build

# Verify
docker-compose ps
curl http://localhost:3001/health
```

Access at: **http://your-vm-ip:3001**

### Option B: Direct Node.js (No Docker)

```bash
# Clone repository
git clone <your-repo-url>
cd motivational-generator

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add OPENROUTER_API_KEY

# Run tests
npm test

# Start with PM2 (persistent background process)
sudo npm install -g pm2
pm2 start server.js --name motivational-generator
pm2 save
pm2 startup

# Check status
pm2 status
```

Access at: **http://your-vm-ip:3000**

### Option C: Docker Compose with Nginx (Port 80)

```bash
# Clone and configure
git clone <your-repo-url>
cd motivational-generator

cp .env.example .env
# Edit .env with your API key

# Deploy (includes Nginx reverse proxy on port 80)
docker-compose up -d --build
```

Access at: **http://your-vm-ip** (port 80)

### Stopping the Service

```bash
# Docker Compose
docker-compose down

# PM2
pm2 stop motivational-generator
```

---

## Project Structure

```
motivational-generator/
├── data/                    # SQLite database (auto-created, gitignored)
│   └── motivational.db
├── public/                  # Frontend static files
│   ├── index.html           # Three-panel layout
│   ├── app.js               # Client-side JavaScript
│   └── style.css            # Responsive CSS
├── tests/                   # Test files
│   └── api.test.js          # 9 API endpoint tests
├── .dockerignore            # Docker ignore rules
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── Dockerfile               # Docker image definition
├── docker-compose.yml       # Multi-service orchestration
├── jest.config.js           # Jest test configuration
├── LICENSE                  # MIT License
├── nginx.conf               # Nginx reverse proxy
├── package.json             # Node.js dependencies
└── server.js                # Express.js backend
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

All 9 tests must pass before deployment.

---

## License

MIT — see [LICENSE](LICENSE) file.
