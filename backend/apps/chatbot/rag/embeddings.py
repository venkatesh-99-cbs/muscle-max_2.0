"""
Embeddings using Ollama nomic-embed-text model.

Local embeddings — no API key needed, runs via Ollama.
Uses your nomic-embed-text model running in Ollama.
"""
import requests
from django.conf import settings

# nomic-embed-text outputs 768-dim vectors (fixed)
EMBEDDING_DIMENSIONS = 768

OLLAMA_HOST = getattr(settings, "OLLAMA_HOST", "http://localhost:11434")
OLLAMA_EMBED_MODEL = getattr(settings, "OLLAMA_EMBED_MODEL", "nomic-embed-text")


def embed_text(text: str) -> list[float]:
    """Embed a single text string using Ollama."""
    return embed_texts([text])[0]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed multiple texts using Ollama nomic-embed-text."""
    embeddings = []

    for text in texts:
        try:
            response = requests.post(
                f"{OLLAMA_HOST}/api/embeddings",
                json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
                timeout=120,
            )
            response.raise_for_status()
            data = response.json()
            embeddings.append(data["embedding"])
        except Exception as e:
            raise RuntimeError(
                f"Failed to embed text with {OLLAMA_EMBED_MODEL}: {e}\n"
                f"Make sure Ollama is running: ollama serve\n"
                f"And model is pulled: ollama pull {OLLAMA_EMBED_MODEL}"
            )

    return embeddings
