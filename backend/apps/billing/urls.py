from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet
from .stripe_views import CreateCheckoutView, WebhookView
router = DefaultRouter()
router.register('', InvoiceViewSet, basename='invoice')
urlpatterns = router.urls + [
    path('stripe/checkout/', CreateCheckoutView.as_view(), name='stripe-checkout'),
    path('stripe/webhook/', WebhookView.as_view(), name='stripe-webhook'),
]
