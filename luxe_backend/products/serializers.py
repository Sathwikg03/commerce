from rest_framework import serializers
from .models import Product, Category, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ('id', 'name', 'slug')


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ('id', 'url', 'order')


class ProductSerializer(serializers.ModelSerializer):
    category    = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category',
        write_only=True, required=False, allow_null=True
    )
    images        = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    # ✅ CharField instead of URLField — accepts any URL format
    image_urls = serializers.ListField(
        child=serializers.CharField(max_length=2000),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'description', 'price',
            'image_url', 'image_urls', 'images', 'primary_image',
            'category', 'category_id',
            'stock', 'is_available', 'created_at',
        )
        extra_kwargs = {
            'image_url': {'required': False, 'allow_blank': True},
        }

    def get_primary_image(self, obj):
        imgs = obj.images.all()
        if imgs.exists():
            return imgs.first().url
        return obj.image_url or None

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        product    = super().create(validated_data)
        for i, url in enumerate(image_urls):
            if url.strip():
                ProductImage.objects.create(product=product, url=url.strip(), order=i)
        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        product    = super().update(instance, validated_data)
        if image_urls is not None:
            product.images.all().delete()
            for i, url in enumerate(image_urls):
                if url.strip():
                    ProductImage.objects.create(product=product, url=url.strip(), order=i)
        return product