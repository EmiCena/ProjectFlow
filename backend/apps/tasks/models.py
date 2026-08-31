from django.db import models
from django.conf import settings

class Task(models.Model):
    STATUS_CHOICES = [('backlog','Backlog'),('todo','To Do'),('in_progress','In Progress'),('review','Review'),('done','Done')]
    PRIORITY_CHOICES = [('low','Low'),('medium','Medium'),('high','High'),('urgent','Urgent')]
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='tasks')
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_tasks')
    due_date = models.DateField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['position','created_at']
    def __str__(self): return self.title

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
