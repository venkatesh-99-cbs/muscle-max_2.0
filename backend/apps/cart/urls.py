from django.urls import path

from apps.cart.views import CartItemDetailView, CartItemListView, CartView

urlpatterns = [
    path("", CartView.as_view(), name="cart-detail"),
    path("items/", CartItemListView.as_view(), name="cart-item-list"),
    path("items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]
