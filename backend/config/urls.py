from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

def health(_): return JsonResponse({"status": "ok", "service": "projectflow-api"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/invoices/', include('apps.billing.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/activity/', include('apps.activity.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/documents/', include('apps.documents.urls')),
]
