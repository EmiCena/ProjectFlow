from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
from django.utils.html import strip_tags

@shared_task
def send_notification_email(to_email, subject, body, html_body=None):
    # Console fallback in dev without SendGrid
    is_console = settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'
    if not settings.SENDGRID_API_KEY and is_console:
        print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        print(f"Body:\n{body[:2000]}\n---")
        if html_body:
            print(f"HTML len {len(html_body)}")
        return True
    try:
        send_mail(subject, strip_tags(body) if not body.startswith("<") else strip_tags(body), settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False, html_message=html_body or body)
        return True
    except Exception as e:
        print(f"Email failed to {to_email}: {e}")
        return False

def _send_async(to_email, subject, body, html_body=None):
    # Prefer celery if broker available, else sync
    try:
        if settings.CELERY_BROKER_URL and "redis" in settings.CELERY_BROKER_URL.lower():
            # try async, fallback to sync on failure
            send_notification_email.delay(to_email, subject, body, html_body)
            return
    except Exception:
        pass
    send_notification_email(to_email, subject, body, html_body)

def send_verification_email(user, token):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verify_url = f"{frontend.rstrip('/')}/verify-email?token={token}"
    subject = "Verifica tu email - ProjectFlow"
    body = f"Hola {user.username},\n\nGracias por registrarte en ProjectFlow.\n\nVerifica tu email haciendo clic aquí: {verify_url}\n\nEste enlace expira en 24 horas.\n\nSi no creaste esta cuenta, ignora este mensaje."
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e40af;">ProjectFlow</h2>
      <p>Hola <b>{user.username}</b>,</p>
      <p>Gracias por registrarte. Verifica tu email para activar tu cuenta:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{verify_url}" style="background:#1e40af; color:white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Verificar email</a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">O copia este enlace:<br/><a href="{verify_url}">{verify_url}</a></p>
      <p style="font-size: 12px; color: #9ca3af;">Expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.</p>
    </div>
    """
    _send_async(user.email, subject, body, html)

def send_password_reset_email(user, token):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend.rstrip('/')}/reset-password?token={token}"
    subject = "Restablecer contraseña - ProjectFlow"
    body = f"Hola {user.username},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nHaz clic aquí: {reset_url}\n\nExpira en 1 hora. Si no fuiste tú, ignora este mensaje.\n\nUsuario: {user.username}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e40af;">ProjectFlow - Recuperar cuenta</h2>
      <p>Hola <b>{user.username}</b>,</p>
      <p>Solicitaste restablecer tu contraseña. Tu usuario es <b>{user.username}</b>.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{reset_url}" style="background:#1e40af; color:white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Restablecer contraseña</a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">O copia este enlace:<br/><a href="{reset_url}">{reset_url}</a></p>
      <p style="font-size: 12px; color: #9ca3af;">Expira en 1 hora. Si no solicitaste esto, ignora el mensaje y tu contraseña seguirá igual.</p>
    </div>
    """
    _send_async(user.email, subject, body, html)

def send_username_reminder_email(user):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    login_url = f"{frontend.rstrip('/')}/login"
    subject = "Tu usuario en ProjectFlow"
    body = f"Hola,\n\nTu usuario en ProjectFlow es: {user.username}\nEmail asociado: {user.email}\n\nInicia sesión aquí: {login_url}\n\nSi necesitas nueva contraseña, usa 'Olvidé mi contraseña' con este email."
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e40af;">ProjectFlow - Recordatorio de usuario</h2>
      <p>Tu usuario es <b style="font-size:18px;">{user.username}</b></p>
      <p style="color: #6b7280;">Email: {user.email}</p>
      <p><a href="{login_url}" style="background:#1e40af; color:white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Ir a login</a></p>
      <p style="font-size:12px; color:#9ca3af;"><a href="{frontend.rstrip('/')}/forgot-password">¿Olvidaste tu contraseña? Restablecer aquí</a></p>
    </div>
    """
    _send_async(user.email, subject, body, html)

def notify_task_assigned(task, assignee_email):
    subject = f"Task assigned: {task.title}"
    body = f"You have been assigned to task '{task.title}' in project '{task.project.title}'.\n\nProject: {task.project.title}\nTask: {task.title}\nPriority: {task.priority}\n\nView: {getattr(settings,'FRONTEND_URL','')}/projects/{task.project_id}/board"
    html = f"<p>Te asignaron la tarea <b>{task.title}</b> en el proyecto <b>{task.project.title}</b> (prioridad {task.priority}).</p><p><a href='{getattr(settings,'FRONTEND_URL','')}/projects/{task.project_id}/board'>Ver tablero</a></p>"
    _send_async(assignee_email, subject, body, html)

def notify_invoice_sent(invoice, client_email):
    subject = f"Invoice {invoice.number} sent - ${invoice.total}"
    body = f"Invoice {invoice.number} for ${invoice.total} has been sent.\n\nClient: {invoice.client.company_name}\nTotal: ${invoice.total}\nDue: {invoice.due_date or 'N/A'}\n\nView: {getattr(settings,'FRONTEND_URL','')}/invoices/{invoice.id}"
    html = f"<p>Factura <b>{invoice.number}</b> por <b>${invoice.total}</b> enviada a {invoice.client.company_name}.</p><p><a href='{getattr(settings,'FRONTEND_URL','')}/invoices/{invoice.id}'>Ver factura</a></p>"
    _send_async(client_email, subject, body, html)

def notify_invoice_paid(invoice, client_email):
    subject = f"Invoice {invoice.number} paid - gracias!"
    body = f"Invoice {invoice.number} ha sido marcada como pagada (${invoice.total}).\nClient: {invoice.client.company_name}"
    _send_async(client_email, subject, body)

def notify_task_status_changed(task, actor_username, recipient_email):
    subject = f"Task '{task.title}' moved to {task.status}"
    body = f"{actor_username} movió la tarea '{task.title}' a {task.status} en {task.project.title}."
    _send_async(recipient_email, subject, body)

def notify_deadline_approaching(task, recipient_email, days_left=1):
    subject = f"Deadline en {days_left} día(s): {task.title}"
    body = f"La tarea '{task.title}' vence el {task.due_date} ({days_left} día(s)). Proyecto: {task.project.title}"
    _send_async(recipient_email, subject, body)

def notify_project_deadline(project, recipient_email):
    subject = f"Proyecto deadline próximo: {project.title}"
    body = f"El proyecto '{project.title}' vence el {project.deadline}."
    _send_async(recipient_email, subject, body)
