from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    active_workspace = models.ForeignKey('workspaces.Workspace', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    is_email_verified = models.BooleanField(default=False, help_text="True si el usuario verificó su email")
    email_verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self): return self.username
