from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Task.objects.filter(workspace=self.request.user.active_workspace)
        project = self.request.query_params.get('project')
        tstatus = self.request.query_params.get('status')
        if project: qs = qs.filter(project_id=project)
        if tstatus: qs = qs.filter(status=tstatus)
        return qs
    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        serializer.save(workspace=self.request.user.active_workspace)
    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status', task.status)
        new_pos = request.data.get('position', task.position)
        old_status = task.status
        with transaction.atomic():
            task.status = new_status
            task.position = new_pos
            task.save()
            # log to Mongo activity
            try:
                from apps.activity.mongo import log_activity
                log_activity(workspace_id=request.user.active_workspace_id, user_id=request.user.id, event='task_status_changed', entity='task', entity_id=task.id, metadata={'old_status': old_status, 'new_status': new_status})
            except Exception: pass
        return Response(TaskSerializer(task).data)
    @action(detail=True, methods=['get','post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            return Response(TaskCommentSerializer(task.comments.all(), many=True).data)
        ser = TaskCommentSerializer(data={**request.data, 'task': task.id})
        ser.is_valid(raise_exception=True)
        ser.save(author=request.user)
        return Response(ser.data, status=201)
