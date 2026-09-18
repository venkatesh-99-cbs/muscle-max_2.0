# Muscle Max — Single Full-Build Prompt

One prompt, for one AI coding assistant (Claude Code or similar) with
repo access, to build the entire product end-to-end: frontend, backend,
database, and a RAG chatbot that answers only from real business data.
Use this instead of splitting work across the per-member prompts when
one person/agent is building the whole thing solo.

```
You are building Muscle Max end-to-end: a Django + DRF + PostgreSQL
backend, a React + Vite frontend, and a RAG-powered chatbot — inside
this existing repo. Don't restructure the folders in README.md and
docs/ARCHITECTURE.md; fill them in.

Read these first, in order, before writing any code:
- README.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/API_WORKFLOW.md
- docs/RAG_PIPELINE.md
- docs/CODING_STANDARDS.md
- business-data/README.md

=====================================================================
STOP CONDITION — read this before touching business-data/
=====================================================================
Every file in business-data/ (products.json, faqs.json, policies.json,
business-info.json) is currently a TEMPLATE — prices are "TBD" and the
descriptions are generic supplement-industry text, not this specific
business's real information.

The chatbot's entire value is that it answers ONLY from real data and
says "I don't know" otherwise — a chatbot grounded in placeholder data
would confidently answer with fake prices and fake facts, which is the
exact failure mode this project has to avoid.

So: if any "TBD" fields are still present in business-data/ when you
reach the chatbot-testing step below, STOP and say so explicitly
instead of proceeding — don't silently ship a chatbot grounded in
placeholder data, and don't invent real-looking numbers to fill the
gaps yourself. Building the pipeline against the templates is fine;
letting it answer real customer questions from them is not.
=====================================================================

Build in this order — each stage should be working and testable before
you move to the next one:

## Stage 1 — Database & models

1. Implement the models in docs/DATABASE_SCHEMA.md across apps/accounts,
   apps/products, apps/cart, apps/orders (apps/chatbot's models —
   BusinessInfo, KnowledgeChunk — already exist, don't touch their
   shape without checking docs/RAG_PIPELINE.md first).
2. Run makemigrations/migrate, register every model in its app's
   admin.py, verify each one is visible and editable in Django admin.

## Stage 2 — Backend APIs

Implement every endpoint in docs/API_WORKFLOW.md exactly as specified
(field names, status codes) — the frontend in Stage 4 is built against
this contract:
- accounts: register, login, token refresh, /me
- products: list (search + category filter), detail
- cart: get/add/update/remove, scoped to the authenticated user
- orders: create from cart, list, detail, admin status update

Test every endpoint yourself (DRF browsable API or curl) before moving
on — register, login, list/get products, cart add/update/remove,
create order, get order, admin status update. Don't build the frontend
against an endpoint you haven't verified works.

## Stage 3 — Load real business data

1. If business-data/*.json still has "TBD" fields, pause and flag it
   per the STOP CONDITION above rather than continuing past it.
2. Once the data is real: `python manage.py load_business_data` (loads
   products.json into Product/Category) then
   `python manage.py load_business_info` (loads faqs/policies/
   business-info into BusinessInfo).
3. Confirm in Django admin that the loaded products and business info
   match what's actually in the JSON files — no dropped fields, no
   truncation.

## Stage 4 — Frontend

Build the full customer site in frontend/, screen by screen, each one
working against the real backend from Stage 2 (not mock data — the
backend is already real by this point, so don't introduce a second,
throwaway data shape):
1. Layout — Navbar, Footer.
2. Home — hero, categories, featured products, CTA.
3. Product listing — cards, search, category filter, price.
4. Product detail — images, price, description, quantity, Add to Cart.
5. Cart — items, quantity edit, remove, subtotal/total, Checkout.
6. Checkout — customer info, address, order summary, Place Order.
7. Auth — Login, Register, logout, persisted session.
8. My Orders — list + detail with status.
9. Chat widget — floating button, message thread, calls
   POST /api/chatbot/ask/ (built in Stage 5), renders the "I don't
   know" fallback with the same styling as a normal answer, not as an
   error state.

Keep it responsive — this gets demoed on a phone. All HTTP calls go
through src/services/*Api.js, never axios/fetch directly in a
component. Skip wishlist, reviews, loyalty, recommendations, and a
payment gateway — out of scope for this MVP.

## Stage 5 — RAG chatbot, grounded in the real data only

Everything here lives in apps/chatbot/ — see docs/RAG_PIPELINE.md for
the full file-by-file breakdown (embeddings.py, llm_client.py,
generator.py, retriever.py, ingest.py already exist as a working
pipeline; you're pointing it at real data, not rebuilding it):

1. `python manage.py ingest_knowledge_base` — embeds the real Product
   and BusinessInfo rows from Stage 3 into KnowledgeChunk (pgvector).
2. Confirm generator.py's system prompt still enforces: answer ONLY
   from the retrieved context, never fall back to general/outside
   knowledge, and reply with the exact "I don't know based on the
   available Muscle Max information" line when the context doesn't
   contain the answer. Do not weaken this instruction for the sake of
   getting more questions answered — an "I don't know" is the correct,
   graded-as-correct behavior for out-of-scope questions.
3. Confirm OPENROUTER_API_KEY, OPENROUTER_PRIMARY_MODEL, and the
   fallback models are set in backend/.env (never hardcoded, never
   sent to the frontend) — see docs/RAG_PIPELINE.md for how the
   primary → fallback → free-model chain works.

Test with real questions the judges are likely to ask, using the real
data now loaded:
- A real product's real price ("How much is [real product name]?")
- A category question ("What protein products do you have?")
- A real FAQ/policy question ("What's your return policy?" /
  "Do you deliver to [some area]?")
- At least 3 deliberately out-of-scope questions the business data
  genuinely doesn't cover — every one of these MUST return the
  "I don't know" fallback. If any of them produce a confident but
  unsupported answer, that's a grounding failure — tighten the prompt
  or the retrieval threshold in retriever.py before moving on, don't
  ship it.
- A couple of "other important questions" a real customer would ask
  that aren't pure product lookups — e.g. "can I take these together?",
  "is this safe for someone under 18?", "what's similar to X?" — these
  should be answered directly if the loaded FAQ/product data covers
  them, and fall back honestly if it doesn't.

## Stage 6 — Full end-to-end pass

Once all five stages are done, do one clean run-through as a real user
would, on the deployed or fully-running local stack, not a partial
manual check:

Open site → Register → Login → Browse → Search → Product detail →
Add to cart → Checkout → Place order → confirm the order appears in
Django admin → change its status in admin → confirm the status change
is visible to the customer → open the chat widget → ask a known
question → ask an out-of-scope question and confirm the honest
"I don't know" response.

Report back clearly: what's fully working, what's still stubbed, and
whether any business-data fields are still "TBD" and blocking the
chatbot from being demo-ready with real answers.
```
