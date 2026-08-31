from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id','invoice','description','quantity','rate','amount']
        read_only_fields = ['id','invoice']
        extra_kwargs = {'invoice': {'required': False}}

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id','invoice','amount','method','paid_at']
        read_only_fields = ['id','paid_at']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    payments = PaymentSerializer(many=True, read_only=True)
    class Meta:
        model = Invoice
        fields = ['id','workspace','client','project','number','status','subtotal','tax_rate','total','due_date','notes','items','payments','created_at']
        read_only_fields = ['id','workspace','created_at']
    def create(self, validated):
        items = validated.pop('items', [])
        inv = Invoice.objects.create(**validated)
        for it in items:
            InvoiceItem.objects.create(invoice=inv, **it)
        return inv
