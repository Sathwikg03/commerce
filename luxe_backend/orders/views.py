from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from cart.models import Cart
from products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer


# ── User: place order ────────────────────────────────────────────────────────

class CheckoutView(APIView):
    """
    POST /api/orders/checkout/
    Optional body: { item_ids: [1,2,3] } — checkout only selected cart items.
    Validates stock before placing order, then decrements stock.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        item_ids   = request.data.get('item_ids')
        cart_items = cart.items.select_related('product').all()
        if item_ids:
            cart_items = cart_items.filter(id__in=item_ids)

        if not cart_items.exists():
            return Response({'detail': 'No items to checkout.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Stock validation BEFORE touching the DB ──
        errors = []
        for ci in cart_items:
            product = ci.product
            if not product.is_available:
                errors.append(f'"{product.name}" is no longer available.')
            elif ci.quantity > product.stock:
                errors.append(
                    f'"{product.name}" only has {product.stock} unit(s) in stock, '
                    f'but you requested {ci.quantity}.'
                )
        if errors:
            return Response({'detail': ' '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

        # ── Place order atomically ──
        with transaction.atomic():
            order = Order.objects.create(user=request.user, status='confirmed')

            for ci in cart_items:
                product = ci.product
                OrderItem.objects.create(
                    order    = order,
                    product  = product,
                    name     = product.name,
                    price    = product.price,
                    quantity = ci.quantity,
                )
                # Decrement stock
                product.stock = product.stock - ci.quantity
                if product.stock == 0:
                    product.is_available = False
                product.save(update_fields=['stock', 'is_available'])

            order.recalculate_total()
            cart_items.delete()   # remove from cart

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class UserOrderListView(generics.ListAPIView):
    """GET /api/orders/  — logged-in user's own order history"""
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


# ── Admin: full order management ─────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/admin/orders/
    Query params: status, user, search, from, to
    """
    serializer_class   = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Order.objects.select_related('user').prefetch_related('items')

        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        if u := self.request.query_params.get('user'):
            qs = qs.filter(user__username__icontains=u)
        if search := self.request.query_params.get('search'):
            qs = qs.filter(Q(user__username__icontains=search) | Q(user__email__icontains=search))
        if f := self.request.query_params.get('from'):
            qs = qs.filter(created_at__date__gte=f)
        if t := self.request.query_params.get('to'):
            qs = qs.filter(created_at__date__lte=t)

        return qs


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/admin/orders/<id>/"""
    queryset           = Order.objects.all()
    serializer_class   = OrderSerializer
    permission_classes = [IsAdminUser]