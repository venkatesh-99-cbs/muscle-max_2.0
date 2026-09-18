"""Grounded retrieval for the Muscle Max knowledge base."""
import re

from django.db.models import Q

from apps.chatbot.models import KnowledgeChunk
from apps.chatbot.rag.embeddings import embed_text

MAX_DISTANCE = 0.8
_STOP_WORDS = {"about", "after", "and", "are", "can", "for", "from", "have", "how", "the", "this", "what", "with", "would", "you", "your"}
_SMALL_TALK = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "what can you help with", "what can you do"}


def is_greeting_or_scope_question(query: str) -> bool:
    normalized = re.sub(r"[^a-z ]", "", query.lower()).strip()
    return normalized in _SMALL_TALK


def retrieve(query: str, top_k: int = 5) -> list[str]:
    if is_greeting_or_scope_question(query) or not KnowledgeChunk.objects.exists():
        return []

    chunks = list(_similarity_search(embed_text(query), top_k))
    if not chunks:
        chunks = _keyword_search(query, top_k)
    return [chunk.text for chunk in chunks]


def _similarity_search(query_embedding: list[float], top_k: int):
    from pgvector.django import CosineDistance

    return (
        KnowledgeChunk.objects.annotate(distance=CosineDistance("embedding", query_embedding))
        .filter(distance__lte=MAX_DISTANCE)
        .order_by("distance")[:top_k]
    )


def _keyword_search(query: str, top_k: int):
    """Conservative exact-term fallback for product and policy names."""
    terms = [term for term in re.findall(r"[a-zA-Z0-9]{3,}", query.lower()) if term not in _STOP_WORDS][:6]
    if not terms:
        return []

    match_query = Q()
    for term in terms:
        match_query |= Q(text__icontains=term)
    return list(KnowledgeChunk.objects.filter(match_query).order_by("-updated_at")[:top_k])
