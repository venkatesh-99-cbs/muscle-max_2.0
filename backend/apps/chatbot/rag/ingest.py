"""
Loads business data (products + BusinessInfo rows) and re-embeds it into
KnowledgeChunk. Run via:
    python manage.py ingest_knowledge_base
Re-run this any time product or business-data content changes.
"""
from apps.chatbot.models import BusinessInfo, KnowledgeChunk
from apps.chatbot.rag.embeddings import embed_text


def _product_chunk_text(product) -> str:
    return (
        f"{product.name} ({product.category}) — Price: {product.price}. "
        f"{product.description} "
        f"How to use: {getattr(product, 'how_to_use', '')} "
        f"Who should use it: {getattr(product, 'who_should_use', '')} "
        f"Age recommendation: {getattr(product, 'age_recommendation', '')} "
        f"Precautions: {getattr(product, 'precautions', '')}"
    ).strip()


def run():
    from apps.products.models import Product  # local import: chatbot must not hard-depend on products at import time

    KnowledgeChunk.objects.filter(source_type="product").delete()
    for product in Product.objects.filter(is_active=True):
        text = _product_chunk_text(product)
        KnowledgeChunk.objects.create(
            source_type="product",
            source_id=str(product.id),
            text=text,
            embedding=embed_text(text),
            metadata={"name": product.name, "price": str(product.price)},
        )

    KnowledgeChunk.objects.filter(source_type="business_info").delete()
    for info in BusinessInfo.objects.all():
        text = f"{info.title}: {info.content}"
        KnowledgeChunk.objects.create(
            source_type="business_info",
            source_id=str(info.id),
            text=text,
            embedding=embed_text(text),
            metadata={"category": info.category, "title": info.title},
        )
