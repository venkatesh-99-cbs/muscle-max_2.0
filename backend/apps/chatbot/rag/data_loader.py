"""
Dynamic Business Data Loader & Ingestion Engine for Muscle Max.
Supports present data (products.json, faqs.json, policies.json, business-info.json)
as well as upcoming/future files (.json, .md, .txt) placed in the business-data directory.
"""
import json
import logging
import os
from pathlib import Path

from django.conf import settings
from django.utils.text import slugify

logger = logging.getLogger("chatbot.data_loader")


def get_business_data_dir() -> Path:
    """Resolve the business-data directory across Docker, local dev, and server setups."""
    candidates = [
        os.getenv("BUSINESS_DATA_DIR"),
        "/business-data",
        str(Path(settings.BASE_DIR).parent / "business-data"),
        str(Path(settings.BASE_DIR) / "business-data"),
        str(Path.cwd() / "business-data"),
    ]
    for candidate in candidates:
        if candidate:
            p = Path(candidate)
            if p.exists() and p.is_dir():
                return p
    # Fallback to local default relative to BASE_DIR
    return Path(settings.BASE_DIR).parent / "business-data"


def sync_products(data_dir: Path) -> tuple[int, int]:
    """Sync products.json into Category and Product models."""
    from apps.products.models import Category, Product

    products_file = data_dir / "products.json"
    if not products_file.exists():
        logger.warning("products.json not found in %s", data_dir)
        return 0, 0

    try:
        items = json.loads(products_file.read_text(encoding="utf-8"))
    except Exception as exc:
        logger.error("Error reading %s: %s", products_file, exc)
        return 0, 0

    created, updated = 0, 0
    for item in items:
        cat_name = item.get("category", "General")
        category, _ = Category.objects.get_or_create(
            name=cat_name,
            defaults={"slug": slugify(cat_name)},
        )

        raw_price = item.get("price")
        price = None if raw_price in (None, "", "TBD") else raw_price

        slug_val = item.get("id") or slugify(item.get("name", "product"))
        specs = {}
        if "similar_products" in item:
            specs["similar_products"] = item["similar_products"]

        _, was_created = Product.objects.update_or_create(
            slug=slug_val,
            defaults={
                "name": item.get("name", "Unknown Product"),
                "category": category,
                "price": price,
                "description": item.get("description", ""),
                "how_to_use": item.get("how_to_use", ""),
                "who_should_use": item.get("who_should_use", ""),
                "age_recommendation": item.get("age_recommendation", ""),
                "precautions": item.get("precautions", ""),
                "specs": specs,
                "is_active": True,
            },
        )
        if was_created:
            created += 1
        else:
            updated += 1

    logger.info("Synced products: %d created, %d updated", created, updated)
    return created, updated


def sync_business_info(data_dir: Path) -> int:
    """Sync faqs.json, policies.json, business-info.json into BusinessInfo model."""
    from apps.chatbot.models import BusinessInfo

    BusinessInfo.objects.all().delete()
    count = 0

    # 1. FAQs
    faqs_file = data_dir / "faqs.json"
    if faqs_file.exists():
        try:
            faq_data = json.loads(faqs_file.read_text(encoding="utf-8"))
            for faq in faq_data:
                q = faq.get("question") or faq.get("title")
                a = faq.get("answer") or faq.get("content")
                if q and a:
                    BusinessInfo.objects.create(category="faq", title=q, content=a)
                    count += 1
        except Exception as exc:
            logger.error("Error loading FAQs: %s", exc)

    # 2. Policies
    policies_file = data_dir / "policies.json"
    if policies_file.exists():
        try:
            policy_data = json.loads(policies_file.read_text(encoding="utf-8"))
            if isinstance(policy_data, dict):
                for key, val in policy_data.items():
                    title = key.replace("_", " ").title()
                    BusinessInfo.objects.create(category="policy", title=title, content=str(val))
                    count += 1
            elif isinstance(policy_data, list):
                for item in policy_data:
                    title = item.get("title") or item.get("name", "Policy")
                    content = item.get("content") or item.get("text", "")
                    BusinessInfo.objects.create(category="policy", title=title, content=content)
                    count += 1
        except Exception as exc:
            logger.error("Error loading policies: %s", exc)

    # 3. Business Info
    info_file = data_dir / "business-info.json"
    if info_file.exists():
        try:
            info_data = json.loads(info_file.read_text(encoding="utf-8"))
            flat_items = []
            for k, v in info_data.items():
                if isinstance(v, dict):
                    nested = ", ".join(f"{nk}: {nv}" for nk, nv in v.items())
                    flat_items.append(f"{k.replace('_', ' ').title()}: {nested}")
                elif isinstance(v, list):
                    flat_items.append(f"{k.replace('_', ' ').title()}: {', '.join(map(str, v))}")
                else:
                    flat_items.append(f"{k.replace('_', ' ').title()}: {v}")

            content = "\n".join(flat_items)
            BusinessInfo.objects.create(category="general", title="Muscle Max Store Information", content=content)
            count += 1
        except Exception as exc:
            logger.error("Error loading business info: %s", exc)

    # 4. Support upcoming/future custom JSON files
    known_files = {"products.json", "faqs.json", "policies.json", "business-info.json"}
    for extra_file in data_dir.glob("*.json"):
        if extra_file.name in known_files:
            continue
        try:
            extra_data = json.loads(extra_file.read_text(encoding="utf-8"))
            if isinstance(extra_data, list):
                for idx, entry in enumerate(extra_data):
                    if isinstance(entry, dict):
                        title = entry.get("title") or entry.get("question") or entry.get("name") or f"{extra_file.stem} #{idx+1}"
                        content = entry.get("content") or entry.get("answer") or entry.get("description") or json.dumps(entry)
                        BusinessInfo.objects.create(category="general", title=title, content=content)
                        count += 1
            elif isinstance(extra_data, dict):
                for k, v in extra_data.items():
                    title = f"{extra_file.stem.title()}: {k.replace('_', ' ').title()}"
                    content = str(v) if not isinstance(v, (dict, list)) else json.dumps(v)
                    BusinessInfo.objects.create(category="general", title=title, content=content)
                    count += 1
        except Exception as exc:
            logger.error("Error reading extra JSON file %s: %s", extra_file, exc)

    # 5. Support upcoming/future markdown and txt files (e.g. sources.md, guides, etc.)
    for doc_file in list(data_dir.glob("*.md")) + list(data_dir.glob("*.txt")):
        if doc_file.name.lower() in {"readme.md"}:
            continue
        try:
            doc_text = doc_file.read_text(encoding="utf-8").strip()
            if doc_text:
                title = doc_file.stem.replace("-", " ").replace("_", " ").title()
                BusinessInfo.objects.create(category="general", title=title, content=doc_text)
                count += 1
        except Exception as exc:
            logger.error("Error reading doc file %s: %s", doc_file, exc)

    logger.info("Loaded %d BusinessInfo entries", count)
    return count


