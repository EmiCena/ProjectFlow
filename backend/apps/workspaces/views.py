from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Workspace.objects.filter(members__user=self.request.user).distinct()
    def perform_create(self, serializer):
        ws = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(workspace=ws, user=self.request.user, role='owner')
        self.request.user.active_workspace = ws
        self.request.user.save()
    @action(detail=True, methods=['get','post'])
    def members(self, request, pk=None):
        ws = self.get_object()
        if request.method == 'GET':
            qs = WorkspaceMember.objects.filter(workspace=ws)
            return Response(WorkspaceMemberSerializer(qs, many=True).data)
        # POST invite - expects user_id and role
        ser = WorkspaceMemberSerializer(data={**request.data, 'workspace': ws.id})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)
    @action(detail=False, methods=['post'], url_path='switch')
    def switch(self, request):
        ws_id = request.data.get('workspace_id')
        try:
            member = WorkspaceMember.objects.get(workspace_id=ws_id, user=request.user)
        except WorkspaceMember.DoesNotExist:
            return Response({"detail": "Not a member"}, status=403)
        request.user.active_workspace_id = ws_id
        request.user.save()
        return Response({"active_workspace": ws_id})
