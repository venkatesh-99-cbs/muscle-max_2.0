from rest_framework import serializers

from apps.products.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing — matches API_WORKFLOW table."""

    category = serializers.StringRelatedField()
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "price", "category", "image", "in_stock")


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for single-product detail view."""

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "price",
            "category",
            "category_id",
            "image",
            "description",
            "how_to_use",
            "who_should_use",
            "age_recommendation",
            "precautions",
            "specs",
            "stock_quantity",
            "is_active",
            "in_stock",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at", "in_stock")
