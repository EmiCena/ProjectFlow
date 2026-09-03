from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .mongo import get_collection

class ActivityListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        ws = request.user.active_workspace_id
        if not ws:
            return Response([])
        try:
            col = get_collection('activity_logs')
            cursor = col.find({"workspace_id": ws}).sort("created_at", -1).limit(50)
            docs = []
            for d in cursor:
                try:
                    d['_id'] = str(d.get('_id', ''))
                except Exception:
                    d['_id'] = str(d.get('_id') or '')
                docs.append(d)
            return Response(docs)
        except Exception as e:
            print(f"[ACTIVITY] Mongo failed ws={ws}: {e}")
            # Fail open: return empty instead of 500 so UI doesn't break
            return Response([])
