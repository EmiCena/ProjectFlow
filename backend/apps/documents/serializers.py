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
        try:
            # Generate presigned URL for private R2 bucket (1h)
            import boto3
            from django.conf import settings
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_S3_ENDPOINT_URL:
                s3 = boto3.client(
                    's3',
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME or 'auto',
                )
                return s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': obj.file.name},
                    ExpiresIn=3600,
                )
            return obj.file.url
        except: return None
