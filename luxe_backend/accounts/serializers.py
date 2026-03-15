from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserAddress

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model  = User
        fields = ('username', 'email', 'full_name', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            username  = validated_data['username'],
            email     = validated_data.get('email', ''),
            full_name = validated_data.get('full_name', ''),
            password  = validated_data['password'],
        )


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email', 'full_name',
            'phone', 'address',
            'avatar', 'avatar_url',
            'is_staff', 'is_active', 'ban_reason',
            'is_email_verified',
            'date_joined', 'last_login',
        )
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_email_verified', 'avatar_url')
        extra_kwargs = {'avatar': {'required': False, 'allow_null': True}}

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url


class AdminCreateSerializer(serializers.Serializer):
    username  = serializers.CharField(required=True)
    email     = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False, default='')
    password  = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username  = validated_data['username'],
            email     = validated_data['email'],
            full_name = validated_data.get('full_name', ''),
            password  = validated_data['password'],
            is_staff  = True,
        )


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserAddress
        fields = ('id', 'label', 'full_name', 'phone', 'line1', 'line2',
                  'city', 'state', 'pincode', 'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')