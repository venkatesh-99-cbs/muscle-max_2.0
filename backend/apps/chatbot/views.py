from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.chatbot.models import KnowledgeChunk
from apps.chatbot.rag.generator import generate_answer
from apps.chatbot.rag.retriever import retrieve
from apps.chatbot.serializers import ChatRequestSerializer


class AskChatbotView(APIView):
    """POST /api/chatbot/ask/  — see docs/API_WORKFLOW.md for the contract."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "chatbot"

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["question"]

        context_chunks = retrieve(question)
        answer, grounded, _model_used = generate_answer(question, context_chunks)

        sources = []
        if grounded:
            matched = KnowledgeChunk.objects.filter(text__in=context_chunks)
            sources = [
                {"type": c.source_type, "id": c.source_id, "title": c.metadata.get("name") or c.metadata.get("title")}
                for c in matched
            ]

        return Response({"answer": answer, "grounded": grounded, "sources": sources})
