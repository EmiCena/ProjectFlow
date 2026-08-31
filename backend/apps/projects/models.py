from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = [('planning','Planning'),('active','Active'),('on_hold','On Hold'),('completed','Completed'),('cancelled','Cancelled')]
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='projects')
    client = models.ForeignKey('clients.Client', on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, default='member')
    class Meta:
        unique_together = ('project','user')

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
