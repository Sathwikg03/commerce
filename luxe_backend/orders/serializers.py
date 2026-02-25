from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = OrderItem
        fields = ('id', 'name', 'price', 'quantity', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items    = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email    = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = Order
        fields = ('id', 'username', 'email', 'status', 'total', 'items', 'created_at', 'updated_at')
