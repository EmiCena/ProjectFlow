import csv
from django.http import HttpResponse
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
    @action(detail=False, methods=['get'], url_path='export', url_name='export')
    def export(self, request):
        qs = self.filter_queryset(self.get_queryset()).order_by('created_at')
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="projects.csv"'
        response.write('\ufeff')
        writer = csv.writer(response)
        writer.writerow(['ID','Title','Client','Status','Budget','Progress','Start Date','Deadline','Created At'])
        for obj in qs.iterator():
            writer.writerow([obj.id, obj.title, obj.client.company_name if obj.client else '', obj.status, obj.budget, obj.progress, obj.start_date or '', obj.deadline or '', obj.created_at.isoformat()])
        return response

    @action(detail=True, methods=['get','post'])
    def milestones(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            return Response(MilestoneSerializer(project.milestones.all(), many=True).data)
        ser = MilestoneSerializer(data={**request.data, 'project': project.id})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=201)
