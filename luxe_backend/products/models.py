from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    name         = models.CharField(max_length=200)
    description  = models.TextField()
    price        = models.DecimalField(max_digits=10, decimal_places=2)
    image        = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url    = models.URLField(blank=True)   # legacy single image fallback
    category     = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    stock        = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url

    def check_and_update_availability(self):
        """Auto mark unavailable if stock hits 0."""
        if self.stock == 0:
            self.is_available = False
            self.save(update_fields=['is_available'])


class ProductImage(models.Model):
    """Multiple images per product (stored as URLs)."""
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    url      = models.URLField()
    order    = models.PositiveIntegerField(default=0)   # display order

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.product.name} ({self.order})"