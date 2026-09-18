from django.db import models
from pgvector.django import VectorField

from apps.chatbot.rag.embeddings import EMBEDDING_DIMENSIONS


class BusinessInfo(models.Model):
    CATEGORY_CHOICES = [
        ("policy", "Policy"),
        ("faq", "FAQ"),
        ("delivery", "Delivery"),
        ("general", "General"),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"


class KnowledgeChunk(models.Model):
    SOURCE_CHOICES = [
        ("product", "Product"),
        ("business_info", "Business Info"),
    ]

    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_id = models.CharField(max_length=64)
    text = models.TextField()
    embedding = VectorField(dimensions=EMBEDDING_DIMENSIONS)
    metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["source_type", "source_id"])]

    def __str__(self):
        return f"{self.source_type}:{self.source_id}"
