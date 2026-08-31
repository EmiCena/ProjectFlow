from rest_framework import serializers
from .models import Project, Milestone

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id','project','title','due_date','completed','created_at']
        read_only_fields = ['id','created_at']

class ProjectSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ['id','workspace','client','title','description','budget','start_date','deadline','status','progress','milestones','created_at']
        read_only_fields = ['id','workspace','created_at']
