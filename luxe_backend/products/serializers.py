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
        write_only=True, required=False
    )
    # Multiple images (read)
    images      = ProductImageSerializer(many=True, read_only=True)
    # Write: accept list of URL strings e.g. ["url1", "url2"]
    image_urls  = serializers.ListField(
        child=serializers.URLField(), write_only=True, required=False
    )
    # Computed: first image to use as thumbnail
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'description', 'price',
            'image_url', 'image_urls', 'images', 'primary_image',
            'category', 'category_id',
            'stock', 'is_available', 'created_at',
        )

    def get_primary_image(self, obj):
        imgs = obj.images.all()
        if imgs.exists():
            return imgs.first().url
        return obj.image_url or None

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        product    = super().create(validated_data)
        for i, url in enumerate(image_urls):
            ProductImage.objects.create(product=product, url=url, order=i)
        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        product    = super().update(instance, validated_data)
        if image_urls is not None:
            # Replace all images
            product.images.all().delete()
            for i, url in enumerate(image_urls):
                ProductImage.objects.create(product=product, url=url, order=i)
        return product