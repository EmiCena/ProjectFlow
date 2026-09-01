from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView
from .otp_views import Setup2FAView, Verify2FAView

class ThrottledLoginView(TokenObtainPairView):
    throttle_scope = 'anon_burst'
    def get_throttles(self):
        from rest_framework.throttling import ScopedRateThrottle
        self.throttle_classes = [ScopedRateThrottle]
        return super().get_throttles()

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', ThrottledLoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('2fa/setup/', Setup2FAView.as_view(), name='2fa-setup'),
    path('2fa/verify/', Verify2FAView.as_view(), name='2fa-verify'),
]
