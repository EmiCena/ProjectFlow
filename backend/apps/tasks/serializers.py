from rest_framework import serializers
from .models import Task, TaskComment

class TaskCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    class Meta:
        model = TaskComment
        fields = ['id','task','author','author_username','parent','body','created_at','updated_at']
        read_only_fields = ['id','author','created_at','updated_at']

class TaskSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id','project','workspace','title','description','status','priority','assignee','due_date','estimated_hours','actual_hours','position','comments','created_at','updated_at']
        read_only_fields = ['id','workspace','created_at','updated_at']
