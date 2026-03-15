import random
import string
import json
import urllib.request
import urllib.error
from datetime import timedelta

from .models import UserAddress
from .serializers import UserAddressSerializer
 

from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer, AdminCreateSerializer

import re
from rest_framework import parsers

User = get_user_model()

OTP_EXPIRY_MINUTES = 10


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(user, otp, subject, purpose_line):
    """Send OTP via Brevo HTTP API (avoids Railway SMTP port blocks)."""
    api_key = getattr(settings, 'BREVO_API_KEY', '')

    if not api_key:
        print(f'\n[DEV] OTP for {user.email}: {otp}\n')
        return True

    payload = json.dumps({
        "sender": {
            "name":  "Luxe Store",
            "email": "sathwikgangapuram18@gmail.com"
        },
        "to": [{"email": user.email}],
        "subject": subject,
        "textContent": (
            f"Hi {user.full_name or user.username},\n\n"
            f"{purpose_line}\n\n"
            f"Your verification code is: {otp}\n\n"
            f"This code expires in {OTP_EXPIRY_MINUTES} minutes.\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— The Luxe Team"
        )
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=payload,
        headers={
            "accept":       "application/json",
            "content-type": "application/json",
            "api-key":      api_key,
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f'[EMAIL OK] Sent to {user.email}, status {resp.status}')
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'[EMAIL ERROR] Brevo API {e.code}: {body}')
        return False
    except Exception as e:
        print(f'[EMAIL ERROR] {e}')
        return False


# ── Auth ─────────────────────────────────────────────────────────────────────

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email    = serializer.validated_data.get('email', '').strip().lower()
        username = serializer.validated_data.get('username', '').strip()

        # Delete any stale unverified account with same email or username
        User.objects.filter(
            is_email_verified=False,
            is_active=False
        ).filter(
            Q(email__iexact=email) | Q(username__iexact=username)
        ).delete()

        # Block duplicate emails on active/verified accounts
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'detail': 'An account with this email already exists.'},
                status=400
            )

        user = serializer.save()
        user.is_active         = False
        user.is_email_verified = False

        otp = generate_otp()
        user.reset_otp        = otp
        user.reset_otp_expiry = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        user.save(update_fields=['is_active', 'is_email_verified', 'reset_otp', 'reset_otp_expiry'])

        sent = send_otp_email(
            user, otp,
            subject='Verify your Luxe account',
            purpose_line='Use the code below to verify your email address and activate your account.'
        )

        if not sent:
            print(f'\n[DEV] Signup OTP for {user.email}: {otp}\n')

        return Response(
            {'detail': 'Verification code sent to your email.', 'email': user.email},
            status=201
        )


class VerifySignupOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'detail': 'Email and OTP are required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if user.is_email_verified:
            return Response({'detail': 'Email already verified. Please log in.'}, status=400)

        if not user.reset_otp or user.reset_otp != otp:
            return Response({'detail': 'Invalid verification code.'}, status=400)

        if not user.reset_otp_expiry or timezone.now() > user.reset_otp_expiry:
            return Response({'detail': 'This code has expired. Please sign up again.'}, status=400)

        user.is_active         = True
        user.is_email_verified = True
        user.reset_otp         = ''
        user.reset_otp_expiry  = None
        user.save(update_fields=['is_active', 'is_email_verified', 'reset_otp', 'reset_otp_expiry'])

        tokens = get_tokens_for_user(user)
        return Response({**tokens, 'user': UserSerializer(user).data}, status=200)


class ResendSignupOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email is required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'No account found with this email.'}, status=404)

        if user.is_email_verified:
            return Response({'detail': 'This email is already verified.'}, status=400)

        otp = generate_otp()
        user.reset_otp        = otp
        user.reset_otp_expiry = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        user.save(update_fields=['reset_otp', 'reset_otp_expiry'])

        sent = send_otp_email(
            user, otp,
            subject='Your new Luxe verification code',
            purpose_line='Here is your new verification code to activate your account.'
        )

        if not sent:
            return Response({'detail': 'Failed to send email. Please try again.'}, status=500)

        return Response({'detail': 'New verification code sent.'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=400)

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid email or password.'}, status=401)

        if not user_obj.check_password(password):
            return Response({'detail': 'Invalid email or password.'}, status=401)

        if not user_obj.is_email_verified:
            return Response({
                'detail': 'Please verify your email before logging in.',
                'unverified': True,
                'email': user_obj.email,
            }, status=403)

        if not user_obj.is_active:
            reason  = user_obj.ban_reason.strip()
            message = f'Your account has been banned. Reason: {reason}' if reason else 'Your account has been banned. Please contact support.'
            return Response({'detail': message, 'banned': True}, status=403)

        tokens = get_tokens_for_user(user_obj)
        return Response({**tokens, 'user': UserSerializer(user_obj).data})


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=400)

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials.'}, status=401)

        if not user_obj.check_password(password):
            return Response({'detail': 'Invalid credentials.'}, status=401)

        if not user_obj.is_active:
            return Response({'detail': 'This account has been deactivated.'}, status=403)

        if not user_obj.is_staff:
            return Response({'detail': 'You do not have admin access.'}, status=403)

        tokens = get_tokens_for_user(user_obj)
        return Response({**tokens, 'user': UserSerializer(user_obj).data})


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required.'}, status=400)
        try:
            token = RefreshToken(refresh_token)
            return Response({'access': str(token.access_token)})
        except Exception:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=401)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = UserSerializer

    def get_object(self):
        return self.request.user


# ── Password Reset ─────────────────────────────────────────────────────────────

class PasswordResetSendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email is required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'If this email is registered, you will receive a code shortly.'})

        if not user.is_active:
            return Response({'detail': 'This account has been suspended. Contact support.'}, status=403)

        otp = generate_otp()
        user.reset_otp        = otp
        user.reset_otp_expiry = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        user.save(update_fields=['reset_otp', 'reset_otp_expiry'])

        sent = send_otp_email(
            user, otp,
            subject='Your Luxe Password Reset Code',
            purpose_line='Use the code below to reset your password.'
        )

        if not sent:
            print(f'\n[DEV] Password reset OTP for {user.email}: {otp}\n')

        return Response({'detail': 'If this email is registered, you will receive a code shortly.'})


class PasswordResetVerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'detail': 'Email and OTP are required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if not user.reset_otp or user.reset_otp != otp:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if not user.reset_otp_expiry or timezone.now() > user.reset_otp_expiry:
            return Response({'detail': 'This code has expired. Please request a new one.'}, status=400)

        return Response({'detail': 'OTP verified.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email        = request.data.get('email', '').strip().lower()
        otp          = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not otp or not new_password:
            return Response({'detail': 'Email, OTP, and new password are required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if not user.reset_otp or user.reset_otp != otp:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if not user.reset_otp_expiry or timezone.now() > user.reset_otp_expiry:
            return Response({'detail': 'This code has expired. Please request a new one.'}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'detail': ' '.join(e.messages)}, status=400)

        user.set_password(new_password)
        user.reset_otp        = ''
        user.reset_otp_expiry = None
        user.save(update_fields=['password', 'reset_otp', 'reset_otp_expiry'])

        return Response({'detail': 'Password reset successfully.'})


# ── Admin: User Management ────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    serializer_class   = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs     = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(full_name__icontains=search)
            )
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [IsAdminUser]


class AdminCreateAdminView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminToggleStaffView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        if user == request.user:
            return Response({'detail': 'You cannot modify your own staff status.'}, status=400)
        user.is_staff = not user.is_staff
        user.save(update_fields=['is_staff'])
        return Response(UserSerializer(user).data)


class AdminBanUserView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        if user == request.user:
            return Response({'detail': 'You cannot ban yourself.'}, status=400)
        if user.is_active:
            reason = request.data.get('reason', '').strip()
            if not reason:
                return Response({'detail': 'A ban reason is required.'}, status=400)
            user.is_active  = False
            user.ban_reason = reason
        else:
            user.is_active  = True
            user.ban_reason = ''
        user.save(update_fields=['is_active', 'ban_reason'])
        return Response(UserSerializer(user).data)


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from products.models import Product
        from orders.models import Order
        from django.db.models import Sum

        total_users    = User.objects.count()
        total_products = Product.objects.count()
        total_orders   = Order.objects.count()
        total_revenue  = Order.objects.filter(
            status__in=['confirmed', 'shipped', 'delivered']
        ).aggregate(rev=Sum('total'))['rev'] or 0

        return Response({
            'total_users':    total_users,
            'total_products': total_products,
            'total_orders':   total_orders,
            'total_revenue':  total_revenue,
        })
<<<<<<< HEAD
=======
#────────────────────────────────────────────────────────────────────────────

class AdminUserOrdersView(APIView):
    """
    GET /api/admin/users/<pk>/orders/
    Returns all orders placed by the specified user, for admin use.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        from orders.models import Order
        from orders.serializers import OrderSerializer

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        orders = Order.objects.filter(user=user).prefetch_related('items').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminUserReviewsView(APIView):
    """
    GET /api/admin/users/<pk>/reviews/
    Returns all reviews written by the specified user, including product info.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        from reviews.models import Review

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        reviews = Review.objects.filter(user=user).select_related('product').order_by('-created_at')

        data = []
        for r in reviews:
            product = r.product
            # Get first product image URL
            primary_image = None
            if product:
                imgs = product.images.all()
                if imgs.exists():
                    primary_image = imgs.first().url
                elif product.image_url:
                    primary_image = product.image_url

            data.append({
                'id':            r.id,
                'rating':        r.rating,
                'title':         r.title,
                'body':          r.body,
                'created_at':    r.created_at,
                'product_id':    product.id   if product else None,
                'product_name':  product.name if product else 'Deleted product',
                'product_image': primary_image,
            })

        return Response(data)
# ─────────────────────────────────────────────────────────────────────────────

class UserAddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/addresses/   — list the logged-in user's addresses
    POST /api/addresses/   — create a new address
    """
    serializer_class   = UserAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET / PATCH / DELETE /api/addresses/<id>/
    Users can only touch their own addresses.
    """
    serializer_class   = UserAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)


class UserAddressSetDefaultView(APIView):
    """
    PATCH /api/addresses/<id>/set-default/
    Sets the given address as default, unsets all others.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            addr = UserAddress.objects.get(pk=pk, user=request.user)
        except UserAddress.DoesNotExist:
            return Response({'detail': 'Address not found.'}, status=404)
        addr.is_default = True
        addr.save()   # model.save() handles unsetting others
        return Response(UserAddressSerializer(addr).data)


# ── Admin: per-user orders & reviews ─────────────────────────────────────────

class AdminUserOrdersView(APIView):
    """GET /api/admin/users/<pk>/orders/"""
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        from orders.models import Order
        from orders.serializers import OrderSerializer
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        orders = Order.objects.filter(user=user).prefetch_related('items').order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)


class AdminUserReviewsView(APIView):
    """GET /api/admin/users/<pk>/reviews/"""
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        from reviews.models import Review
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        reviews = Review.objects.filter(user=user).select_related('product').order_by('-created_at')
        data = []
        for r in reviews:
            product = r.product
            primary_image = None
            if product:
                imgs = product.images.all()
                primary_image = imgs.first().url if imgs.exists() else product.image_url or None
            data.append({
                'id': r.id, 'rating': r.rating, 'title': r.title,
                'body': r.body, 'created_at': r.created_at,
                'product_id': product.id if product else None,
                'product_name': product.name if product else 'Deleted product',
                'product_image': primary_image,
            })
        return Response(data)

# ─────────────────────────────────────────────────────────────────────────────
# APPEND these views to the bottom of luxe_backend/accounts/views.py
# Also add `avatar` to the UserSerializer fields list (see serializers.py)
# ─────────────────────────────────────────────────────────────────────────────


class AvatarUploadView(APIView):
    """
    POST /api/profile/avatar/
    Multipart form: field name = "avatar"
    Returns updated user serializer data.
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        user = request.user
        file = request.FILES.get('avatar')
        if not file:
            return Response({'detail': 'No file provided.'}, status=400)

        # Basic validation
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if file.content_type not in allowed:
            return Response({'detail': 'Only JPEG, PNG, WEBP or GIF images are allowed.'}, status=400)
        if file.size > 5 * 1024 * 1024:  # 5 MB cap
            return Response({'detail': 'Image must be under 5 MB.'}, status=400)

        # Delete old avatar to save storage
        if user.avatar:
            try:
                user.avatar.delete(save=False)
            except Exception:
                pass

        user.avatar = file
        user.save(update_fields=['avatar'])
        return Response(UserSerializer(user, context={'request': request}).data)


class AvatarDeleteView(APIView):
    """DELETE /api/profile/avatar/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if user.avatar:
            try:
                user.avatar.delete(save=False)
            except Exception:
                pass
            user.avatar = None
            user.save(update_fields=['avatar'])
        return Response(UserSerializer(user, context={'request': request}).data)


class EmailChangeRequestView(APIView):
    """
    POST /api/profile/change-email/request/
    Body: { "new_email": "..." }
    Sends a 6-digit OTP to the NEW email address.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('new_email', '').strip().lower()

        if not new_email:
            return Response({'detail': 'New email is required.'}, status=400)

        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', new_email):
            return Response({'detail': 'Enter a valid email address.'}, status=400)

        if new_email == request.user.email.lower():
            return Response({'detail': 'This is already your current email.'}, status=400)

        if User.objects.filter(email__iexact=new_email).exclude(pk=request.user.pk).exists():
            return Response({'detail': 'This email is already in use by another account.'}, status=400)

        otp = generate_otp()
        user = request.user
        user.reset_otp        = otp
        user.reset_otp_expiry = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        user.save(update_fields=['reset_otp', 'reset_otp_expiry'])

        # Store the pending new email in the session/cache via a simple approach:
        # We encode it in a signed way using a custom field.
        # For simplicity, store it temporarily in an unused field or use cache.
        # Here we use the session.
        request.session['pending_email_change'] = new_email
        request.session.save()

        send_otp_email(
            user, otp,
            subject='Verify your new email — Luxe',
            purpose_line=f'Use this code to verify your new email address: {new_email}'
        )

        return Response({'detail': 'Verification code sent to your new email address.'})


class EmailChangeVerifyView(APIView):
    """
    POST /api/profile/change-email/verify/
    Body: { "otp": "123456" }
    Verifies OTP and updates the email.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp       = request.data.get('otp', '').strip()
        new_email = request.session.get('pending_email_change', '')

        if not otp:
            return Response({'detail': 'OTP is required.'}, status=400)

        if not new_email:
            return Response({'detail': 'No pending email change. Please request again.'}, status=400)

        user = request.user

        if not user.reset_otp or user.reset_otp != otp:
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        if not user.reset_otp_expiry or timezone.now() > user.reset_otp_expiry:
            return Response({'detail': 'Code has expired. Please request again.'}, status=400)

        user.email            = new_email
        user.reset_otp        = ''
        user.reset_otp_expiry = None
        user.save(update_fields=['email', 'reset_otp', 'reset_otp_expiry'])

        # Clear session
        try:
            del request.session['pending_email_change']
            request.session.save()
        except KeyError:
            pass

        return Response(UserSerializer(user, context={'request': request}).data)

>>>>>>> 5d434ed (feat: admin user profile, multi-address, avatar upload, email change OTP, checkout modal)
