from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

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
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'full_name', 'is_staff', 'is_active', 'ban_reason', 'date_joined')
        read_only_fields = ('id', 'date_joined')


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
