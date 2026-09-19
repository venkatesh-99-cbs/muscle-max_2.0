"""
Grounded hybrid retrieval for the Muscle Max knowledge base.
Combines semantic vector search (via pgvector) with lexical keyword matching,
with automatic fallback and query intent classification.

Domain Guard design:
  - Queries with NO supplement/fitness/store keywords are blocked from
    retrieval immediately (e.g. "who is ranga?" → FALLBACK_ANSWER).
  - Even if vector search returns some results, a dual confidence check
    (distance threshold + keyword match) must pass or we return empty chunks.
"""
import logging
import re
from typing import Optional

from django.db.models import Q

from apps.chatbot.models import KnowledgeChunk
from apps.chatbot.rag.embeddings import embed_text

logger = logging.getLogger("chatbot.retriever")

# Cosine distance threshold — lower = stricter.
# 0.55 rejects unrelated queries. Typical supplement queries score < 0.40.
MAX_DISTANCE = 0.55

# If the BEST semantic match is still this far, treat as likely off-topic
# (unless keyword search independently confirms domain relevance).
MIN_STRONG_DISTANCE = 0.45

_STOP_WORDS = {
    "about", "after", "and", "are", "can", "for", "from", "have", "how",
    "the", "this", "what", "with", "would", "you", "your", "does", "will",
    "should", "tell", "give", "some", "more", "much", "many", "their",
    "use", "using", "get", "all", "any", "its", "who", "is", "was", "been",
    "that", "then", "there", "them", "they", "just", "also",
}

# At least ONE of these must appear in the query for keyword retrieval to run.
_DOMAIN_KEYWORDS = {
    # Product names / types
    "protein", "whey", "creatine", "preworkout", "pre-workout", "workout",
    "supplement", "supplements", "vitamin", "vitamins", "amino", "bcaa", "bcaas",
    "casein", "gainer", "gainers", "mass", "recovery", "nutrition", "isolate",
    "concentrate", "omega", "multivitamin", "multivitamins", "bar", "bars",
    "powder", "capsule", "capsules", "tablet", "tablets", "formula",
    "citrulline", "beta", "alanine", "glutamine", "shaker", "peanut", "butter",
    "fish", "oil", "omega-3", "electrolyte", "electrolytes", "hydration",
    "snack", "snacks", "cookie", "cookies", "booster", "testosterone",
    # Brand context
    "muscle", "musclemax", "brand",
    # Store / catalog / shopping
    "product", "products", "catalog", "catalogue", "price", "prices", "pricing",
    "order", "orders", "ship", "shipping", "delivery", "return", "returns",
    "refund", "refunds", "policy", "policies", "payment", "payments", "support",
    "contact", "store", "buy", "purchase", "cart", "checkout", "track", "tracking",
    "discount", "discounts", "coupon", "coupons", "offer", "offers", "sale",
    "stock", "available", "availability", "authentic", "genuine", "original",
    # Health / fitness / usage
    "dosage", "dose", "serving", "servings", "scoop", "scoops", "ingredient",
    "ingredients", "benefit", "benefits", "effect", "effects", "side", "safe",
    "safety", "allergy", "allergies", "allergic", "vegan", "vegetarian",
    "fitness", "gym", "training", "strength", "weight", "fat", "lean",
    "bulk", "bulking", "cut", "cutting", "endurance", "energy", "stamina",
    "diet", "timing", "stack", "stacking", "caffeine", "stimulant", "sleep",
    "recommend", "recommendation", "compare", "comparison", "difference",
}

_GREETINGS = {
    "hi", "hello", "hey", "hey there", "good morning", "good afternoon",
    "good evening", "howdy", "sup", "hola", "namaste", "greetings",
    "hi there", "hello there",
}

_THANKS = {
    "thanks", "thank you", "thank you so much", "thx", "appreciate it",
    "ty", "thank u",
}

_FAREWELLS = {
    "bye", "goodbye", "see you", "cya", "have a good day", "take care",
    "later", "good night", "see ya",
}

_BOT_IDENTITY_QUESTIONS = {
    "who are you", "what are you", "what can you do", "help",
    "how can you help me", "what can you help with", "what do you know",
    "introduce yourself", "tell me about yourself", "who made you",
}

_SCOPE_QUESTIONS = {
    "what is muscle max", "what do you sell",
    "what products do you have", "what products are available",
    "tell me about muscle max", "about muscle max", "what is musclemax",
}


def _is_domain_relevant(query: str) -> bool:
    """
    Returns True if the query contains at least one Muscle Max domain keyword.
    Fast pre-filter — blocks clearly off-topic queries before retrieval.
    """
    q_lower = query.lower()
    return any(kw in q_lower for kw in _DOMAIN_KEYWORDS)


def classify_query(query: str) -> str:
    """
    Classifies user query into greeting, identity, thanks, farewell, scope, or standard.
    Uses word-boundary regex matching to avoid false positives (e.g. 'whey' matching 'hey').
    """
    normalized = re.sub(r"[^a-z0-9 ]", "", query.lower()).strip()
    words = normalized.split()

    # Exact matches for full query
    if normalized in _GREETINGS:
        return "greeting"
    if normalized in _THANKS:
        return "thanks"
    if normalized in _FAREWELLS:
        return "farewell"
    if normalized in _BOT_IDENTITY_QUESTIONS:
        return "identity"
    if normalized in _SCOPE_QUESTIONS:
        return "scope"

    # If the query is domain relevant (e.g. contains 'protein', 'whey', 'shipping'),
    # treat it as standard query even if it starts with 'hi' or 'hey'
    if _is_domain_relevant(query):
        return "standard"

    # Short queries only (<= 3 words) can match greeting / thanks / farewell phrases
    if len(words) <= 3:
        for phrase in _GREETINGS:
            if re.search(rf"\b{re.escape(phrase)}\b", normalized):
                return "greeting"
        for phrase in _THANKS:
            if re.search(rf"\b{re.escape(phrase)}\b", normalized):
                return "thanks"
        for phrase in _FAREWELLS:
            if re.search(rf"\b{re.escape(phrase)}\b", normalized):
                return "farewell"

    for phrase in _BOT_IDENTITY_QUESTIONS:
        if re.search(rf"\b{re.escape(phrase)}\b", normalized):
            return "identity"

    for phrase in _SCOPE_QUESTIONS:
        if re.search(rf"\b{re.escape(phrase)}\b", normalized):
            return "scope"

    return "standard"


