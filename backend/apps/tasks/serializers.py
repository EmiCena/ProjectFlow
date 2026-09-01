from rest_framework import serializers
from .models import Task, TaskComment, TimeEntry

class TaskCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    class Meta:
        model = TaskComment
        fields = ['id','task','author','author_username','parent','body','created_at','updated_at']
        read_only_fields = ['id','author','created_at','updated_at']

class TimeEntrySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = TimeEntry
        fields = ['id','task','project','workspace','user','username','hours','description','date','created_at']
        read_only_fields = ['id','user','workspace','project','created_at']

class TaskSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    time_entries = TimeEntrySerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id','project','workspace','title','description','status','priority','assignee','due_date','estimated_hours','actual_hours','position','comments','time_entries','created_at','updated_at']
        read_only_fields = ['id','workspace','created_at','updated_at']
