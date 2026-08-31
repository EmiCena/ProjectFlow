from django.db import models

class Invoice(models.Model):
    STATUS_CHOICES = [('draft','Draft'),('sent','Sent'),('paid','Paid'),('overdue','Overdue'),('cancelled','Cancelled')]
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='invoices')
    project = models.ForeignKey('projects.Project', null=True, blank=True, on_delete=models.SET_NULL, related_name='invoices')
    number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50, default='bank')
    paid_at = models.DateTimeField(auto_now_add=True)
