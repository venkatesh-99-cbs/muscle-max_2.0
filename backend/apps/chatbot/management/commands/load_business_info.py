"""
Loads business-data/faqs.json, policies.json, business-info.json into
BusinessInfo rows. Run after editing those files:
    python manage.py load_business_info
Then re-embed: python manage.py ingest_knowledge_base
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand
from apps.chatbot.rag.data_loader import get_business_data_dir, sync_business_info


class Command(BaseCommand):
    help = "Load business-data/faqs.json, policies.json, business-info.json into BusinessInfo."

    def handle(self, *args, **options):
        data_dir = get_business_data_dir()
        count = sync_business_info(data_dir)
        self.stdout.write(self.style.SUCCESS(f"Loaded {count} BusinessInfo rows."))

