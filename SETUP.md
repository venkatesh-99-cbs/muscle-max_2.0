# Muscle Max 2.0 — Lightweight Local + Docker Setup

Your project is optimized for **both lightweight local dev** and **containerized deployment**.

---

## ⚡ Quick Start

### Docker (Zero local dependencies)
```bash
run_docker.bat   # Windows
./run_docker.sh  # macOS/Linux
```
✅ Lightweight (~500MB images)  
✅ Database, Ollama, backend, frontend all included  
✅ No system setup needed

### Local (Lightweight + Optional Embeddings)

**Terminal 1 — Backend (lightweight, no ML libs):**
```bash
run_backend_local.bat   # Windows
./run_backend_local.sh  # macOS/Linux
```
Installs: Django, REST, JWT, CORS, etc. (~2 minutes, ~100MB)

**Terminal 2 — Frontend:**
```bash
run_frontend_local.bat   # Windows
./run_frontend_local.sh  # macOS/Linux
```
Installs: React, Vite, etc. (~1 minute, ~500MB)

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:8000

---

## 🎯 Why Lightweight Local?

**Default (`requirements.txt`):**
- ✅ No torch (saves 550MB)
- ✅ Fast install (~2 min)
- ✅ All core features work: chatbot, JWT auth, database, API
- ⚠️ Embeddings unavailable (not needed for basic chat)

**With Embeddings (`requirements-local-full.txt`):**
- ✅ Full RAG support
- ❌ Adds torch (~550MB, 10+ min install)
- Use only if you need semantic search

---

## 📋 Setup Details

### Prerequisites

**Local:**
- Python 3.12+ (tested: 3.12, 3.13, 3.14)
- Node 20+
- PostgreSQL 16 (or Docker)
- Ollama (or Docker)

**Docker:**
- Docker Desktop only

### Local Backend Setup

```bash
cd backend
pip install -r requirements.txt              # Lightweight (~2 min)
# OR for embeddings:
# pip install -r requirements-local-full.txt  # Full features (~10 min)

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Local Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Database (Pick One)

**Option A: Local PostgreSQL**
```bash
# macOS
brew install postgresql; brew services start postgresql

# Linux
sudo apt install postgresql; sudo systemctl start postgresql

# Windows: Download installer or use Docker below
```

**Option B: Docker (easiest)**
```bash
docker run -d \
  --name musclemax_db \
  -e POSTGRES_PASSWORD=musclemax \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

### Ollama (Pick One)

**Option A: Local Install**
```bash
# Download from https://ollama.ai
ollama serve &
ollama pull mistral
```

**Option B: Docker**
```bash
docker run -d \
  --name musclemax_ollama \
  -p 11434:11434 \
  ollama/ollama:latest

docker exec musclemax_ollama ollama pull mistral
```

### Environment Variables

**backend/.env (auto-created):**
```env
DJANGO_SECRET_KEY=dev-key-change-in-prod
DJANGO_DEBUG=True
POSTGRES_HOST=localhost    # Use 'db' in Docker
POSTGRES_USER=musclemax
POSTGRES_PASSWORD=musclemax
POSTGRES_DB=musclemax

OLLAMA_HOST=http://localhost:11434     # Use 'http://ollama:11434' in Docker
OLLAMA_MODEL=mistral

CORS_ALLOWED_ORIGINS=http://localhost:5173
EMBEDDING_MODEL=all-MiniLM-L6-v2       # Only used if sentence-transformers installed
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
```

---

## 📦 Dependency Files

| File | Size | Use Case |
|------|------|----------|
| `requirements.txt` | ~100MB | **Local dev** — core only, no torch |
| `requirements-local-full.txt` | ~650MB | Local dev with embeddings/RAG |
| `requirements-prod.txt` | ~200MB | **Docker** — lightweight, production-ready |

**Default:** Use `requirements.txt` (lightweight).  
**Add embeddings when needed:** `pip install -r requirements-local-full.txt`

---

## 🐳 Docker Mode

### Start All Services
```bash
docker compose up --build --pull always
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Ollama: http://localhost:11434

### Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f ollama
```

### Stop
```bash
docker compose down
```

---

## ✅ Verification

### Local
```bash
# Backend (should show Django banner)
python manage.py runserver

# Frontend (should show Vite server on :5173)
npm run dev

# Database
psql -U musclemax -d musclemax

# Ollama
curl http://localhost:11434

# API test
curl http://localhost:8000/api/
```

### Docker
```bash
docker compose ps                    # All running?
docker compose logs backend | head   # Errors?
curl http://localhost:8000/api/      # API works?
```

---

## 🚀 Adding Embeddings Later

If you want RAG features locally:

```bash
cd backend
pip install -r requirements-local-full.txt
```

This installs `sentence-transformers` (adds ~550MB torch).  
Your embeddings.py code will auto-detect it.

---

## 🔧 Common Tasks

### Reset Database
```bash
# Local
python manage.py flush

# Docker
docker compose down -v && docker compose up
```

### Pull New Ollama Model
```bash
# Local
ollama pull llama2

# Docker
docker exec musclemax_ollama ollama pull llama2
```

Then update `OLLAMA_MODEL=llama2` in `.env`.

### View Migrations
```bash
python manage.py showmigrations
python manage.py migrate --plan
```

### Create Superuser
```bash
python manage.py createsuperuser
```

---

## 📊 Size Comparison

| Setup | Install Time | Disk Used |
|-------|--------------|-----------|
| Docker (lightweight) | 3-5 min | 500MB images |
| Local core | 2-3 min | 100MB |
| Local + embeddings | 10-15 min | 700MB |
| Local + embeddings + docker DB | 10-15 min | 1.2GB total |

**Recommendation:** Start with lightweight local (`requirements.txt`). Add embeddings only if needed.

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'sentence_transformers'"
This is expected with `requirements.txt` (lightweight).
- **Fix:** Install full version: `pip install -r requirements-local-full.txt`
- OR keep lightweight and skip embeddings features

### "Connection refused: localhost:5432"
PostgreSQL not running.
- Start local: `brew services start postgresql` (macOS)
- OR use Docker: `docker run -d ... pgvector/pgvector:pg16`

### "Connection refused: localhost:11434"
Ollama not running.
- Start local: `ollama serve`
- OR use Docker: `docker run -d ... ollama/ollama`

### "Port 8000 already in use"
```bash
# Kill process using port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 📚 Docs

- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Ollama: https://ollama.ai/
- Docker: https://docs.docker.com/

---

**Status:** ✅ Ready to use locally (lightweight) or via Docker (all-in-one)
