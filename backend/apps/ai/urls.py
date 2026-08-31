from django.urls import path
from .views import PlanGenerateView, PlanConfirmView, WeeklySummaryView
urlpatterns = [
    path('plan/', PlanGenerateView.as_view(), name='ai-plan'),
    path('plan/confirm/', PlanConfirmView.as_view(), name='ai-plan-confirm'),
    path('summary/<int:project_id>/', WeeklySummaryView.as_view(), name='ai-summary'),
]
