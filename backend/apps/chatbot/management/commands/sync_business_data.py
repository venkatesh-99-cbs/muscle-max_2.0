from django.core.management.base import BaseCommand

from apps.chatbot.rag.data_loader import sync_all_knowledge


class Command(BaseCommand):
    help = "Dynamically syncs products, business info, FAQs, policies, and re-embeds all knowledge chunks."

    def handle(self, *args, **options):
        self.stdout.write("Starting synchronization of business data...")
        total = sync_all_knowledge()
        self.stdout.write(self.style.SUCCESS(f"Successfully synced and indexed {total} knowledge chunks."))
