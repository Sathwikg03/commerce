import random
import string
from datetime import timedelta

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

User = get_user_model()

OTP_EXPIRY_MINUTES = 10


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


class PasswordResetSendOtpView(APIView):
    """
    POST /api/password-reset/send-otp/
    Body: { "email": "user@example.com" }

    Generates a 6-digit OTP, stores it on the user, and emails it.
    Always returns 200 to avoid leaking whether an email is registered.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response({'detail': 'Email is required.'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists
            return Response({'detail': 'If this email is registered, you will receive a code shortly.'})

        if not user.is_active:
            return Response({'detail': 'This account has been suspended. Contact support.'}, status=403)

        otp = generate_otp()
        user.reset_otp        = otp
        user.reset_otp_expiry = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        user.save(update_fields=['reset_otp', 'reset_otp_expiry'])

        # Send email
        try:
            send_mail(
                subject='Your Luxe Password Reset Code',
                message=(
                    f'Hi {user.full_name or user.username},\n\n'
                    f'Your password reset code is: {otp}\n\n'
                    f'This code expires in {OTP_EXPIRY_MINUTES} minutes.\n\n'
                    f'If you did not request this, please ignore this email.\n\n'
                    f'— The Luxe Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            return Response({'detail': 'Failed to send email. Please try again later.'}, status=500)

        return Response({'detail': 'If this email is registered, you will receive a code shortly.'})


class PasswordResetVerifyOtpView(APIView):
    """
    POST /api/password-reset/verify-otp/
    Body: { "email": "...", "otp": "123456" }

    Validates the OTP without consuming it (reset step does that).
    """
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
    """
    POST /api/password-reset/reset/
    Body: { "email": "...", "otp": "123456", "new_password": "..." }

    Verifies OTP one final time and sets the new password.
    """
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

        # Validate password strength
        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'detail': ' '.join(e.messages)}, status=400)

        # Set new password and clear OTP
        user.set_password(new_password)
        user.reset_otp        = ''
        user.reset_otp_expiry = None
        user.save(update_fields=['password', 'reset_otp', 'reset_otp_expiry'])

        return Response({'detail': 'Password reset successfully.'})