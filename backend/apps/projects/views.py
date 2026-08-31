from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Milestone
from .serializers import ProjectSerializer, MilestoneSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Project.objects.filter(workspace=self.request.user.active_workspace).prefetch_related('milestones')
    def perform_create(self, serializer):
        serializer.save(workspace=self.request.user.active_workspace)
    @action(detail=True, methods=['get','post'])
    def milestones(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            return Response(MilestoneSerializer(project.milestones.all(), many=True).data)
        ser = MilestoneSerializer(data={**request.data, 'project': project.id})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=201)
