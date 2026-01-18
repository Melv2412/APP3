from django.urls import path
from .views import (
    SensorDataAPIView, 
    SensorMeasurementCreateView, 
    SensorMeasurementViewSet,
    PredictionViewSet,
)

# URLs pour SensorMeasurement (ViewSet)
sensor_measurement_list = SensorMeasurementViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

sensor_measurement_detail = SensorMeasurementViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# URLs pour Prediction (ViewSet)
prediction_list = PredictionViewSet.as_view({
    'get': 'list'
})

prediction_detail = PredictionViewSet.as_view({
    'get': 'retrieve'
})

urlpatterns = [
    # SensorMeasurement - ViewSet complet
    path('measurements/', sensor_measurement_list, name='sensor-measurement-list'),
    path('measurements/create/', SensorMeasurementCreateView.as_view(), name='sensor-measurement-create'),
    path('measurements/<int:pk>/', sensor_measurement_detail, name='sensor-measurement-detail'),
    path('measurements/latest/', SensorMeasurementViewSet.as_view({'get': 'latest'}), name='sensor-measurement-latest'),
    path('measurements/trends/', SensorMeasurementViewSet.as_view({'get': 'trends'}), name='sensor-measurement-trends'),
    
    # Prediction - ViewSet
    path('predictions/', prediction_list, name='prediction-list'),
    path('predictions/<int:pk>/', prediction_detail, name='prediction-detail'),
    path('predictions/latest/', PredictionViewSet.as_view({'get': 'latest'}), name='prediction-latest'),
    
    # Endpoints existants (conservés pour compatibilité)
    path("data/", SensorDataAPIView.as_view(), name='sensor-data'),
]
