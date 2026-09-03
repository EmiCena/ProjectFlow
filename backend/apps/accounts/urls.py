from django.urls import path
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, VerifyEmailView, ResendVerificationView
from .otp_views import Setup2FAView, Verify2FAView

class ThrottledLoginView(TokenObtainPairView):
    throttle_scope = 'anon_burst'
    def get_throttles(self):
        from rest_framework.throttling import ScopedRateThrottle
        self.throttle_classes = [ScopedRateThrottle]
        return super().get_throttles()
    def post(self, request, *args, **kwargs):
        # allow email as username for login
        from .models import User
        username = request.data.get("username") or request.data.get("email")
        # if it looks like email, resolve to username for SimpleJWT
        if username and "@" in username:
            try:
                u = User.objects.get(email__iexact=username)
                # mutate data to use real username
                request.data["username"] = u.username
                username = u.username
            except User.DoesNotExist:
                pass
        # try to find user
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email__iexact=username)
                except User.DoesNotExist:
                    pass
        resp = super().post(request, *args, **kwargs)
        # if login succeeded but user not verified -> block (except superusers)
        if resp.status_code == 200 and user and not user.is_email_verified and not user.is_superuser:
            return Response({"detail": "Email no verificado. Revisa tu bandeja o reenvía el enlace.", "code": "email_not_verified", "email": user.email}, status=403)
        # include verification flag on success
        if resp.status_code == 200 and user:
            resp.data["is_email_verified"] = user.is_email_verified
        return resp

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', ThrottledLoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('2fa/setup/', Setup2FAView.as_view(), name='2fa-setup'),
    path('2fa/verify/', Verify2FAView.as_view(), name='2fa-verify'),
]
