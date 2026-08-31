from django.db import models

class Client(models.Model):
    STATUS_CHOICES = [('lead','Lead'),('active','Active'),('inactive','Inactive'),('completed','Completed')]
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='clients')
    company_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return self.company_name
