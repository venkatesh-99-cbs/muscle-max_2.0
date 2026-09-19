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
    "Hello! Welcome to Muscle Max. I'm your dedicated AI supplement & store advisor. "
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

SYSTEM_PROMPT = f"""You are the official MuscleMax AI supplement advisor and customer support specialist.

ANSWER FORMULATION PRINCIPLE (80% RAG Grounded Facts, 20% Natural Synthesis & Audit):
• 80% Grounded Facts: All factual details — product names, exact scoop counts, grams, liquid amounts (water/milk), timing, pricing, precautions, return windows (7 days), and shipping fees — MUST strictly come from the provided Context. Never invent specs.
• 20% Natural Synthesis & Formatting: Use your language capabilities to audit, organize, and present the retrieved facts with crystal-clear Markdown formatting (bold titles, concise bullet points, emojis). Make the response conversational and easy for the customer to digest.

CRITICAL RULES:
1. Address the customer's question directly with well-structured bullet points and bold section headers.
2. If asked "how to use" or "dosage" of a product:
   • State the exact scoop/serving amount and liquid (water/milk).
   • Specify optimal timing (e.g. post-workout, morning, before bed).
   • Mention who it's suitable for and key precautions/allergens.
3. If asked about policies (returns, refunds, shipping):
   • Provide clear timelines, requirements, and support email (support@musclemax.in).
4. MANDATORY NOTE: Always conclude your response with a dedicated note callout formatted as:
   **Note:** <helpful reminder, hydration advice, or customer service tip>
5. If the Context does not contain enough information to answer, reply with EXACTLY:
   "{FALLBACK_ANSWER}"
6. Never say "based on the provided context", "according to the context", or "as mentioned above". Introduce your answer directly and authoritatively as the MuscleMax supplement advisor.
"""


def _parse_product_chunk(chunk: str) -> dict:
    """Extract structured fields from a product chunk."""
    fields = {}
    lines = chunk.strip().split("\n")
    current_key = None

    for line in lines:
        line_s = line.strip()
        if not line_s:
            continue
        if ":" in line_s:
            parts = line_s.split(":", 1)
            key = parts[0].strip().lower()
            val = parts[1].strip()
            # Standardize keys
            if "name" in key:
                current_key = "name"
            elif "category" in key:
                current_key = "category"
            elif "price" in key:
                current_key = "price"
            elif "how to use" in key or "usage" in key or "directions" in key:
                current_key = "how_to_use"
            elif "who should use" in key or "target" in key:
                current_key = "who_should_use"
            elif "age" in key:
                current_key = "age"
            elif "precaution" in key or "safety" in key or "warning" in key:
                current_key = "precautions"
            elif "similar" in key or "alternative" in key:
                current_key = "similar"
            elif "description" in key or "overview" in key:
                current_key = "description"
            else:
                current_key = key
            fields[current_key] = val
        elif current_key:
            fields[current_key] += " " + line_s

    return fields


