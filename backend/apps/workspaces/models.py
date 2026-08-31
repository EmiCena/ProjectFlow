from django.db import models
from django.conf import settings

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_workspaces')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

class WorkspaceMember(models.Model):
    ROLE_CHOICES = [('owner','Owner'),('member','Member'),('client','Client')]
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('workspace','user')
