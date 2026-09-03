from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle
from .serializers import RegisterSerializer, UserSerializer
from .models import User
from .tokens import generate_verification_token, verify_token

class AuthAnonThrottle(AnonRateThrottle):
    scope = 'anon_burst'

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def perform_create(self, serializer):
        user = serializer.save()
        # ensure not verified until email confirmation
        user.is_email_verified = False
        user.save()
        # auto-create workspace
        from apps.workspaces.models import Workspace, WorkspaceMember
        ws = Workspace.objects.create(name=f"{user.username}'s Workspace", slug=f"{user.username}-ws", owner=user)
        WorkspaceMember.objects.create(workspace=ws, user=user, role='owner')
        user.active_workspace = ws
        user.save()
        # send verification email (async, fallback to sync)
        try:
            from apps.activity.emails import send_verification_email
            token = generate_verification_token(user)
            send_verification_email(user, token)
        except Exception as e:
            print(f"[Register] verification email failed: {e}")

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def post(self, request):
        token = request.data.get("token") or request.query_params.get("token")
        if not token:
            return Response({"detail": "Token requerido."}, status=400)
        try:
            data = verify_token(token)
            user = User.objects.get(id=data["user_id"])
            # optional extra check email matches
            if data.get("email") and user.email != data["email"]:
                # allow if user changed email? still verify id
                pass
            if user.is_email_verified:
                return Response({"detail": "Email ya verificado.", "username": user.username})
            user.is_email_verified = True
            user.email_verified_at = timezone.now()
            user.save(update_fields=["is_email_verified","email_verified_at"])
            return Response({"detail": "Email verificado correctamente. Ya puedes iniciar sesión.", "username": user.username})
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=400)
        except ValueError as ve:
            return Response({"detail": str(ve)}, status=400)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
    def get(self, request):
        # allow GET for link clicks
        return self.post(request)

class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"detail": "Email requerido."}, status=400)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # do not reveal existence
            return Response({"detail": "Si el email existe, se ha reenviado el enlace."})
        if user.is_email_verified:
            return Response({"detail": "Email ya verificado."}, status=400)
        try:
            from apps.activity.emails import send_verification_email
            token = generate_verification_token(user)
            send_verification_email(user, token)
        except Exception as e:
            print(f"[Resend] failed: {e}")
        return Response({"detail": "Si el email existe, se ha reenviado el enlace."})

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
