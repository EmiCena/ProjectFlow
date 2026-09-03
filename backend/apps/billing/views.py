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
        return Invoice.objects.filter(workspace=self.request.user.active_workspace).prefetch_related('items','payments').order_by('-created_at')
    def perform_create(self, serializer):
        inv = serializer.save(workspace=self.request.user.active_workspace)
        # notify client if email available
        try:
            if inv.client and inv.client.email:
                from apps.activity.emails import notify_invoice_sent
                notify_invoice_sent(inv, inv.client.email)
        except Exception: pass
        # also notify workspace owner
        try:
            from apps.activity.emails import send_notification_email
            owner_email = self.request.user.email
            if owner_email:
                send_notification_email(owner_email, f"Invoice {inv.number} creada", f"Creaste factura {inv.number} para {inv.client.company_name} por ${inv.total}")
        except Exception: pass
    def perform_update(self, serializer):
        old_status = self.get_object().status
        inv = serializer.save()
        new_status = inv.status
        # notify on status change
        try:
            from apps.activity.emails import notify_invoice_sent, notify_invoice_paid
            client_email = inv.client.email if inv.client and inv.client.email else None
            if old_status != new_status:
                if new_status == "sent" and client_email:
                    notify_invoice_sent(inv, client_email)
                elif new_status == "paid" and client_email:
                    notify_invoice_paid(inv, client_email)
                # log activity
                try:
                    from apps.activity.mongo import log_activity
                    log_activity(workspace_id=self.request.user.active_workspace_id, user_id=self.request.user.id, event='invoice_status_changed', entity='invoice', entity_id=inv.id, metadata={'old_status': old_status, 'new_status': new_status})
                    if new_status == "paid":
                        log_activity(workspace_id=self.request.user.active_workspace_id, user_id=self.request.user.id, event='invoice_paid', entity='invoice', entity_id=inv.id, metadata={'total': str(inv.total)})
                except Exception: pass
        except Exception: pass
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
