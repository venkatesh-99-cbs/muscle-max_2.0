"""
Wraps the embedding model behind one function so nothing else in this
app touches the model library directly.

Uses a local sentence-transformers model (free, no API key needed) —
OpenRouter is a chat-completion router only and does not serve
embeddings, so this is intentionally a separate, local dependency from
llm_client.py.
"""
from functools import lru_cache

from django.conf import settings

EMBEDDING_DIMENSIONS = 384  # must match the model below (all-MiniLM-L6-v2)


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_text(text: str) -> list[float]:
    return _model().encode(text, normalize_embeddings=True).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    return _model().encode(texts, normalize_embeddings=True).tolist()
