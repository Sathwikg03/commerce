from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer, AdminCreateSerializer

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


# ── Auth ─────────────────────────────────────────────────────────────────────

class SignupView(generics.CreateAPIView):
    """POST /api/signup/"""
    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user   = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({**tokens, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/login/
    Returns clear ban message if account is inactive.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=400)

        # Check if user exists first to distinguish "wrong password" vs "banned"
        try:
            user_obj = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid username or password.'}, status=401)

        # Correct password but banned
        if not user_obj.check_password(password):
            return Response({'detail': 'Invalid username or password.'}, status=401)

        if not user_obj.is_active:
            reason = user_obj.ban_reason.strip()
            message = f"Your account has been banned. Reason: {reason}" if reason else "Your account has been banned. Please contact support."
            return Response({'detail': message, 'banned': True}, status=403)

        tokens = get_tokens_for_user(user_obj)
        return Response({**tokens, 'user': UserSerializer(user_obj).data})


class AdminLoginView(APIView):
    """
    POST /api/admin/login/
    Staff-only login for the admin panel.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=400)

        try:
            user_obj = User.objects.get(username=username)
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
    """POST /api/token/refresh/"""
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
    """GET/PUT /api/profile/"""
    permission_classes = [IsAuthenticated]
    serializer_class   = UserSerializer

    def get_object(self):
        return self.request.user


# ── Admin: User Management ────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/?search=<term>"""
    serializer_class   = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs     = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(full_name__icontains=search)
            )
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PATCH / DELETE /api/admin/users/<id>/"""
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [IsAdminUser]


class AdminCreateAdminView(APIView):
    """POST /api/admin/create-admin/"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminToggleStaffView(APIView):
    """PATCH /api/admin/users/<id>/toggle-staff/"""
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
    """
    PATCH /api/admin/users/<id>/ban/
    Body: { reason: "..." }   — bans the user with a reason
    Calling again unbans them (clears reason).
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        if user == request.user:
            return Response({'detail': 'You cannot ban yourself.'}, status=400)

        if user.is_active:
            # Banning — require a reason
            reason = request.data.get('reason', '').strip()
            if not reason:
                return Response({'detail': 'A ban reason is required.'}, status=400)
            user.is_active  = False
            user.ban_reason = reason
        else:
            # Unbanning — clear the reason
            user.is_active  = True
            user.ban_reason = ''

        user.save(update_fields=['is_active', 'ban_reason'])
        return Response(UserSerializer(user).data)


class AdminStatsView(APIView):
    """GET /api/admin/stats/"""
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
