from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task

@shared_task
def send_notification_email(to_email, subject, body):
    if not settings.SENDGRID_API_KEY and settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
        print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject} | Body: {body[:200]}")
        return True
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
        return True
    except Exception as e:
        print(f"Email failed: {e}")
        return False

def notify_task_assigned(task, assignee_email):
    subject = f"Task assigned: {task.title}"
    body = f"You have been assigned to task '{task.title}' in project '{task.project.title}'."
    send_notification_email.delay(assignee_email, subject, body) if settings.CELERY_BROKER_URL else send_notification_email(assignee_email, subject, body)

def notify_invoice_sent(invoice, client_email):
    subject = f"Invoice {invoice.number} sent"
    body = f"Invoice {invoice.number} for ${invoice.total} has been sent."
    send_notification_email.delay(client_email, subject, body) if settings.CELERY_BROKER_URL else send_notification_email(client_email, subject, body)
