from django.urls import path
from .views import ProductReviewsView, ReviewDetailView

urlpatterns = [
    path('products/<int:pk>/reviews/', ProductReviewsView.as_view(), name='product-reviews'),
    path('reviews/<int:pk>/',          ReviewDetailView.as_view(),   name='review-detail'),
]