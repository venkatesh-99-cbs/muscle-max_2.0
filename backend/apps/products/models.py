from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    specs = models.JSONField(
        default=dict,
        blank=True,
        help_text="Arbitrary key-value product specifications (e.g. flavour, weight, servings).",
    )
    how_to_use = models.TextField(blank=True)
    who_should_use = models.TextField(blank=True)
    age_recommendation = models.TextField(blank=True)
    precautions = models.TextField(blank=True)
    image = models.URLField(blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock_quantity > 0
