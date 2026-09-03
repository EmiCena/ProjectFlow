from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle
from .serializers import RegisterSerializer, UserSerializer
from .models import User
from .tokens import generate_verification_token, verify_token, generate_reset_token, verify_reset_token

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
        print(f"[RESEND-VERIFY] email={request.data.get('email')} ip={request.META.get('REMOTE_ADDR')}")
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"detail": "Email requerido."}, status=400)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # do not reveal existence
            print(f"[RESEND-VERIFY] not found {email}")
            return Response({"detail": "Si el email existe, se ha reenviado el enlace."})
        if user.is_email_verified:
            return Response({"detail": "Email ya verificado."}, status=400)
        try:
            from apps.activity.emails import send_verification_email
            from django.conf import settings
            token = generate_verification_token(user)
            send_verification_email(user, token)
            if settings.DEBUG:
                return Response({"detail": "Si el email existe, se ha reenviado el enlace.", "debug_token": token, "debug_url": f"{settings.FRONTEND_URL}/verify-email?token={token}"})
        except Exception as e:
            print(f"[Resend] failed: {e}")
        return Response({"detail": "Si el email existe, se ha reenviado el enlace."})

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def post(self, request):
        print(f"[FORGOT-PASSWORD] request email={request.data.get('email')} ip={request.META.get('REMOTE_ADDR')} url={request.path}")
        email = request.data.get("email", "").strip()
        if not email:
            print("[FORGOT-PASSWORD] missing email")
            return Response({"detail": "Email requerido."}, status=400)
        try:
            user = User.objects.get(email__iexact=email)
            print(f"[FORGOT-PASSWORD] found user id={user.id} username={user.username}")
        except User.DoesNotExist:
            print(f"[FORGOT-PASSWORD] user not found for {email}")
            # do not reveal
            return Response({"detail": "Si el email existe, se ha enviado el enlace de recuperación."})
        try:
            from apps.activity.emails import send_password_reset_email
            from django.conf import settings
            token = generate_reset_token(user)
            send_password_reset_email(user, token)
            # In DEBUG, return token for testing without email
            if settings.DEBUG:
                return Response({"detail": "Si el email existe, se ha enviado el enlace de recuperación.", "debug_token": token, "debug_url": f"{settings.FRONTEND_URL}/reset-password?token={token}"})
        except Exception as e:
            print(f"[ForgotPassword] failed: {e}")
        return Response({"detail": "Si el email existe, se ha enviado el enlace de recuperación."})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def post(self, request):
        token = request.data.get("token", "").strip()
        new_password = request.data.get("new_password", "")
        if not token or not new_password:
            return Response({"detail": "Token y nueva contraseña requeridos."}, status=400)
        if len(new_password) < 8:
            return Response({"detail": "La contraseña debe tener al menos 8 caracteres."}, status=400)
        try:
            data = verify_reset_token(token)
            user = User.objects.get(id=data["user_id"])
            # verify email matches (optional)
            if data.get("email") and user.email.lower() != data["email"].lower():
                return Response({"detail": "Token no válido para este usuario."}, status=400)
            user.set_password(new_password)
            # auto-verify if not yet verified (recovery implies ownership)
            if not user.is_email_verified:
                user.is_email_verified = True
                user.email_verified_at = timezone.now()
            user.save()
            return Response({"detail": "Contraseña restablecida. Ya puedes iniciar sesión."})
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=400)
        except ValueError as ve:
            return Response({"detail": str(ve)}, status=400)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

class ForgotUsernameView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def post(self, request):
        print(f"[FORGOT-USERNAME] request email={request.data.get('email')} ip={request.META.get('REMOTE_ADDR')}")
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"detail": "Email requerido."}, status=400)
        try:
            user = User.objects.get(email__iexact=email)
            print(f"[FORGOT-USERNAME] found user {user.username}")
        except User.DoesNotExist:
            print(f"[FORGOT-USERNAME] not found {email}")
            return Response({"detail": "Si el email existe, se ha enviado tu usuario."})
        try:
            from apps.activity.emails import send_username_reminder_email
            from django.conf import settings
            send_username_reminder_email(user)
            if settings.DEBUG:
                return Response({"detail": "Si el email existe, se ha enviado tu usuario.", "debug_username": user.username})
        except Exception as e:
            print(f"[ForgotUsername] failed: {e}")
        return Response({"detail": "Si el email existe, se ha enviado tu usuario."})

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
