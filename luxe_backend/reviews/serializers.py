from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source="user.username",   read_only=True)
    full_name  = serializers.SerializerMethodField()
    is_owner   = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ["id", "rating", "title", "body", "created_at",
                  "username", "full_name", "is_owner"]
        read_only_fields = ["id", "created_at", "username", "full_name", "is_owner"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and request.user == obj.user)