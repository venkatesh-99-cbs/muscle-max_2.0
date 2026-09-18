# RAG Pipeline

Owned by whoever is assigned `apps/chatbot/` (see `TASK_DIVISION.md`).
Lives entirely under `backend/apps/chatbot/`.

## Files

| File                          | Responsibility                                                       |
|--------------------------------|-----------------------------------------------------------------------|
| `rag/embeddings.py`            | One function wrapping the embedding model — nothing else touches the vendor SDK directly |
| `rag/ingest.py`                | Loads products + business info → chunks → embeds → stores in pgvector |
| `rag/retriever.py`              | Embeds a question, does a similarity search, returns top-k chunks     |
| `rag/generator.py`              | Builds the grounded prompt, calls the LLM, returns the answer         |
| `management/commands/ingest_knowledge_base.py` | CLI: `python manage.py ingest_knowledge_base`         |
| `models.py`                    | `KnowledgeChunk` model (source type, source id, text, embedding vector, metadata) |
| `views.py`                     | `POST /api/chatbot/ask/` — wires retriever → generator → response     |

## Data that gets embedded

- Every product: name, description, price, specs → one or more chunks.
- Business info entered via Django admin: return policy, delivery info,
  store locations, FAQs → stored as their own model, chunked the same way.

## Ingestion flow

```
Product / BusinessInfo rows
        │
        ▼
  chunk into ~200-400 token pieces
        │
        ▼
  embed each chunk (embeddings.py)
        │
        ▼
  upsert into KnowledgeChunk (pgvector column)
```

Run after any bulk data change: `python manage.py ingest_knowledge_base`.

## Answering flow (the `/chatbot/ask/` endpoint)

```
question
   │
   ▼
embed question (embeddings.py)
   │
   ▼
similarity search in KnowledgeChunk (retriever.py, top_k=5)
   │
   ▼
similarity above threshold?
   │            │
  yes           no
   │            │
   ▼            ▼
build prompt   return fallback:
with context   "I don't know based on
   │           the available Muscle Max
   ▼           information." (grounded=false)
call LLM (generator.py)
   │
   ▼
return {answer, sources, grounded=true}
```

## The grounding rule — non-negotiable for this project

The system prompt sent to the LLM in `generator.py` must instruct it to:
1. Answer using **only** the provided context chunks.
2. Not use outside/general knowledge to fill gaps.
3. Explicitly say it doesn't know when the context doesn't contain the
   answer, rather than guessing.

This is what the project brief calls out as a judging point — a wrong
but confident answer is worse than a correct "I don't know."

## LLM provider: OpenRouter, with automatic fallback

Chat completions go through `apps/chatbot/llm_client.py`, which tries
`OPENROUTER_PRIMARY_MODEL`, then each model in
`OPENROUTER_FALLBACK_MODELS` in order, then
`OPENROUTER_FREE_FALLBACK_MODEL` as a last resort — moving to the next
model whenever one is rate-limited, out of quota, unavailable, or
errors out. All model names and the API key live in `.env`
(`backend/.env.example` has the variables); nothing is hardcoded, and
the key is never sent to or logged by the frontend — the React app only
ever calls our own `POST /api/chatbot/ask/`.

If every candidate model fails, `generate_answer()` returns a friendly
error message with `grounded: false` instead of raising — the endpoint
never 500s just because every LLM happened to be down. See
`apps/chatbot/tests/test_llm_fallback.py` for a test that mocks a
rate-limited primary model and asserts the client falls through to the
next one.

## Embeddings: local, not OpenRouter

OpenRouter is a chat-completion router only — it doesn't serve
embeddings — so `apps/chatbot/rag/embeddings.py` runs a local
`sentence-transformers` model (`all-MiniLM-L6-v2` by default, no API
key needed). `KnowledgeChunk.embedding` is sized to match
(384 dimensions) — if you change `EMBEDDING_MODEL` to a model with a
different output size, update `EMBEDDING_DIMENSIONS` in
`embeddings.py` and re-run migrations.

## Getting real data into the knowledge base

1. Edit `business-data/products.json`, `faqs.json`, `policies.json`,
   `business-info.json` (see `business-data/README.md` — replace every
   `"TBD"` with verified real data before this goes live).
2. `python manage.py load_business_data` — loads products.json into
   the `Product`/`Category` tables.
3. `python manage.py load_business_info` — loads faqs/policies/
   business-info into `BusinessInfo`.
4. `python manage.py ingest_knowledge_base` — (re)embeds everything
   into `KnowledgeChunk`.

Re-run steps 2–4 (or just the relevant one) any time the business data
changes.

## Testing the pipeline manually

```bash
docker compose exec backend python manage.py load_business_data
docker compose exec backend python manage.py load_business_info
docker compose exec backend python manage.py ingest_knowledge_base
curl -X POST http://localhost:8000/api/chatbot/ask/ \
  -H "Content-Type: application/json" \
  -d '{"question": "How much is the whey protein?"}'
docker compose exec backend python manage.py test apps.chatbot.tests.test_llm_fallback
```
