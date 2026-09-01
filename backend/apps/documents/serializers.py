from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='uploaded_by.username', read_only=True)
    url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id','workspace','project','title','file','url','file_size','content_type','uploaded_by','username','created_at']
        read_only_fields = ['id','workspace','uploaded_by','file_size','content_type','created_at']

    def get_url(self, obj):
        try: return obj.file.url
        except: return None
