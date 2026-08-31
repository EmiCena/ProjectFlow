import time, json
from django.utils.deprecation import MiddlewareMixin
from .mongo import get_collection
from datetime import datetime, timezone

class AuditMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        try:
            if request.path.startswith('/api/') and request.user.is_authenticated:
                # solo log de escrituras y auth
                if request.method in ['POST','PATCH','PUT','DELETE'] and response.status_code < 400:
                    col = get_collection('audit_events')
                    col.insert_one({
                        "user_id": request.user.id,
                        "username": request.user.username,
                        "workspace_id": getattr(request.user, 'active_workspace_id', None),
                        "method": request.method,
                        "path": request.path,
                        "status": response.status_code,
                        "ip": request.META.get('REMOTE_ADDR',''),
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })
        except Exception:
            pass
        # security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response
