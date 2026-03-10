from django.urls import path
from .views import (
    SignupView, VerifySignupOtpView, ResendSignupOtpView,
    LoginView, AdminLoginView, TokenRefreshView, ProfileView,
    AdminUserListView, AdminUserDetailView, AdminCreateAdminView,
    AdminToggleStaffView, AdminBanUserView, AdminStatsView,
    PasswordResetSendOtpView, PasswordResetVerifyOtpView, PasswordResetConfirmView,
)

urlpatterns = [
    # Auth
    path('signup/',               SignupView.as_view(),          name='signup'),
    path('verify-email/',         VerifySignupOtpView.as_view(), name='verify-email'),
    path('resend-verification/',  ResendSignupOtpView.as_view(), name='resend-verification'),
    path('login/',                LoginView.as_view(),           name='login'),
    path('admin/login/',          AdminLoginView.as_view(),      name='admin-login'),
    path('token/refresh/',        TokenRefreshView.as_view(),    name='token-refresh'),
    path('profile/',              ProfileView.as_view(),         name='profile'),

    # Password Reset
    path('password-reset/send-otp/',   PasswordResetSendOtpView.as_view(),   name='password-reset-send-otp'),
    path('password-reset/verify-otp/', PasswordResetVerifyOtpView.as_view(), name='password-reset-verify-otp'),
    path('password-reset/reset/',      PasswordResetConfirmView.as_view(),   name='password-reset-confirm'),

    # Admin — Users
    path('admin/stats/',                       AdminStatsView.as_view(),       name='admin-stats'),
    path('admin/users/',                       AdminUserListView.as_view(),    name='admin-user-list'),
    path('admin/users/<int:pk>/',              AdminUserDetailView.as_view(),  name='admin-user-detail'),
    path('admin/create-admin/',                AdminCreateAdminView.as_view(), name='admin-create-admin'),
    path('admin/users/<int:pk>/toggle-staff/', AdminToggleStaffView.as_view(), name='admin-toggle-staff'),
    path('admin/users/<int:pk>/ban/',          AdminBanUserView.as_view(),     name='admin-ban-user'),
]