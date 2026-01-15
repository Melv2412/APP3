"""
URLs pour l'app community (Zones à Risque).
"""
from django.urls import path
from .views import RiskZoneViewSet

urlpatterns = [
    # Liste et création
    path('risk-zones/', RiskZoneViewSet.as_view({'get': 'list'}), name='riskzone-list'),
    # Détail
    path('risk-zones/<int:pk>/', RiskZoneViewSet.as_view({'get': 'retrieve'}), name='riskzone-detail'),
    # Zones proches
    path('risk-zones/nearby/', RiskZoneViewSet.as_view({'get': 'nearby'}), name='riskzone-nearby'),
    # Données pour carte
    path('risk-zones/map/', RiskZoneViewSet.as_view({'get': 'map'}), name='riskzone-map'),
    # Mise à jour toutes les zones
    path('risk-zones/update-all/', RiskZoneViewSet.as_view({'post': 'update_all'}), name='riskzone-update-all'),
]
