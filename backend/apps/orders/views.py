from django.db import transaction
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer, OrderStatusSerializer


class OrderListCreateView(APIView):
    """
    POST /api/orders/  — create an order from the current cart
    GET  /api/orders/  — list the authenticated user's orders
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items__product")
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        shipping_address = request.data.get("shipping_address", "").strip()
        payment_method = request.data.get("payment_method", "cod").strip()
        if not shipping_address:
            return Response({"shipping_address": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Lock the cart and its rows so concurrent checkout requests cannot
        # create duplicate orders from the same items.
        with transaction.atomic():
            try:
                cart = Cart.objects.select_for_update().get(user=request.user)
            except Cart.DoesNotExist:
                return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

            items = list(cart.items.select_for_update().select_related("product"))
            if not items:
                return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

            total = sum((item.product.price or 0) * item.quantity for item in items)
            order = Order.objects.create(
                user=request.user,
                shipping_address=shipping_address,
                payment_method=payment_method,
                total=total,
            )
            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price_at_purchase=item.product.price or 0,
                    )
                    for item in items
                ]
            )
            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """GET /api/orders/<id>/  — order detail (owner or admin)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(
            Order.objects.prefetch_related("items__product"),
            pk=pk,
            **({} if request.user.is_staff else {"user": request.user}),
        )
        return Response(OrderSerializer(order).data)


class OrderStatusUpdateView(APIView):
    """PATCH /api/orders/<id>/status/  — admin only."""

    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
