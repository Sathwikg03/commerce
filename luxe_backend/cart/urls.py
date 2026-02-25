from django.urls import path
from .views import CartView, AddToCartView, UpdateCartItemView, ClearCartView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/items/<int:item_id>/', UpdateCartItemView.as_view(), name='cart-item'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
]
