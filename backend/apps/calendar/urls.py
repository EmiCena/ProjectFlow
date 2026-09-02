from django.urls import path
from .views import AuthView, CallbackView, ConnectView, ListEventsView, CreateEventView

urlpatterns = [
    path('auth/', AuthView.as_view(), name='calendar-auth'),
    path('callback/', CallbackView.as_view(), name='calendar-callback'),
    path('connect/', ConnectView.as_view(), name='calendar-connect'),
    path('events/', ListEventsView.as_view(), name='calendar-events'),
    path('events/create/', CreateEventView.as_view(), name='calendar-create'),
]
