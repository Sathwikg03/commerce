from django.urls import path
from .views import (
    SignupView, LoginView, AdminLoginView, TokenRefreshView, ProfileView,
    AdminUserListView, AdminUserDetailView, AdminCreateAdminView,
    AdminToggleStaffView, AdminBanUserView, AdminStatsView,
)

urlpatterns = [
    # Auth
    path('signup/',        SignupView.as_view(),       name='signup'),
    path('login/',         LoginView.as_view(),        name='login'),
    path('admin/login/',   AdminLoginView.as_view(),   name='admin-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/',       ProfileView.as_view(),      name='profile'),

    # Admin — Users
    path('admin/stats/',                        AdminStatsView.as_view(),       name='admin-stats'),
    path('admin/users/',                        AdminUserListView.as_view(),    name='admin-user-list'),
    path('admin/users/<int:pk>/',               AdminUserDetailView.as_view(),  name='admin-user-detail'),
    path('admin/create-admin/',                 AdminCreateAdminView.as_view(), name='admin-create-admin'),
    path('admin/users/<int:pk>/toggle-staff/',  AdminToggleStaffView.as_view(), name='admin-toggle-staff'),
    path('admin/users/<int:pk>/ban/',           AdminBanUserView.as_view(),     name='admin-ban-user'),
]
