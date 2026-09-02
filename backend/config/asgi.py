import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi = get_asgi_application()
# WebSocket routes (mock real-time for Board)
try:
    from apps.tasks.routing import websocket_urlpatterns
    application = ProtocolTypeRouter({
        "http": django_asgi,
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    })
except Exception:
    application = django_asgi
