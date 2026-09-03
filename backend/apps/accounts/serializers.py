from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ['id','username','email','password','first_name','last_name']
    def create(self, validated):
        user = User.objects.create_user(**validated)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','avatar','active_workspace','is_email_verified','email_verified_at']
        read_only_fields = ['id','username','email','is_email_verified','email_verified_at']
