import csv
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
    @action(detail=False, methods=['get'], url_path='export', url_name='export')
    def export(self, request):
        import io
        qs = self.filter_queryset(self.get_queryset()).select_related('client','project').order_by('created_at')
        output = io.StringIO()
        output.write('\ufeff')
        writer = csv.writer(output)
        writer.writerow(['ID','Number','Client','Project','Status','Subtotal','Tax Rate','Total','Due Date','Created At'])
        for obj in qs:
            writer.writerow([obj.id, obj.number, obj.client.company_name if obj.client else '', obj.project.title if obj.project else '', obj.status, obj.subtotal, obj.tax_rate, obj.total, obj.due_date or '', obj.created_at.isoformat()])
        response = HttpResponse(output.getvalue(), content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="invoices.csv"'
        return response

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
