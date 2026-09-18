from django.db import models

from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="Customer who placed the order.",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text="Lifecycle status of the order.",
    )
    shipping_address = models.TextField(help_text="Full shipping address as plain text.")
    payment_method = models.CharField(
        max_length=100,
        default="cod",
        help_text="E.g. 'cod', 'upi', 'card'.",
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Order total at time of checkout.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} [{self.status}] — {self.user_id}"


class OrderItem(models.Model):
    """A snapshot of one product line at checkout time."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price per unit at the time of purchase (immutable snapshot).",
    )

    def __str__(self):
        return f"{self.quantity}× {self.product_id} in order {self.order_id}"
