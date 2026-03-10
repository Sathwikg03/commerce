from django.urls import path
from .views import CheckoutView, UserOrderListView, AdminOrderListView, AdminOrderDetailView

urlpatterns = [
    # User
    path('orders/',              UserOrderListView.as_view(),  name='order-list'),
    path('orders/checkout/',     CheckoutView.as_view(),       name='checkout'),

    # Admin
    path('admin/orders/',        AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
]