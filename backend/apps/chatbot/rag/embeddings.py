"""Ollama-backed embeddings with compatibility for current and legacy APIs."""
import requests
from django.conf import settings

EMBEDDING_DIMENSIONS = 768
OLLAMA_HOST = getattr(settings, "OLLAMA_HOST", "http://localhost:11434")
OLLAMA_EMBED_MODEL = getattr(settings, "OLLAMA_EMBED_MODEL", "nomic-embed-text")


def embed_text(text: str) -> list[float]:
    return embed_texts([text])[0]


def _validate_embeddings(embeddings: list[list[float]], expected_count: int) -> list[list[float]]:
    if len(embeddings) != expected_count or any(
        len(embedding) != EMBEDDING_DIMENSIONS for embedding in embeddings
    ):
        raise RuntimeError(
            f"{OLLAMA_EMBED_MODEL} must return {expected_count} embeddings of "
            f"{EMBEDDING_DIMENSIONS} dimensions."
        )
    return embeddings


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed text in a batch, while supporting older Ollama installations."""
    if not texts:
        return []

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/embed",
            json={"model": OLLAMA_EMBED_MODEL, "input": texts},
            timeout=120,
        )
        if response.status_code == 404:
            embeddings = []
            for text in texts:
                legacy_response = requests.post(
                    f"{OLLAMA_HOST}/api/embeddings",
                    json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
                    timeout=120,
                )
                legacy_response.raise_for_status()
                embeddings.append(legacy_response.json()["embedding"])
            return _validate_embeddings(embeddings, len(texts))

        response.raise_for_status()
        return _validate_embeddings(response.json()["embeddings"], len(texts))
    except (KeyError, TypeError, requests.RequestException) as exc:
        raise RuntimeError(
            f"Failed to embed text with {OLLAMA_EMBED_MODEL}: {exc}. "
            "Confirm that Ollama is running and the embedding model is installed."
        ) from exc
