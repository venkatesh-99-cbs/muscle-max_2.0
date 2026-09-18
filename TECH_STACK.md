# Muscle Max 2.0 — Your Complete Tech Stack

Your project is now fully set up with your preferred dependencies:

## ✅ Stack Confirmed

### Backend Dependencies
```
Django 5.0.6 + DRF (REST API framework)
SQLAlchemy 2.0.36 + Alembic 1.14.0 (Advanced ORM & migrations)
PostgreSQL 16 with psycopg2
GeoAlchemy2 (Geospatial support)

RAG/AI:
  - ChromaDB (Vector database)
  - Sentence-Transformers (Embeddings)
  - Ollama (Local LLM)
```

### Frontend
```
React 18.3 + Vite (Modern dev server)
React Router (Navigation)
Axios (API client)
```

### Docker
```
PostgreSQL 16 with pgvector
Ollama (Local AI model)
All containerized & orchestrated
```

---

## 🚀 Quick Start

### Docker (All-in-One)
```bash
run_docker.bat    # Windows
./run_docker.sh   # macOS/Linux
```
✅ Built, tested & ready  
✅ All services: frontend, backend, database, Ollama  
✅ No local setup needed

### Local Development

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt          # ~2-3 min
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps           # ~1 min
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 📦 Requirement Files

| File | Use Case | Size |
|------|----------|------|
| `backend/requirements.txt` | **Local dev** with full RAG/AI features | ~1GB (includes torch) |
| `backend/requirements-prod.txt` | **Docker** lightweight production | ~300MB (no torch) |

**Docker uses `requirements-prod.txt`** → no heavy ML libs in container  
**Local uses `requirements.txt`** → full embeddings, RAG, AI capabilities

---

## 🗄️ Database Setup

### Option 1: PostgreSQL Locally
```bash
# macOS
brew install postgresql; brew services start postgresql

# Linux
sudo apt install postgresql; sudo systemctl start postgresql
```

### Option 2: Docker PostgreSQL (easiest)
```bash
docker run -d \
  --name musclemax_db \
  -e POSTGRES_PASSWORD=musclemax \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

---

## 🤖 Ollama Setup

### Option 1: Local Install
```bash
# Download from https://ollama.ai
ollama serve &
ollama pull mistral    # Or: llama2, neural-chat, etc.
```

### Option 2: Docker
```bash
docker run -d \
  --name musclemax_ollama \
  -p 11434:11434 \
  ollama/ollama:latest

docker exec musclemax_ollama ollama pull mistral
```

---

## 🔧 Environment Variables

**backend/.env:**
```env
DJANGO_SECRET_KEY=dev-key-change-in-prod
DJANGO_DEBUG=True
POSTGRES_HOST=localhost    # 'db' in Docker
POSTGRES_USER=musclemax
POSTGRES_PASSWORD=musclemax
POSTGRES_DB=musclemax

OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
```

---

## ✨ Features Ready to Build

✅ **REST API** — Django + DRF with JWT auth  
✅ **Database** — PostgreSQL with advanced ORM (SQLAlchemy + Alembic)  
✅ **Geospatial** — GeoAlchemy2 for location-based queries  
✅ **Vector Search** — ChromaDB for semantic search  
✅ **Embeddings** — Sentence-Transformers (384-dim vectors)  
✅ **Local LLM** — Ollama with mistral/llama2/neural-chat  
✅ **Frontend** — React + Vite + React Router  
✅ **Docker** — Full containerization for team/prod  

---

## 🔨 Next Steps

1. **Start Ollama** (local or Docker)
2. **Start PostgreSQL** (local or Docker)
3. **Run Docker Compose** OR **run local scripts**
4. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```
5. **Access Django admin:** http://localhost:8000/admin
6. **Access frontend:** http://localhost:5173

---

## 📚 Tech Docs

- **Django/DRF:** https://www.django-rest-framework.org/
- **SQLAlchemy:** https://docs.sqlalchemy.org/
- **ChromaDB:** https://docs.trychroma.com/
- **Ollama:** https://ollama.ai/
- **React/Vite:** https://vitejs.dev/
- **Docker:** https://docs.docker.com/

---

## 🎯 Status

✅ Backend: Django 5.0 + DRF + SQLAlchemy + Chromadb + Ollama  
✅ Frontend: React 18 + Vite  
✅ Database: PostgreSQL 16 + pgvector  
✅ Docker: Fully containerized  
✅ Environment: Local & Docker ready  

**Ready to build! 🚀**
