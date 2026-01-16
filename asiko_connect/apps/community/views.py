"""
Views pour l'app community (Zones à Risque).
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import RiskZone
from .serializers import RiskZoneSerializer, RiskZoneMapSerializer
from .services import get_nearby_risk_zones, update_risk_zones
from asiko_connect.apps.users.permissions import IsOwnerOrDoctor


class RiskZoneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la consultation des zones à risque.
    
    Permissions :
    - Tous les utilisateurs authentifiés peuvent voir les zones à risque
    """
    
    serializer_class = RiskZoneSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['risk_level', 'is_active']
    ordering_fields = ['risk_level', 'last_updated', 'pollution_level']
    ordering = ['-risk_level', '-last_updated']
    
    def get_queryset(self):
        """Retourne les zones à risque actives."""
        queryset = RiskZone.objects.filter(is_active=True).select_related('zone')
        
        # Filtrer par niveau de risque si demandé
        risk_level = self.request.query_params.get('risk_level')
        if risk_level:
            queryset = queryset.filter(risk_level=risk_level)
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Retourne les zones à risque proches d'un point GPS.
        GET /api/community/risk-zones/nearby/?latitude=5.3&longitude=-4.0&radius=5000
        GET /api/community/risk-zones/nearby/?lat=5.3&lng=-4.0&radius=10000
        """
        # Accepter lat/latitude et lng/longitude
        latitude = request.query_params.get('latitude') or request.query_params.get('lat')
        longitude = request.query_params.get('longitude') or request.query_params.get('lng')
        radius = request.query_params.get('radius', 10000)
        
        if not latitude or not longitude:
            return Response(
                {'error': 'Les paramètres latitude (ou lat) et longitude (ou lng) sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)
        except ValueError:
            return Response(
                {'error': 'Les paramètres latitude, longitude et radius doivent être des nombres.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nearby_zones = get_nearby_risk_zones(latitude, longitude, radius)
        serializer = self.get_serializer(nearby_zones, many=True)
        
        return Response({
            'count': len(nearby_zones),
            'radius_meters': radius,
            'center': {'latitude': latitude, 'longitude': longitude},
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='map')
    def map(self, request):
        """
        Retourne les données simplifiées pour l'affichage sur la carte.
        GET /api/community/risk-zones/map/
        """
        queryset = self.get_queryset()
        serializer = RiskZoneMapSerializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='update-all', permission_classes=[IsAuthenticated])
    def update_all(self, request):
        """
        Force la mise à jour de toutes les zones à risque.
        POST /api/community/risk-zones/update-all/
        
        Note: Dans un environnement de production, cette action devrait être
        réservée aux administrateurs ou exécutée par une tâche Celery périodique.
        """
        try:
            updated_count = update_risk_zones()
            return Response({
                'message': f'{updated_count} zone(s) à risque mise(s) à jour avec succès.',
                'updated_count': updated_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la mise à jour: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
