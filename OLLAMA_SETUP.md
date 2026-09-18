# Quick Start — Using Your Ollama Models

Your models are already ready:
- **qwen2.5:3b** — Chat model (1.9 GB)
- **nomic-embed-text** — Embeddings (274 MB)

## ⚡ Docker + Your Local Ollama

### 1. Start Ollama (keep running)
```bash
ollama serve
```

### 2. Run Docker Compose
```bash
docker compose up --build
```

Docker containers will connect to your local Ollama on `http://host.docker.internal:11434`

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 💻 Local Development

### 1. Start Ollama
```bash
ollama serve
```

### 2. Terminal 1 — Backend
```bash
cd backend
pip install -r requirements-lite.txt  # Or requirements.txt if Python 3.12
python manage.py migrate
python manage.py runserver
```

### 3. Terminal 2 — Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 🔍 Verify Setup

### Check Ollama is running
```bash
curl http://localhost:11434/api/tags
```

Should return your models:
```json
{
  "models": [
    {
      "name": "qwen2.5:3b:latest",
      "size": 1900000000
    },
    {
      "name": "nomic-embed-text:latest",
      "size": 274000000
    }
  ]
}
```

### Check backend can reach Ollama
```bash
python manage.py shell
>>> from apps.chatbot.llm_client import chat_with_fallback
>>> chat_with_fallback([{"role": "user", "content": "Hello"}])
```

Should return a response from qwen2.5:3b.

### Check embeddings work
```bash
python manage.py shell
>>> from apps.chatbot.rag.embeddings import embed_text
>>> embed_text("test")
# Should return 768-dim vector
```

---

## 🎯 Your RAG Chatbot Setup

**Chat:** qwen2.5:3b (local, fast)  
**Embeddings:** nomic-embed-text (via Ollama /api/embeddings)  
**Vector DB:** ChromaDB  
**Database:** PostgreSQL  

Everything runs locally — no API costs, full privacy.

---

## 📝 Environment

**Docker automatically uses:** `http://host.docker.internal:11434`  
**Local development uses:** `http://localhost:11434`

Both point to your local Ollama instance.

---

**Ready? Run `ollama serve` then `docker compose up`** 🚀
