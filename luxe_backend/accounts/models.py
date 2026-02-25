from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with full_name and ban_reason fields."""
    full_name  = models.CharField(max_length=150, blank=True)
    ban_reason = models.TextField(blank=True, default="")

    def __str__(self):
        return self.username
