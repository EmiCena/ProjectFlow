from rest_framework import serializers
from .models import Workspace, WorkspaceMember

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id','name','slug','owner','created_at']
        read_only_fields = ['id','owner','created_at']

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = WorkspaceMember
        fields = ['id','workspace','user','username','email','role','joined_at']
        read_only_fields = ['id','joined_at']
