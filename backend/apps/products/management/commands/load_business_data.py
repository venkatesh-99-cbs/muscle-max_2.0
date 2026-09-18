"""
Loads business-data/products.json into the Product/Category tables.
Run after editing business-data/products.json:
    python manage.py load_business_data
Then re-embed: python manage.py ingest_knowledge_base
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from django.core.management.base import BaseCommand
from apps.chatbot.rag.data_loader import get_business_data_dir, sync_products


class Command(BaseCommand):
    help = "Load business-data/products.json into the database."

    def handle(self, *args, **options):
        data_dir = get_business_data_dir()
        created, updated = sync_products(data_dir)
        self.stdout.write(self.style.SUCCESS(f"Loaded products: {created} created, {updated} updated."))

