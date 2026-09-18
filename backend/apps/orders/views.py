from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart, CartItem
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
        # Validate cart has items
        try:
            cart = Cart.objects.prefetch_related("items__product").get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        items = list(cart.items.select_related("product").all())
        if not items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate required fields
        shipping_address = request.data.get("shipping_address", "").strip()
        payment_method = request.data.get("payment_method", "cod").strip()
        if not shipping_address:
            return Response({"shipping_address": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Compute total
        total = sum(
            (item.product.price or 0) * item.quantity for item in items
        )

        # Create the order
        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            payment_method=payment_method,
            total=total,
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.price or 0,
            )

        # Clear the cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """GET /api/orders/<id>/  — order detail (owner or admin)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
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
