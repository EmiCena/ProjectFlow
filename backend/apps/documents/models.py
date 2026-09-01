from django.db import models
from django.conf import settings

class Document(models.Model):
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='documents')
    project = models.ForeignKey('projects.Project', null=True, blank=True, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.BigIntegerField(default=0)
    content_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self): return self.title
