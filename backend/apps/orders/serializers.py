from rest_framework import serializers

from apps.orders.models import Order, OrderItem
from apps.products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "quantity", "price_at_purchase")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "status", "shipping_address", "payment_method", "total", "items", "created_at")
        read_only_fields = ("id", "status", "total", "items", "created_at")


class OrderStatusSerializer(serializers.ModelSerializer):
    """Admin-only: update order status."""

    class Meta:
        model = Order
        fields = ("id", "status")
