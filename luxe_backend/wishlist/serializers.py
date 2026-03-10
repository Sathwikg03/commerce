from rest_framework import serializers
from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product_id           = serializers.IntegerField(source="product.id",           read_only=True)
    product_name         = serializers.CharField(source="product.name",            read_only=True)
    product_price        = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_image        = serializers.SerializerMethodField()
    product_is_available = serializers.BooleanField(source="product.is_available", read_only=True)
    product_stock        = serializers.IntegerField(source="product.stock",         read_only=True)

    class Meta:
        model  = WishlistItem
        fields = [
            "id", "product_id", "product_name", "product_price",
            "product_image", "product_is_available", "product_stock", "created_at",
        ]

    def get_product_image(self, obj):
        p = obj.product
        if hasattr(p, "images") and p.images.exists():
            return p.images.first().url
        if hasattr(p, "image_url") and p.image_url:
            return p.image_url
        if hasattr(p, "image") and p.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(p.image.url)
        return ""