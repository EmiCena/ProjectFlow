from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Invoice.objects.filter(workspace=self.request.user.active_workspace).prefetch_related('items','payments')
    def perform_create(self, serializer):
        serializer.save(workspace=self.request.user.active_workspace)
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        inv = self.get_object()
        # Minimal PDF via weasyprint - fallback to simple HTML if not installed
        try:
            from weasyprint import HTML
            html = f"<h1>Invoice {inv.number}</h1><p>Client: {inv.client.company_name}</p><p>Total: ${inv.total}</p>"
            pdf = HTML(string=html).write_pdf()
            resp = HttpResponse(pdf, content_type='application/pdf')
            resp['Content-Disposition'] = f'attachment; filename="invoice-{inv.number}.pdf"'
            return resp
        except Exception as e:
            return Response({"detail": str(e)}, status=500)
