from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with full_name, ban_reason, email verification, and password reset OTP."""
    full_name         = models.CharField(max_length=150, blank=True)
    ban_reason        = models.TextField(blank=True, default="")

    # Email verification
    is_email_verified = models.BooleanField(default=False)

    # Shared OTP field — used for both signup verification and password reset
    reset_otp         = models.CharField(max_length=6, blank=True, default="")
    reset_otp_expiry  = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username