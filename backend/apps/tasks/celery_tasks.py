from celery import shared_task
from django.utils import timezone
from datetime import timedelta

@shared_task
def check_upcoming_deadlines():
    """
    Revisa tasks y projects con deadline en 1 y 3 días y envía email.
    Debe ser llamado por Celery Beat diariamente.
    """
    from apps.tasks.models import Task
    from apps.projects.models import Project
    from apps.activity.emails import notify_deadline_approaching, notify_project_deadline
    now = timezone.now().date()
    for days in [1, 3]:
        target = now + timedelta(days=days)
        # tasks
        tasks = Task.objects.filter(due_date=target).select_related('project','assignee')
        for t in tasks:
            email = None
            if t.assignee and t.assignee.email:
                email = t.assignee.email
            elif t.project and hasattr(t.project, 'workspace') and t.project.workspace and t.project.workspace.owner and t.project.workspace.owner.email:
                email = t.project.workspace.owner.email
            if email:
                try:
                    notify_deadline_approaching(t, email, days_left=days)
                except Exception as e:
                    print(f"deadline email failed task {t.id}: {e}")
        # projects
        projects = Project.objects.filter(deadline=target).select_related('workspace', 'workspace__owner')
        for p in projects:
            owner = getattr(p.workspace, 'owner', None) if p.workspace else None
            if owner and owner.email:
                try:
                    notify_project_deadline(p, owner.email)
                except Exception as e:
                    print(f"deadline email failed project {p.id}: {e}")
    return f"checked deadlines for {now}"

@shared_task
def send_daily_digest():
    """
    Opcional: digest diario por workspace (actividad últimas 24h)
    """
    from apps.activity.mongo import get_collection
    from django.contrib.auth import get_user_model
    from apps.activity.emails import send_notification_email
    from datetime import datetime, timezone as dt_tz
    try:
        User = get_user_model()
        # for each verified user, count recent activity in their workspace
        for user in User.objects.filter(is_email_verified=True, is_active=True).exclude(email=""):
            ws_id = getattr(user, 'active_workspace_id', None)
            if not ws_id:
                continue
            try:
                col = get_collection('activity_logs')
                since = (datetime.now(dt_tz.utc) - timedelta(hours=24)).isoformat()
                count = col.count_documents({"workspace_id": ws_id, "created_at": {"$gte": since}})
                if count > 5:
                    send_notification_email(user.email, f"Daily digest: {count} actividades", f"Tuviste {count} actividades en tu workspace en las últimas 24h.\n\nEntra a {getattr(__import__('django.conf').conf.settings, 'FRONTEND_URL','')}/notifications para ver detalles.")
            except Exception:
                continue
    except Exception as e:
        print(f"digest failed: {e}")
    return "digest sent"
