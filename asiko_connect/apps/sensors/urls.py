from django.urls import path
from .views import SensorDataAPIView, SensorMeasurementCreateView, sse_notifications

urlpatterns = [
    path(
        'measurements/',
        SensorMeasurementCreateView.as_view(),
        name='sensor-measurement-create'
    ),
    path("data/", SensorDataAPIView.as_view()),
    path('sse/notifications/', sse_notifications, name='sse_notifications'),
    ]
