"""
Builds the grounded prompt from retrieved context and gets an answer via
llm_client.chat_with_fallback(). The system prompt is the only thing
standing between this chatbot and a hallucinated answer — keep the
"answer only from context, otherwise say you don't know" instruction
whenever this is edited.
"""
from apps.chatbot.llm_client import AllModelsFailedError, chat_with_fallback

FALLBACK_ANSWER = "I don't know based on the available Muscle Max information."

FRIENDLY_ERROR_ANSWER = (
    "Sorry, I'm having trouble answering right now — please try again in a "
    "moment, or reach out to our support team directly."
)

SYSTEM_PROMPT = """You are the Muscle Max customer support assistant.

Rules:
- Answer ONLY using the "Context" provided below. Do not use outside or
  general knowledge to fill gaps, and do not guess.
- If the Context does not contain the answer, reply exactly:
  "{fallback}"
- Keep answers short, direct, and specific to Muscle Max's products and
  policies as given in the Context.
- Never invent a price, ingredient, dosage, or policy detail that isn't
  in the Context.
""".format(fallback=FALLBACK_ANSWER)


def generate_answer(question: str, context_chunks: list[str]) -> tuple[str, bool, str | None]:
    """
    Returns (answer_text, grounded, model_used).
    grounded is False when there was no usable context, OR the model
    itself returned the "I don't know" fallback text.
    model_used is None only when every model failed.
    """
    if not context_chunks:
        return FALLBACK_ANSWER, False, None

    context = "\n\n".join(f"- {chunk}" for chunk in context_chunks)
    user_message = f"Context:\n{context}\n\nQuestion: {question}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        answer, model_used = chat_with_fallback(messages)
    except AllModelsFailedError:
        return FRIENDLY_ERROR_ANSWER, False, None

    grounded = FALLBACK_ANSWER.lower() not in answer.lower()
    return answer.strip(), grounded, model_used
