"""
RAG-based chatbot using Ollama local models.

Chat model: qwen2.5:3b (your model)
Embedding model: nomic-embed-text (your model)

No API keys required — everything runs locally.
"""
import logging
from django.conf import settings
import requests

logger = logging.getLogger("chatbot.llm")

OLLAMA_HOST = getattr(settings, "OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = getattr(settings, "OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA_EMBED_MODEL = getattr(settings, "OLLAMA_EMBED_MODEL", "nomic-embed-text")
REQUEST_TIMEOUT_SECONDS = 120


class AllModelsFailedError(Exception):
    """Raised when the model fails."""


class _RetryableModelError(Exception):
    """Internal signal: the model failed."""


def _call_ollama(model: str, messages: list[dict]) -> str:
    """Call local Ollama instance with your model."""
    url = f"{OLLAMA_HOST}/api/chat"

    try:
        response = requests.post(
            url,
            json={"model": model, "messages": messages, "stream": False},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise _RetryableModelError(
            f"network error connecting to {OLLAMA_HOST}: {type(exc).__name__}"
        ) from exc

    if response.status_code != 200:
        raise _RetryableModelError(f"http {response.status_code}: {response.text}")

    try:
        data = response.json()
        return data["message"]["content"]
    except (KeyError, ValueError) as exc:
        raise _RetryableModelError(f"unexpected response shape: {exc}") from exc


def chat_with_fallback(messages: list[dict]) -> tuple[str, str]:
    """
    Chat using your local Ollama model (qwen2.5:3b).

    Returns (answer_text, model_used).
    Raises AllModelsFailedError if the model fails.
    """
    model = OLLAMA_MODEL

    try:
        answer = _call_ollama(model, messages)
    except _RetryableModelError as exc:
        logger.error("chatbot llm ollama failed model=%s reason=%s", model, exc)
        raise AllModelsFailedError(str(exc))

    logger.info("chatbot llm model selected model=%s host=%s", model, OLLAMA_HOST)
    return answer, model


def get_embedding_model():
    """Get embedding model name (nomic-embed-text)."""
    return OLLAMA_EMBED_MODEL