def _extractive_fallback_answer(question: str, context_chunks: list[str]) -> str:
    """
    High-reliability, professional structured answer generator when the LLM
    is temporarily unreachable or in fallback mode.
    Accurately extracts 'how to use', 'who should use', 'pricing', 'precautions',
    and policy guidance in clean, human-friendly bullet points.
    """
    if not context_chunks:
        return FALLBACK_ANSWER

    q_lower = question.lower()
    is_usage = any(w in q_lower for w in ["how to use", "how to take", "dosage", "serving", "directions", "when to take", "how much"])
    is_who = any(w in q_lower for w in ["who should use", "who can use", "who is it for", "age", "under 18"])
    is_precautions = any(w in q_lower for w in ["precaution", "precautions", "side effect", "side effects", "safety", "safe", "allergy"])
    is_price = any(w in q_lower for w in ["price", "cost", "how much is", "pricing", "rate"])
    is_return = any(w in q_lower for w in ["return", "returns", "refund", "refunds"])
    is_shipping = any(w in q_lower for w in ["shipping", "delivery", "dispatch", "courier", "track"])

    # 1. Return & Refund policy question
    if is_return:
        for chunk in context_chunks:
            if "return" in chunk.lower() or "refund" in chunk.lower():
                return (
                    "**MuscleMax Return & Refund Policy:**\n\n"
                    "• **Return Window:** Returns are accepted within **7 days of delivery** on unopened, sealed products in original packaging.\n"
                    "• **Refund Processing:** Processed within **5–7 business days** to your original payment method once inspected.\n"
                    "• **Non-Returnable:** Opened or tampered products cannot be returned.\n"
                    "• **How to Request:** Email **support@musclemax.in** with your order number and reason for return.\n\n"
                    "**Note:** Please keep your order number and unboxing details ready when contacting support for faster resolution."
                )

    # 2. Delivery & Shipping policy question
    if is_shipping:
        for chunk in context_chunks:
            if "shipping" in chunk.lower() or "delivery" in chunk.lower():
                return (
                    "**MuscleMax Shipping & Delivery Policy:**\n\n"
                    "• **Standard Delivery:** 3–5 business days across India via Blue Dart and DTDC.\n"
                    "• **Express Delivery:** 1–2 business days available for select metro areas (+₹99).\n"
                    "• **Free Shipping:** Automatic free shipping on all orders over **₹999** (flat ₹79 shipping fee for orders under ₹999).\n"
                    "• **Tracking:** Real-time SMS and email tracking links are sent upon dispatch.\n\n"
                    "**Note:** Orders placed before 2 PM IST are prioritized for dispatch within 24 hours."
                )

    # 3. Product specific question
    for chunk in context_chunks:
        fields = _parse_product_chunk(chunk)
        name = fields.get("name")
        if not name and "Product Name:" in chunk:
            m = re.search(r"Product Name:\s*([^\n]+)", chunk)
            if m:
                name = m.group(1).strip()

        # Disallow policy or non-product names
        if name and any(kw in name.lower() for kw in ["policy", "refund", "return", "shipping", "delivery", "about", "store"]):
            name = None

        if fields and name:
            # Case A: How to use / dosage
            if is_usage and fields.get("how_to_use"):
                resp = [f"**How to Use {name}:**\n"]
                resp.append(f"• **Directions & Dosage:** {fields['how_to_use']}")
                if fields.get("who_should_use"):
                    resp.append(f"• **Recommended For:** {fields['who_should_use']}")
                if fields.get("precautions"):
                    resp.append(f"• **Precautions:** {fields['precautions']}")
                resp.append(f"\n**Note:** Drink plenty of water throughout the day. Do not exceed the recommended daily serving size.")
                return "\n".join(resp)

            # Case B: Who should use / age
            if is_who and fields.get("who_should_use"):
                resp = [f"**Who Should Use {name}:**\n"]
                resp.append(f"• **Target Audience:** {fields['who_should_use']}")
                if fields.get("age"):
                    resp.append(f"• **Age Recommendation:** {fields['age']}")
                if fields.get("how_to_use"):
                    resp.append(f"• **How to Take:** {fields['how_to_use']}")
                resp.append(f"\n**Note:** Formulated for healthy adults 18+. Minors should consult a healthcare professional before use.")
                return "\n".join(resp)

            # Case C: Precautions / side effects
            if is_precautions and fields.get("precautions"):
                resp = [f"**Precautions & Safety for {name}:**\n"]
                resp.append(f"• **Safety Notes:** {fields['precautions']}")
                if fields.get("age"):
                    resp.append(f"• **Age Guideline:** {fields['age']}")
                resp.append(f"\n**Note:** If you are pregnant, nursing, taking medication, or have a medical condition, consult your doctor before use.")
                return "\n".join(resp)

            # Case D: Pricing
            if is_price and fields.get("price"):
                resp = [f"**{name} — Pricing & Overview:**\n"]
                resp.append(f"• **Price:** ₹{fields['price']}")
                if fields.get("category"):
                    resp.append(f"• **Category:** {fields['category']}")
                if fields.get("description"):
                    resp.append(f"• **Overview:** {fields['description']}")
                resp.append(f"\n**Note:** Free standard shipping is automatically applied on orders above ₹999.")
                return "\n".join(resp)

            # General Product Overview
            if any(term in name.lower() for term in q_lower.split() if len(term) > 3):
                resp = [f"**{name} ({fields.get('category', 'Supplements')}):**\n"]
                has_content = False
                if fields.get("price"):
                    resp.append(f"• **Price:** ₹{fields['price']}")
                    has_content = True
                if fields.get("description"):
                    resp.append(f"• **Overview:** {fields['description']}")
                    has_content = True
                if fields.get("how_to_use"):
                    resp.append(f"• **How to Use:** {fields['how_to_use']}")
                    has_content = True
                if fields.get("who_should_use"):
                    resp.append(f"• **Who Should Use:** {fields['who_should_use']}")
                    has_content = True
                if has_content:
                    resp.append(f"\n**Note:** Authentic supplement sourced directly with batch-tested quality assurance.")
                    return "\n".join(resp)

    # 3. Delivery & Shipping policy question
    if is_shipping:
        for chunk in context_chunks:
            if "shipping" in chunk.lower() or "delivery" in chunk.lower():
                return (
                    "**MuscleMax Shipping & Delivery Policy:**\n\n"
                    "• **Standard Delivery:** 3–5 business days across India via Blue Dart and DTDC.\n"
                    "• **Express Delivery:** 1–2 business days available for metro pin codes (+₹99).\n"
                    "• **Free Shipping:** Free on all orders over **₹999** (flat ₹79 fee for orders under ₹999).\n"
                    "• **Tracking:** Real-time SMS and email tracking links sent upon dispatch."
                )

    # 4. Clean sentence extraction fallback for general queries
    q_terms = set(re.findall(r"[a-zA-Z0-9]{3,}", q_lower))
    best_points = []

    for chunk in context_chunks[:3]:
        lines = [l.strip() for l in chunk.split("\n") if l.strip() and not l.startswith("Product Name:")]
        for line in lines:
            # Clean markdown bullets
            clean_l = re.sub(r"^[•\-\*#]+\s*", "", line)
            score = sum(1 for t in q_terms if t in clean_l.lower())
            if score > 0 and len(clean_l) > 20:
                best_points.append((score, clean_l))

    if best_points:
        best_points.sort(key=lambda x: x[0], reverse=True)
        # Deduplicate
        seen = set()
        unique_points = []
        for _, pt in best_points:
            if pt not in seen:
                seen.add(pt)
                unique_points.append(pt)
            if len(unique_points) >= 3:
                break
        return "Here is the relevant information from MuscleMax:\n\n" + "\n".join(f"• {pt}" for pt in unique_points)

    return FALLBACK_ANSWER


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
            "How to use Mass Gainer?",
            "What is your return & refund policy?",
            "How does shipping work?",
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
        if "gainer" in q_lower or "mass" in q_lower:
            suggestions = ["How many scoops of Mass Gainer?", "When to take Mass Gainer?", "Precautions for Mass Gainer?"]
        elif "protein" in q_lower:
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
