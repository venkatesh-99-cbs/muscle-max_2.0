import logging
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.chatbot.rag.generator import generate_answer
from apps.chatbot.rag.retriever import retrieve
from apps.chatbot.serializers import ChatRequestSerializer

logger = logging.getLogger("chatbot.views")


class AskChatbotView(APIView):
    """POST /api/chatbot/ask/  — answers questions using grounded Muscle Max RAG."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "chatbot"

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["question"]

        context_chunks, metadatas, intent = retrieve(question)
        answer, grounded, model_used, suggestions = generate_answer(
            question, context_chunks, intent=intent
        )

        sources = []
        if grounded and metadatas:
            # Deduplicate sources by id/type
            seen = set()
            for m in metadatas:
                key = (m.get("type"), m.get("id"))
                if key not in seen and m.get("title"):
                    seen.add(key)
                    sources.append({
                        "type": m.get("type"),
                        "id": m.get("id"),
                        "title": m.get("title"),
                        "slug": m.get("slug"),
                        "category": m.get("category"),
                        "price": m.get("price"),
                    })

        return Response({
            "answer": answer,
            "grounded": grounded,
            "sources": sources,
            "suggestions": suggestions,
            "model_used": model_used,
        })
