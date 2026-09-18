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

from apps.products.models import Category, Product

DATA_FILE = Path(settings.BASE_DIR).parent / "business-data" / "products.json"


class Command(BaseCommand):
    help = "Load business-data/products.json into the database."

    def handle(self, *args, **options):
        if not DATA_FILE.exists():
            self.stderr.write(f"Not found: {DATA_FILE}")
            return

        items = json.loads(DATA_FILE.read_text())
        created, updated = 0, 0

        for item in items:
            category, _ = Category.objects.get_or_create(
                name=item["category"], defaults={"slug": slugify(item["category"])}
            )
            price = None if item.get("price") in (None, "TBD") else item["price"]

            _, was_created = Product.objects.update_or_create(
                slug=item["id"],
                defaults={
                    "name": item["name"],
                    "category": category,
                    "price": price,
                    "description": item.get("description", ""),
                    "how_to_use": item.get("how_to_use", ""),
                    "who_should_use": item.get("who_should_use", ""),
                    "age_recommendation": item.get("age_recommendation", ""),
                    "precautions": item.get("precautions", ""),
                },
            )
            created += was_created
            updated += not was_created

        self.stdout.write(self.style.SUCCESS(f"Loaded products: {created} created, {updated} updated."))
