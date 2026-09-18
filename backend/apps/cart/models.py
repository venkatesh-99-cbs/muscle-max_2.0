from django.db import models

from apps.products.models import Product


class Cart(models.Model):
    """One active cart per authenticated user."""

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="cart",
        help_text="The owner of this cart.",
    )

    def __str__(self):
        return f"Cart({self.user_id})"

    @property
    def total(self):
        return sum(item.line_total for item in self.items.select_related("product").all())


class CartItem(models.Model):
    """A single product line inside a cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, help_text="Number of units.")

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.quantity}× {self.product_id} in cart {self.cart_id}"

    @property
    def line_total(self):
        if self.product.price is None:
            return 0
        return self.product.price * self.quantity
