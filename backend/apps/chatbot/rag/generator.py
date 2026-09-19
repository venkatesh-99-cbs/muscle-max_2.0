"""
Builds the grounded prompt from retrieved context and generates an answer via
llm_client.chat_with_fallback(). Enforces strict grounding and the golden rule:
if the question is outside Muscle Max store information or cannot be answered
from context, reply with the exact fallback answer.
"""
import logging
import re
from apps.chatbot.llm_client import AllModelsFailedError, chat_with_fallback

logger = logging.getLogger("chatbot.generator")

FALLBACK_ANSWER = "I don't know based on the available Muscle Max information."

GREETING_ANSWER = (
    "Hello! Welcome to Muscle Max. I'm your dedicated AI supplement & store assistant. "
    "I can help you:\n"
    "• Choose the right supplements for your goals (proteins, creatines, pre-workouts, vitamins & recovery)\n"
    "• Check proper dosages, timing, and who should use each product\n"
    "• Review ingredients, precautions, and compare products\n"
    "• Answer questions about our shipping, express delivery, returns, and support\n\n"
    "How can I help power your training today?"
)

THANKS_ANSWER = (
    "You're very welcome! If you have any more questions about our products, dosages, "
    "or order policies, feel free to ask anytime. Stay strong!"
)

FAREWELL_ANSWER = (
    "Take care and have a great workout! Reach back out whenever you need supplement "
    "or order advice from Muscle Max."
)

SYSTEM_PROMPT = f"""You are the official Muscle Max AI assistant — a helpful, knowledgeable, and friendly supplement advisor and customer support agent for the Muscle Max store.

RULES (follow strictly, in order):
1. Answer ONLY using the numbered "Context" sections provided in the user message. Do NOT use your own knowledge or make up any detail.
2. If the Context does not contain enough information to answer, reply with EXACTLY this sentence (nothing else):
   "{FALLBACK_ANSWER}"
3. If the question is completely unrelated to Muscle Max, supplements, fitness, health, or store policies, reply with EXACTLY:
   "{FALLBACK_ANSWER}"
4. Write concise, clear, professional answers. Use bullet points for lists (benefits, steps, dosage).
5. When mentioning a price, dosage, ingredient, or policy, quote it directly from the Context — do not paraphrase or estimate.
6. Never say "According to the context" or "Based on the context" — just answer directly.
"""


def _extractive_fallback_answer(question: str, context_chunks: list[str]) -> str:
    """
    High-reliability extractive fallback when the LLM is temporarily unreachable.
    Picks the most relevant sentences from top chunks based on keyword overlap.
    """
    if not context_chunks:
        return FALLBACK_ANSWER

    # Pull key terms from the question
    q_terms = set(re.findall(r"[a-zA-Z0-9]{4,}", question.lower()))

    best_sentences = []
    for chunk in context_chunks[:3]:
        sentences = [s.strip() for s in chunk.replace("\n", " ").split(".") if len(s.strip()) > 20]
        for sentence in sentences:
            score = sum(1 for t in q_terms if t in sentence.lower())
            if score > 0:
                best_sentences.append((score, sentence))

    if best_sentences:
        best_sentences.sort(key=lambda x: x[0], reverse=True)
        top = [s for _, s in best_sentences[:3]]
        return ". ".join(top).strip() + "."

    # Absolute fallback: return first 2 lines of top chunk
    first_lines = [line.strip() for line in context_chunks[0].split("\n") if line.strip()][:3]
    return " ".join(first_lines)


def generate_answer(
    question: str, context_chunks: list[str], intent: str = "standard"
) -> tuple[str, bool, str | None, list[str]]:
    """
    Returns (answer_text, grounded, model_used, suggested_prompts).
    grounded is False when:
      - Intent is not grounded (greeting, out-of-scope), OR
      - There is no usable context, OR
      - The model returned the FALLBACK_ANSWER.
    """
    # 1. Handle conversational intents immediately
    if intent in ("greeting", "identity"):
        suggestions = [
            "What products are available?",
            "What is Whey Protein and how to use it?",
            "What is your return & refund policy?",
            "How does shipping and delivery work?",
        ]
        return GREETING_ANSWER, True, "rule-based", suggestions

    if intent == "thanks":
        return THANKS_ANSWER, True, "rule-based", ["What are your popular supplements?", "Return policy"]

    if intent == "farewell":
        return FAREWELL_ANSWER, True, "rule-based", []

    # 2. If no context was retrieved for a standard question, strictly enforce the Golden Rule
    if not context_chunks:
        return FALLBACK_ANSWER, False, None, [
            "What products are available?",
            "What are your shipping and return policies?",
        ]

    # 3. Formulate the grounded prompt with clearly numbered, labelled context chunks
    numbered_chunks = "\n\n".join(
        f"[Context {i+1}]\n{chunk.strip()}"
        for i, chunk in enumerate(context_chunks)
    )
    user_message = (
        f"{numbered_chunks}\n\n"
        f"Question: {question}\n\n"
        f"Answer (based ONLY on the context above):"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        raw_answer, model_used = chat_with_fallback(messages)
        answer = raw_answer.strip()
    except AllModelsFailedError as exc:
        logger.warning("LLM call failed (%s); using verified grounded extractive fallback.", exc)
        answer = _extractive_fallback_answer(question, context_chunks)
        model_used = "extractive-fallback"

    # 4. Check if answer matches the golden rule fallback
    grounded = FALLBACK_ANSWER.lower() not in answer.lower()

    # Generate helpful suggestions based on query and groundedness
    if not grounded:
        suggestions = [
            "What products are available?",
            "What are your shipping and return policies?",
            "How can I contact customer support?",
        ]
    else:
        q_lower = question.lower()
        if "protein" in q_lower:
            suggestions = ["How to use Whey Protein?", "Difference between Whey and Casein?", "Precautions for Protein?"]
        elif "creatine" in q_lower:
            suggestions = ["How much creatine per day?", "Do I need to drink more water?", "What can I stack with creatine?"]
        elif "shipping" in q_lower or "delivery" in q_lower:
            suggestions = ["Is express delivery available?", "What is the return policy?", "How to track my order?"]
        elif "return" in q_lower or "refund" in q_lower:
            suggestions = ["How to initiate a return?", "How long do refunds take?", "Customer support contact"]
        else:
            suggestions = ["Can you help me compare products?", "What are your shipping policies?"]

    return answer, grounded, model_used, suggestions
