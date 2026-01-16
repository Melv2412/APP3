"""
URLs pour l'app community (Zones à Risque et Établissements de Santé).
"""
from django.urls import path
from .views import RiskZoneViewSet, HealthFacilityViewSet

urlpatterns = [
    # Zones à risque
    path('risk-zones/', RiskZoneViewSet.as_view({'get': 'list'}), name='riskzone-list'),
    path('risk-zones/<int:pk>/', RiskZoneViewSet.as_view({'get': 'retrieve'}), name='riskzone-detail'),
    path('risk-zones/nearby/', RiskZoneViewSet.as_view({'get': 'nearby'}), name='riskzone-nearby'),
    path('risk-zones/map/', RiskZoneViewSet.as_view({'get': 'map'}), name='riskzone-map'),
    path('risk-zones/update-all/', RiskZoneViewSet.as_view({'post': 'update_all'}), name='riskzone-update-all'),
    
    # Établissements de santé
    path('facilities/', HealthFacilityViewSet.as_view({'get': 'list'}), name='healthfacility-list'),
    path('facilities/<int:pk>/', HealthFacilityViewSet.as_view({'get': 'retrieve'}), name='healthfacility-detail'),
    path('facilities/nearby/', HealthFacilityViewSet.as_view({'get': 'nearby'}), name='healthfacility-nearby'),
]
