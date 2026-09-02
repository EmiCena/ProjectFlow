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
        try:
            # Try R2 presigned first, fallback to streaming
            from django.conf import settings
            import boto3
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_STORAGE_BUCKET_NAME:
                s3 = boto3.client('s3', endpoint_url=settings.AWS_S3_ENDPOINT_URL, aws_access_key_id=settings.AWS_ACCESS_KEY_ID, aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY, region_name=settings.AWS_S3_REGION_NAME or 'auto')
                # check if key exists, if not fallback to file response
                try:
                    s3.head_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=doc.file.name)
                except Exception:
                    raise Http404("File not in R2, may be local")
                url = s3.generate_presigned_url('get_object', Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': doc.file.name}, ExpiresIn=3600)
                return Response({"url": url})
        except Http404:
            pass
        except Exception as e:
            # fallback to direct file
            pass
        # fallback: stream file directly (works for local or R2 via django-storages)
        try:
            return FileResponse(doc.file.open('rb'), as_attachment=False, filename=doc.title)
        except Exception:
            raise Http404("File not found")
