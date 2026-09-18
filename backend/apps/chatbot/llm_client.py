"""
OpenRouter chat-completion client with automatic model fallback.

Tries OPENROUTER_PRIMARY_MODEL first, then each model in
OPENROUTER_FALLBACK_MODELS (in order), then OPENROUTER_FREE_FALLBACK_MODEL
as a last resort — moving to the next candidate whenever a model is
rate-limited, out of quota, unavailable, or errors out.

Only this module talks to OpenRouter directly; generator.py calls
chat_with_fallback() and never touches the HTTP layer itself.

Logging: only the model name and failure *type* are logged — never the
API key, and never the customer's question or the generated answer.
"""
import logging

import requests
from django.conf import settings

logger = logging.getLogger("chatbot.llm")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 30

# Statuses that mean "this model isn't available right now" rather than
# "something is broken" — worth trying the next model for these.
RETRYABLE_STATUS_CODES = {429, 402, 500, 502, 503, 504}


class AllModelsFailedError(Exception):
    """Raised when every candidate model failed. Caller shows a friendly error."""


class _RetryableModelError(Exception):
    """Internal signal: this model failed in a way that justifies trying the next one."""


def _candidate_models() -> list[str]:
    """Primary -> configured fallbacks -> free fallback, de-duplicated, order preserved."""
    models = [settings.OPENROUTER_PRIMARY_MODEL, *settings.OPENROUTER_FALLBACK_MODELS]
    if settings.OPENROUTER_FREE_FALLBACK_MODEL not in models:
        models.append(settings.OPENROUTER_FREE_FALLBACK_MODEL)

    seen = set()
    ordered = []
    for model in models:
        if model and model not in seen:
            seen.add(model)
            ordered.append(model)
    return ordered


def _call_model(model: str, messages: list[dict]) -> str:
    """One attempt against one model. Raises _RetryableModelError on a fallback-worthy failure."""
    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": model, "messages": messages, "temperature": 0.2},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise _RetryableModelError(f"network error: {type(exc).__name__}") from exc

    if response.status_code in RETRYABLE_STATUS_CODES:
        raise _RetryableModelError(f"http {response.status_code}")
    response.raise_for_status()

    data = response.json()

    # OpenRouter sometimes returns 200 with an error payload (e.g. no
    # capacity currently on a free-tier model) — treat that as retryable.
    if "error" in data:
        raise _RetryableModelError(f"api error: {data['error'].get('code', 'unknown')}")

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise _RetryableModelError("unexpected response shape") from exc


def chat_with_fallback(messages: list[dict]) -> tuple[str, str]:
    """
    Sends `messages` (OpenAI-style [{"role": ..., "content": ...}, ...])
    to the first candidate model that succeeds.

    Returns (answer_text, model_used).
    Raises AllModelsFailedError if every candidate model failed.
    """
    last_failure_reason = "no candidate models configured"

    for model in _candidate_models():
        try:
            answer = _call_model(model, messages)
        except _RetryableModelError as exc:
            last_failure_reason = str(exc)
            logger.warning("chatbot llm model unavailable model=%s reason=%s", model, exc)
            continue

        logger.info("chatbot llm model selected model=%s", model)
        return answer, model

    logger.error("chatbot llm all models failed last_reason=%s", last_failure_reason)
    raise AllModelsFailedError(last_failure_reason)
