"""
Loads business-data/faqs.json, policies.json, business-info.json into
BusinessInfo rows. Run after editing those files:
    python manage.py load_business_info
Then re-embed: python manage.py ingest_knowledge_base
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.chatbot.models import BusinessInfo

DATA_DIR = Path(settings.BASE_DIR).parent / "business-data"


class Command(BaseCommand):
    help = "Load business-data/faqs.json, policies.json, business-info.json into BusinessInfo."

    def handle(self, *args, **options):
        BusinessInfo.objects.all().delete()
        count = 0

        faqs_file = DATA_DIR / "faqs.json"
        if faqs_file.exists():
            for faq in json.loads(faqs_file.read_text()):
                BusinessInfo.objects.create(
                    category="faq", title=faq["question"], content=faq["answer"]
                )
                count += 1

        policies_file = DATA_DIR / "policies.json"
        if policies_file.exists():
            for key, value in json.loads(policies_file.read_text()).items():
                BusinessInfo.objects.create(
                    category="policy", title=key.replace("_", " ").title(), content=str(value)
                )
                count += 1

        info_file = DATA_DIR / "business-info.json"
        if info_file.exists():
            data = json.loads(info_file.read_text())
            flat = "; ".join(f"{k}: {v}" for k, v in data.items() if not isinstance(v, dict))
            BusinessInfo.objects.create(category="general", title="Business Info", content=flat)
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Loaded {count} BusinessInfo rows."))
