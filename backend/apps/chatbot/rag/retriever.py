"""
Grounded hybrid retrieval for the Muscle Max knowledge base.
Combines semantic vector search (via pgvector) with lexical keyword matching,
with automatic fallback and query intent classification.
"""
import logging
import re
from typing import Optional

from django.db.models import Q

from apps.chatbot.models import KnowledgeChunk
from apps.chatbot.rag.embeddings import embed_text

logger = logging.getLogger("chatbot.retriever")

MAX_DISTANCE = 0.85
_STOP_WORDS = {
    "about", "after", "and", "are", "can", "for", "from", "have", "how",
    "the", "this", "what", "with", "would", "you", "your", "does", "will",
    "should", "tell", "give", "some", "more", "much", "many", "their"
}

_GREETINGS = {
    "hi", "hello", "hey", "hey there", "good morning", "good afternoon",
    "good evening", "howdy", "sup", "hola", "namaste", "greetings"
}

_THANKS = {
    "thanks", "thank you", "thank you so much", "thx", "appreciate it"
}

_FAREWELLS = {
    "bye", "goodbye", "see you", "cya", "have a good day", "take care"
}

_SCOPE_QUESTIONS = {
    "who are you", "what are you", "what can you do", "help",
    "how can you help me", "what is muscle max", "what do you sell",
    "what products do you have", "what products are available", "tell me about muscle max"
}


def classify_query(query: str) -> str:
    """Classifies user query into greeting, thanks, farewell, scope, or standard."""
    normalized = re.sub(r"[^a-z0-9 ]", "", query.lower()).strip()
    if normalized in _GREETINGS:
        return "greeting"
    if normalized in _THANKS:
        return "thanks"
    if normalized in _FAREWELLS:
        return "farewell"
    if normalized in _SCOPE_QUESTIONS:
        return "scope"
    return "standard"


def retrieve(query: str, top_k: int = 5) -> tuple[list[str], list[dict], str]:
    """
    Retrieves relevant knowledge chunks for a given user query.
    Returns:
        (chunk_texts, chunk_metadatas, intent)
    """
    intent = classify_query(query)

    # Ensure knowledge base is populated
    if not KnowledgeChunk.objects.exists():
        try:
            from apps.chatbot.rag.data_loader import sync_all_knowledge
            logger.info("Knowledge chunks empty; auto-syncing business data.")
            sync_all_knowledge()
        except Exception as exc:
            logger.error("Auto-sync failed in retriever: %s", exc)
            return [], [], intent

    # Greetings and farewells do not require heavy retrieval
    if intent in ("greeting", "thanks", "farewell"):
        return [], [], intent

    chunks = []

    # 1. Semantic vector search
    try:
        query_vector = embed_text(query)
        chunks = list(_similarity_search(query_vector, top_k))
    except Exception as exc:
        logger.warning("Vector search failed or unavailable, falling back to keyword search: %s", exc)

    # 2. Hybrid / Keyword search supplement or fallback
    if len(chunks) < top_k:
        needed = top_k - len(chunks)
        existing_ids = {c.id for c in chunks}
        keyword_matches = _keyword_search(query, top_k=needed, exclude_ids=existing_ids)
        chunks.extend(keyword_matches)

    # If it's a scope question and we still have no chunks, fetch overview
    if intent == "scope" and not chunks:
        overview_chunks = KnowledgeChunk.objects.filter(
            Q(source_type="business_info") | Q(source_type="product")
        ).order_by("id")[:top_k]
        chunks = list(overview_chunks)

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
        KnowledgeChunk.objects.annotate(distance=CosineDistance("embedding", query_embedding))
        .filter(distance__lte=MAX_DISTANCE)
        .order_by("distance")[:top_k]
    )


def _keyword_search(query: str, top_k: int, exclude_ids: Optional[set] = None):
    """Exact and partial term search for products, FAQs, and policies."""
    terms = [term for term in re.findall(r"[a-zA-Z0-9]{3,}", query.lower()) if term not in _STOP_WORDS][:6]
    if not terms:
        return []

    match_query = Q()
    for term in terms:
        match_query |= Q(text__icontains=term) | Q(metadata__icontains=term)

    qs = KnowledgeChunk.objects.filter(match_query)
    if exclude_ids:
        qs = qs.exclude(id__in=exclude_ids)

    return list(qs.order_by("-updated_at")[:top_k])
