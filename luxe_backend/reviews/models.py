from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="reviews")
    user    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    rating  = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title   = models.CharField(max_length=150, blank=True)
    body    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ("product", "user")   # one review per user per product
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} → {self.product} ({self.rating}★)"