def _build_product_chunk(product) -> tuple[str, dict]:
    """Generate detailed context and metadata for a product chunk."""
    similars_str = ""
    if product.specs and isinstance(product.specs, dict):
        similars = product.specs.get("similar_products")
        if similars:
            similars_str = f"Similar products / alternatives: {', '.join(similars)}."

    # Natural-language paragraph format — better for both semantic and keyword retrieval.
    lines = [
        f"Product Name: {product.name}",
        f"Category: {product.category.name}",
        f"Price: ₹{product.price if product.price else 'TBD'}",
        f"Description: {product.description}" if product.description else "",
        f"How to use: {product.how_to_use}" if product.how_to_use else "",
        f"Who should use: {product.who_should_use}" if product.who_should_use else "",
        f"Age recommendation: {product.age_recommendation}" if product.age_recommendation else "",
        f"Precautions & Safety: {product.precautions}" if product.precautions else "",
        similars_str if similars_str else "",
    ]
    text = "\n".join(line for line in lines if line).strip()

    metadata = {
        "id": str(product.id),
        "name": product.name,
        "title": product.name,
        "category": product.category.name,
        "price": str(product.price) if product.price else "",
        "slug": product.slug,
        "type": "product",
    }
    return text, metadata


def sync_all_knowledge():
    """Unified single function to load all business-data and ingest vector chunks."""
    from apps.chatbot.models import BusinessInfo, KnowledgeChunk
    from apps.chatbot.rag.embeddings import embed_text
    from apps.products.models import Product

    data_dir = get_business_data_dir()
    logger.info("Syncing business data from %s", data_dir)

    # 1. Sync DB tables
    sync_products(data_dir)
    sync_business_info(data_dir)

    # 2. Re-embed KnowledgeChunk
    KnowledgeChunk.objects.all().delete()
    total_chunks = 0

    # Products
    for product in Product.objects.filter(is_active=True):
        text, metadata = _build_product_chunk(product)
        try:
            embedding = embed_text(text)
        except Exception as exc:
            logger.warning("Embedding failed for product %s, using fallback zeros: %s", product.name, exc)
            embedding = [0.0] * 768

        KnowledgeChunk.objects.create(
            source_type="product",
            source_id=str(product.id),
            text=text,
            embedding=embedding,
            metadata=metadata,
        )
        total_chunks += 1

    # BusinessInfo (FAQs, policies, general info, custom docs)
    for info in BusinessInfo.objects.all():
        text = f"{info.title}: {info.content}"
        metadata = {
            "id": str(info.id),
            "title": info.title,
            "category": info.category,
            "type": "business_info",
        }
        try:
            embedding = embed_text(text)
        except Exception as exc:
            logger.warning("Embedding failed for info %s, using fallback zeros: %s", info.title, exc)
            embedding = [0.0] * 768

        KnowledgeChunk.objects.create(
            source_type="business_info",
            source_id=str(info.id),
            text=text,
            embedding=embedding,
            metadata=metadata,
        )
        total_chunks += 1

    logger.info("Successfully ingested %d total KnowledgeChunks.", total_chunks)
    return total_chunks
