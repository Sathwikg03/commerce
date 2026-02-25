from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """GET /api/cart/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart       = get_or_create_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    """
    POST /api/cart/add/
    Body: { product_id, quantity }
    Validates quantity does not exceed available stock.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        quantity   = serializer.validated_data['quantity']

        product = get_object_or_404(Product, id=product_id, is_available=True)

        # Hard cap: quantity can never exceed current stock
        if quantity > product.stock:
            return Response(
                {'detail': f'Only {product.stock} unit(s) available in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_or_create_cart(request.user)
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity},
        )

        if not created:
            new_qty = item.quantity + quantity
            if new_qty > product.stock:
                return Response(
                    {
                        'detail': (
                            f'You already have {item.quantity} in your cart. '
                            f'Cannot add {quantity} more — only {product.stock} in stock.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_qty
            item.save()

        return Response(CartSerializer(cart, context={'request': request}).data)


class UpdateCartItemView(APIView):
    """
    PATCH  /api/cart/items/<id>/   — update quantity (validated against stock)
    DELETE /api/cart/items/<id>/   — remove item
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)

        quantity = request.data.get('quantity')
        if not quantity or int(quantity) < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = int(quantity)

        # Validate against current stock
        if quantity > item.product.stock:
            return Response(
                {'detail': f'Only {item.product.stock} unit(s) available in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request, item_id):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart, context={'request': request}).data)


class ClearCartView(APIView):
    """DELETE /api/cart/clear/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart, context={'request': request}).data)