from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Document.objects.filter(workspace=self.request.user.active_workspace)
        project = self.request.query_params.get('project')
        if project: qs = qs.filter(project_id=project)
        return qs

    def perform_create(self, serializer):
        f = serializer.validated_data.get('file')
        serializer.save(
            workspace=self.request.user.active_workspace,
            uploaded_by=self.request.user,
            file_size=f.size if f else 0,
            content_type=getattr(f, 'content_type', '') if f else ''
        )