def retrieve(query: str, top_k: int = 6) -> tuple[list[str], list[dict], str]:
    """
    Retrieves relevant knowledge chunks for a given user query.
    Returns: (chunk_texts, chunk_metadatas, intent)
    """
    intent = classify_query(query)

    # Auto-sync if the knowledge base is empty
    if not KnowledgeChunk.objects.exists():
        try:
            from apps.chatbot.rag.data_loader import sync_all_knowledge
            logger.info("Knowledge chunks empty; auto-syncing business data.")
            sync_all_knowledge()
        except Exception as exc:
            logger.error("Auto-sync failed in retriever: %s", exc)
            return [], [], intent

    # Conversational intents — no retrieval needed
    if intent in ("greeting", "identity", "thanks", "farewell"):
        return [], [], intent

    # ── Domain guard (Layer 1) ───────────────────────────────────────────────
    # Off-topic queries with no supplement/store keywords and no catalog matches
    # go straight to FALLBACK. "Who is ranga?" has no matches → returns [].
    if not _is_domain_relevant(query) and intent == "standard":
        if not bool(_keyword_search(query, top_k=1)):
            logger.info("Off-topic query (no domain keywords or catalog matches): %r", query)
            return [], [], intent
    # ────────────────────────────────────────────────────────────────────────

    chunks = []
    best_distance = 1.0

    # 1. Semantic vector search
    try:
        query_vector = embed_text(query)
        semantic_chunks = list(_similarity_search(query_vector, top_k))
        if semantic_chunks:
            best_distance = getattr(semantic_chunks[0], "distance", 1.0)
            chunks = semantic_chunks
    except Exception as exc:
        logger.warning("Vector search failed, using keyword fallback: %s", exc)

    # 2. Keyword search — fills gaps or acts as sole retrieval if vector fails
    if len(chunks) < top_k:
        needed = top_k - len(chunks)
        existing_ids = {c.id for c in chunks}
        keyword_matches = _keyword_search(query, top_k=needed, exclude_ids=existing_ids)
        chunks.extend(keyword_matches)

    # 3. Scope fallback — return overview chunks if still empty
    if intent == "scope" and not chunks:
        overview = KnowledgeChunk.objects.filter(
            Q(source_type="business_info") | Q(source_type="product")
        ).order_by("id")[:top_k]
        chunks = list(overview)

    # ── Domain guard (Layer 2) ───────────────────────────────────────────────
    # Even after retrieval: if the best semantic match is weak AND keyword
    # search returns nothing, treat the query as out-of-scope.
    if chunks and intent == "standard":
        kw_hit = bool(_keyword_search(query, top_k=1))
        if not kw_hit and best_distance >= MIN_STRONG_DISTANCE:
            logger.info(
                "Weak retrieval (dist=%.3f, no kw match) for %r — out-of-scope.",
                best_distance, query,
            )
            return [], [], intent
    # ────────────────────────────────────────────────────────────────────────

    chunk_texts = [c.text for c in chunks]
    chunk_metadatas = [
        {
            "id": c.source_id,
            "type": c.source_type,
            "title": c.metadata.get("name") or c.metadata.get("title") or c.source_id,
            "category": c.metadata.get("category", ""),
            "price": c.metadata.get("price", ""),
            "slug": c.metadata.get("slug", ""),
        }
        for c in chunks
    ]

    return chunk_texts, chunk_metadatas, intent


def _similarity_search(query_embedding: list[float], top_k: int):
    from pgvector.django import CosineDistance

    return (
        KnowledgeChunk.objects.annotate(
            distance=CosineDistance("embedding", query_embedding)
        )
        .filter(distance__lte=MAX_DISTANCE)
        .order_by("distance")[:top_k]
    )


def _keyword_search(query: str, top_k: int, exclude_ids: Optional[set] = None):
    """
    Keyword search on chunk text.
    Scores by term-match frequency for relevance ordering (not recency).
    """
    terms = [
        term for term in re.findall(r"[a-zA-Z0-9]{3,}", query.lower())
        if term not in _STOP_WORDS
    ][:8]
    if not terms:
        return []

    match_query = Q()
    for term in terms:
        match_query |= Q(text__icontains=term)

    qs = KnowledgeChunk.objects.filter(match_query)
    if exclude_ids:
        qs = qs.exclude(id__in=exclude_ids)

    candidates = list(qs[: top_k * 4])
    if not candidates:
        return []

    def _score(chunk: KnowledgeChunk) -> int:
        text_lower = chunk.text.lower()
        base_score = sum(1 for term in terms if term in text_lower)
        chunk_title = (chunk.metadata.get("name") or chunk.metadata.get("title") or "").lower()
        title_matches = sum(5 for term in terms if term in chunk_title)
        # Extra boost for exact product source chunks
        product_boost = 3 if chunk.source_type == "product" and any(t in chunk_title for t in terms) else 0
        return base_score + title_matches + product_boost

    candidates.sort(key=_score, reverse=True)
    return candidates[:top_k]
