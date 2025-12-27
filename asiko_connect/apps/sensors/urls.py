from django.urls import path
from .views import SensorMeasurementCreateView

urlpatterns = [
 path(
        'measurements/',
        SensorMeasurementCreateView.as_view(),
        name='sensor-measurement-create'
    ),]
