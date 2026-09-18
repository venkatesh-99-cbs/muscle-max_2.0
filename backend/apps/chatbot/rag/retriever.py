"""
Embeds the incoming question and does a pgvector similarity search
against KnowledgeChunk, returning the top-k chunks above a similarity
threshold (below the threshold, generator.py treats it as "no context"
and returns the "I don't know" fallback).
"""
from apps.chatbot.models import KnowledgeChunk
from apps.chatbot.rag.embeddings import embed_text

# Cosine distance (pgvector's <=>) — lower is more similar. Tune this
# once you've seen real question/answer behavior.
MAX_DISTANCE = 0.6


def retrieve(query: str, top_k: int = 5) -> list[str]:
    query_embedding = embed_text(query)
    chunks = _similarity_search(query_embedding, top_k)
    return [chunk.text for chunk in chunks]


def _similarity_search(query_embedding: list[float], top_k: int):
    from pgvector.django import CosineDistance

    return (
        KnowledgeChunk.objects.annotate(distance=CosineDistance("embedding", query_embedding))
        .filter(distance__lte=MAX_DISTANCE)
        .order_by("distance")[:top_k]
    )
