from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .mongo import get_collection

class ActivityListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        ws = request.user.active_workspace_id
        col = get_collection('activity_logs')
        cursor = col.find({"workspace_id": ws}).sort("created_at", -1).limit(50)
        docs = []
        for d in cursor:
            d['_id'] = str(d['_id'])
            docs.append(d)
        return Response(docs)
