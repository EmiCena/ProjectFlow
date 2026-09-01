from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle
from .serializers import RegisterSerializer, UserSerializer
from .models import User

class AuthAnonThrottle(AnonRateThrottle):
    scope = 'anon_burst'

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonThrottle]
    def perform_create(self, serializer):
        user = serializer.save()
        # auto-create workspace
        from apps.workspaces.models import Workspace, WorkspaceMember
        ws = Workspace.objects.create(name=f"{user.username}'s Workspace", slug=f"{user.username}-ws", owner=user)
        WorkspaceMember.objects.create(workspace=ws, user=user, role='owner')
        user.active_workspace = ws
        user.save()

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
