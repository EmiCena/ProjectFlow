from rest_framework import viewsets, permissions
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['company_name','contact_person','email']
    def get_queryset(self):
        return Client.objects.filter(workspace=self.request.user.active_workspace)
    def perform_create(self, serializer):
        serializer.save(workspace=self.request.user.active_workspace)
