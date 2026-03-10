from django.urls import path
from .views import WishlistView, WishlistToggleView, WishlistRemoveView, WishlistMoveAllToCartView

urlpatterns = [
    path("wishlist/",              WishlistView.as_view(),             name="wishlist"),
    path("wishlist/toggle/",       WishlistToggleView.as_view(),       name="wishlist-toggle"),
    path("wishlist/move-to-cart/", WishlistMoveAllToCartView.as_view(), name="wishlist-move-to-cart"),
    path("wishlist/<int:item_id>/", WishlistRemoveView.as_view(),      name="wishlist-remove"),
]