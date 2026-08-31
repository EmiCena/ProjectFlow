from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .gemini import generate_plan, generate_weekly_summary
from apps.projects.models import Project, Milestone
from apps.tasks.models import Task
from apps.activity.mongo import get_collection

from rest_framework.throttling import UserRateThrottle
class AIScopeThrottle(UserRateThrottle):
    scope = 'ai'
class PlanGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIScopeThrottle]
    def post(self, request):
        brief = request.data.get('brief','').strip()
        if len(brief) < 20:
            return Response({"detail": "Brief too short (min 20 chars)"}, status=400)
        if len(brief) > 5000:
            return Response({"detail": "Brief too long (max 5000 chars)"}, status=400)
        # valida workspace
        if not request.user.active_workspace:
            return Response({"detail": "No active workspace"}, status=400)
        data = generate_plan(brief)
        # log
        try:
            from .mongo import save_conversation
            save_conversation(workspace_id=request.user.active_workspace_id, user_id=request.user.id, prompt=brief, response=data)
        except Exception: pass
        return Response(data)

class PlanConfirmView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIScopeThrottle]
    def post(self, request):
        payload = request.data
        title = payload.get('title')
        if not title:
            return Response({"detail": "title required"}, status=400)
        client_id = payload.get('client')
        milestones = payload.get('milestones', [])
        tasks = payload.get('tasks', [])
        with transaction.atomic():
            project = Project.objects.create(
                workspace=request.user.active_workspace,
                client_id=client_id if client_id else None,
                title=title,
                description=payload.get('description','AI-generated project'),
                status='planning',
                budget=payload.get('budget',0),
            )
            for m in milestones:
                Milestone.objects.create(project=project, title=m['title'], due_date=timezone.now().date() + timedelta(days=m.get('due_offset_days',7)))
            for idx, t in enumerate(tasks):
                Task.objects.create(
                    project=project,
                    workspace=request.user.active_workspace,
                    title=t['title'],
                    description=t.get('description',''),
                    priority=t.get('priority','medium'),
                    status=t.get('status','todo'),
                    estimated_hours=t.get('estimated_hours',8),
                    position=idx
                )
        return Response({"project_id": project.id, "created_tasks": len(tasks)}, status=201)

class WeeklySummaryView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIScopeThrottle]
    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, workspace=request.user.active_workspace)
        except Project.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        tasks = list(Task.objects.filter(project=project).values('title','status','priority','due_date'))
        col = get_collection('activity_logs')
        activity = list(col.find({"workspace_id": request.user.active_workspace_id}).sort("created_at", -1).limit(20))
        for a in activity: a['_id']=str(a['_id'])
        data = {"project": project.title, "tasks": tasks, "activity": activity}
        summary = generate_weekly_summary(data)
        return Response({"summary": summary, "data": data})
