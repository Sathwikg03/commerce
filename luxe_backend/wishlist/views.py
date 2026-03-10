from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from products.models import Product
from .models import WishlistItem
from .serializers import WishlistItemSerializer


class WishlistView(APIView):
    """GET /api/wishlist/ — list all wishlist items"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        serializer = WishlistItemSerializer(items, many=True, context={"request": request})
        return Response({"items": serializer.data, "count": items.count()})


class WishlistToggleView(APIView):
    """POST /api/wishlist/toggle/ — add if not present, remove if present"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"detail": "product_id required."}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)

        if not created:
            item.delete()
            return Response({"wishlisted": False, "message": "Removed from wishlist."})

        serializer = WishlistItemSerializer(item, context={"request": request})
        return Response(
            {"wishlisted": True, "message": "Added to wishlist.", "item": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class WishlistRemoveView(APIView):
    """DELETE /api/wishlist/<item_id>/ — remove a specific item"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        item = get_object_or_404(WishlistItem, pk=item_id, user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistMoveAllToCartView(APIView):
    """POST /api/wishlist/move-to-cart/ — move all wishlist items into cart"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from cart.models import Cart, CartItem  # adjust if your cart models differ

        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        if not items.exists():
            return Response({"detail": "Wishlist is empty."}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        added, skipped = 0, 0

        for wish in items:
            product = wish.product
            if not product.is_available or product.stock == 0:
                skipped += 1
                continue
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                if cart_item.quantity < product.stock:
                    cart_item.quantity += 1
                    cart_item.save()
            added += 1

        return Response({
            "added":   added,
            "skipped": skipped,
            "message": f"{added} item(s) added to cart." + (f" {skipped} unavailable item(s) skipped." if skipped else ""),
        })