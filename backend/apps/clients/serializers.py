from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id','workspace','company_name','contact_person','email','phone','website','address','notes','status','created_at','updated_at']
        read_only_fields = ['id','workspace','created_at','updated_at']
