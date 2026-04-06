# Implementation Plan — Motivational Generator

## Project Idea

| Item | Description |
|------|-------------|
| **End-user** | Students and professionals who need daily motivation and inspiration |
| **Problem** | Lack of personalized, context-specific motivational content that matches their current situation and mood |
| **Product idea** | AI-powered motivational sentence generator with field and mood selection |
| **Core feature** | Select a field (Sport, Study, Career) and mood (Energizing, Calm, Unstoppable), generate personalized motivational sentences |

---

## Version 1 — Core Feature (to show TA during lab)

### What it does well
Generate personalized motivational sentences based on user-selected field and mood categories using AI (OpenRouter free LLM API).

### Components
| Component | Technology | Status |
|-----------|-----------|--------|
| **Backend** | Express.js (Node.js) with REST API | ✅ Implemented |
| **Database** | SQLite (sql.js) — persistent storage | ✅ Implemented |
| **Client** | Responsive three-panel web app | ✅ Implemented |

### Features
- Three toggle buttons for field selection (Sport & Fitness, Study & Learning, Career & Success)
- Three toggle buttons for mood selection (Energizing & Bold, Calm & Focused, Unstoppable & Driven)
- AI-generated motivational text displayed in prominent output area
- Loading state during generation
- "Save to Favorites" button appears after generation
- History panel showing all generated sentences with timestamps and tags
- Favorites panel for saving and managing favorite quotes
- Responsive design (desktop three-panel, mobile stacked)

### What TA will test
1. Select a field and mood
2. Click "Generate Motivation"
3. See AI-generated motivational sentence
4. Save to favorites
5. View history panel
6. Remove a favorite

---

## Version 2 — Improvements (to deploy by deadline)

### Based on TA feedback from Version 1
- [ ] Address any usability issues the TA encounters
- [ ] Improve error messages based on TA feedback
- [ ] Adjust UI/UX based on TA observations

### Deployment
- Docker Compose with multi-service setup (app + Nginx reverse proxy)
- Deployed on Ubuntu 24.04 VM
- Accessible via HTTP
- Health checks configured

### Features (Version 2)
- Persistent SQLite database (data survives restarts)
- Full CRUD operations for favorites
- History with clear-all functionality
- Docker containerization
- Nginx reverse proxy
- Comprehensive README with deployment instructions
- Test suite (Jest, 9 tests)
- MIT License (open-source)

### Technical Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | SQLite (sql.js) |
| AI API | OpenRouter (free tier, Llama/Gemma models) |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| Testing | Jest + Supertest |

---

## GitHub Repository
- Repository: `se-toolkit-hackathon`
- Branch: `feature/motivational-generator`
- License: MIT
- README: Full documentation with setup and deployment instructions
