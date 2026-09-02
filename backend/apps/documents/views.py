from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse, FileResponse, Http404
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

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        doc = self.get_object()
        # Always stream file via Django (works for both local and R2 through storages)
        # This avoids presigned URL NoSuchKey issues and CORS
        try:
            # Ensure file exists
            if not doc.file or not doc.file.name:
                raise Http404("No file")
            return FileResponse(doc.file.open('rb'), as_attachment=False, filename=doc.file.name.split('/')[-1], content_type=doc.content_type or 'application/pdf')
        except Http404:
            raise
        except Exception as e:
            raise Http404(f"File error: {e}")
