from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    full_name         = models.CharField(max_length=150, blank=True)
    ban_reason        = models.TextField(blank=True, default="")
    phone             = models.CharField(max_length=20, blank=True, default="")
    address           = models.TextField(blank=True, default="")   # legacy field, kept for compatibility
    is_email_verified = models.BooleanField(default=False)
    reset_otp         = models.CharField(max_length=6, blank=True, default="")
    reset_otp_expiry  = models.DateTimeField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.username


class UserAddress(models.Model):
    LABEL_CHOICES = [("Home", "Home"), ("Work", "Work"), ("Other", "Other")]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    label      = models.CharField(max_length=20, choices=LABEL_CHOICES, default="Home")
    full_name  = models.CharField(max_length=150)
    phone      = models.CharField(max_length=20)
    line1      = models.CharField(max_length=255)
    line2      = models.CharField(max_length=255, blank=True, default="")
    city       = models.CharField(max_length=100)
    state      = models.CharField(max_length=100)
    pincode    = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.label} — {self.user.username}"

    def save(self, *args, **kwargs):
        # Unset other defaults when this one is set
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        # First address auto-becomes default
        if not self.pk and not UserAddress.objects.filter(user=self.user).exists():
            self.is_default = True
        super().save(*args, **kwargs)