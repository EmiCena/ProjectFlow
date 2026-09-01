import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response({"detail": "Stripe not configured"}, status=400)
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': 'ProjectFlow Pro'},
                        'unit_amount': 1999,
                        'recurring': {'interval': 'month'},
                    },
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=request.data.get('success_url', 'https://example.com/success'),
                cancel_url=request.data.get('cancel_url', 'https://example.com/cancel'),
                client_reference_id=str(request.user.id),
            )
            return Response({"url": session.url, "id": session.id})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

class WebhookView(APIView):
    permission_classes = []
    authentication_classes = []
    def post(self, request):
        payload = request.body
        sig = request.headers.get('Stripe-Signature', '')
        try:
            event = stripe.Webhook.construct_event(payload, sig, settings.STRIPE_WEBHOOK_SECRET) if settings.STRIPE_WEBHOOK_SECRET else stripe.Event.construct_from(request.data, stripe.api_key)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
        # handle subscription events
        return Response({"received": True})
