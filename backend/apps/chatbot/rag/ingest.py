"""
Loads business data and re-embeds it into KnowledgeChunk.
Can be run via:
    python manage.py ingest_knowledge_base
or
    python manage.py sync_business_data
"""
from apps.chatbot.rag.data_loader import sync_all_knowledge


def run():
    return sync_all_knowledge()

