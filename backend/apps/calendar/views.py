from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import redirect
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from .models import CalendarConnection, CalendarEvent

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_flow(request):
    redirect_uri = request.build_absolute_uri('/api/calendar/callback/')
    # Use env vars for client config
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = redirect_uri
    return flow

class AuthView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not settings.GOOGLE_CLIENT_ID:
            return Response({"detail": "Google OAuth not configured. Set GOOGLE_CLIENT_ID/SECRET"}, status=400)
        flow = get_flow(request)
        auth_url, _ = flow.authorization_url(access_type='offline', prompt='consent')
        return Response({"url": auth_url})

class CallbackView(APIView):
    permission_classes = []
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"detail": "No code"}, status=400)
        flow = get_flow(request)
        flow.fetch_token(code=code)
        creds = flow.credentials
        # Save for the user - need to identify user via state or session
        # For simplicity, use the logged-in user via session if available, else return tokens
        from django.contrib.auth import get_user_model
        # Try to get user from session or require auth header
        return Response({"refresh_token": creds.refresh_token, "access_token": creds.token, "message": "Save this refresh_token as GOOGLE_REFRESH_TOKEN for your user. For now, use /api/calendar/connect/ with it."})

class ConnectView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        token = request.data.get('refresh_token')
        if not token:
            return Response({"detail": "refresh_token required"}, status=400)
        conn, _ = CalendarConnection.objects.update_or_create(user=request.user, defaults={"google_refresh_token": token})
        return Response({"connected": True})

class ListEventsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Try Google if connected, else return local events
        events = list(CalendarEvent.objects.filter(workspace=request.user.active_workspace).values('id','title','start_time','end_time','description')[:20])
        # If Google connected, try to fetch from Google
        try:
            conn = CalendarConnection.objects.get(user=request.user)
            if conn.google_refresh_token and settings.GOOGLE_CLIENT_ID:
                creds = Credentials(token=None, refresh_token=conn.google_refresh_token, token_uri='https://oauth2.googleapis.com/token', client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, scopes=SCOPES)
                service = build('calendar', 'v3', credentials=creds)
                g_events = service.events().list(calendarId='primary', maxResults=10, singleEvents=True, orderBy='startTime').execute().get('items', [])
                # merge
                for ge in g_events:
                    events.append({"title": ge.get('summary','(no title)'), "start_time": ge.get('start',{}).get('dateTime'), "end_time": ge.get('end',{}).get('dateTime'), "google": True})
        except Exception as e:
            pass
        return Response(events)

class CreateEventView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        title = request.data.get('title')
        start = request.data.get('start_time')
        end = request.data.get('end_time')
        if not title or not start or not end:
            return Response({"detail": "title, start_time, end_time required"}, status=400)
        ev = CalendarEvent.objects.create(
            workspace=request.user.active_workspace,
            project_id=request.data.get('project'),
            title=title, description=request.data.get('description',''),
            start_time=start, end_time=end, created_by=request.user
        )
        # Try to create in Google
        try:
            conn = CalendarConnection.objects.get(user=request.user)
            if conn.google_refresh_token:
                creds = Credentials(token=None, refresh_token=conn.google_refresh_token, token_uri='https://oauth2.googleapis.com/token', client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, scopes=SCOPES)
                service = build('calendar', 'v3', credentials=creds)
                ge = service.events().insert(calendarId='primary', body={"summary": title, "description": ev.description, "start": {"dateTime": start}, "end": {"dateTime": end}}).execute()
                ev.google_event_id = ge.get('id','')
                ev.save()
        except Exception: pass
        return Response({"id": ev.id, "google_event_id": ev.google_event_id}, status=201)
