from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from apps.projects.models import Project
from apps.billing.models import Invoice
from apps.tasks.models import Task

class SummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        ws = request.user.active_workspace
        if not ws:
            return Response({"detail": "No active workspace"}, status=400)
        active = Project.objects.filter(workspace=ws, status='active').count()
        completed = Project.objects.filter(workspace=ws, status='completed').count()
        outstanding = Invoice.objects.filter(workspace=ws).exclude(status='paid').aggregate(total=Sum('total'))['total'] or 0
        monthly = list(Invoice.objects.filter(workspace=ws, status='paid').annotate(month=TruncMonth('created_at')).values('month').annotate(revenue=Sum('total')).order_by('month')[:12])
        status_dist = list(Project.objects.filter(workspace=ws).values('status').annotate(count=Count('id')))
        tasks_done = Task.objects.filter(workspace=ws, status='done').count()
        tasks_total = Task.objects.filter(workspace=ws).count()
        completion_rate = round(tasks_done / tasks_total * 100, 1) if tasks_total else 0
        upcoming = list(Task.objects.filter(workspace=ws, due_date__isnull=False).order_by('due_date').values('id','title','due_date','status')[:5])
        hours = Task.objects.filter(workspace=ws).aggregate(est=Sum('estimated_hours'), act=Sum('actual_hours'))
        total_est = float(hours['est'] or 0)
        total_act = float(hours['act'] or 0)
        return Response({
            "active_projects": active,
            "completed_projects": completed,
            "outstanding_total": outstanding,
            "monthly_revenue": monthly,
            "status_distribution": status_dist,
            "task_completion_rate": completion_rate,
            "upcoming_deadlines": upcoming,
            "total_estimated_hours": round(total_est, 1),
            "total_actual_hours": round(total_act, 1),
            "hours_variance": round(total_act - total_est, 1),
        })
