"""
Views pour l'app community (Zones à Risque et Établissements de Santé).
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from math import radians, sin, cos, sqrt, atan2

from .models import RiskZone, HealthFacility
from .serializers import RiskZoneSerializer, RiskZoneMapSerializer, HealthFacilitySerializer
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


class HealthFacilityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la consultation des établissements de santé.
    
    Permissions :
    - Tous les utilisateurs authentifiés peuvent voir les établissements
    """
    
    serializer_class = HealthFacilitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['facility_type', 'has_emergency', 'has_pneumology', 'is_active']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_queryset(self):
        """Retourne les établissements actifs."""
        return HealthFacility.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        """Ajoute les coordonnées de l'utilisateur au context."""
        context = super().get_serializer_context()
        
        # Récupérer les coordonnées depuis les query params
        user_lat = self.request.query_params.get('user_latitude') or self.request.query_params.get('lat')
        user_lng = self.request.query_params.get('user_longitude') or self.request.query_params.get('lng')
        
        if user_lat and user_lng:
            try:
                context['user_latitude'] = float(user_lat)
                context['user_longitude'] = float(user_lng)
            except ValueError:
                pass
        
        return context
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Retourne les établissements proches d'un point GPS.
        GET /api/community/facilities/nearby/?lat=5.3&lng=-4.0&radius=10&type=HOSPITAL
        
        Paramètres :
        - lat/latitude : Latitude de l'utilisateur
        - lng/longitude : Longitude de l'utilisateur
        - radius : Rayon de recherche en km (défaut: 10km)
        - type : Type d'établissement (HOSPITAL, PNEUMOLOGY_CENTER, etc.)
        """
        latitude = request.query_params.get('latitude') or request.query_params.get('lat')
        longitude = request.query_params.get('longitude') or request.query_params.get('lng')
        radius_km = request.query_params.get('radius', 10)
        facility_type = request.query_params.get('type')
        
        if not latitude or not longitude:
            return Response(
                {'error': 'Les paramètres latitude (ou lat) et longitude (ou lng) sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_lat = float(latitude)
            user_lng = float(longitude)
            radius_km = float(radius_km)
        except ValueError:
            return Response(
                {'error': 'Les paramètres doivent être des nombres valides.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrer par type si spécifié
        queryset = self.get_queryset()
        if facility_type:
            queryset = queryset.filter(facility_type=facility_type)
        
        # Calculer les distances et filtrer
        facilities_with_distance = []
        for facility in queryset:
            distance = self._calculate_distance(user_lat, user_lng, facility.latitude, facility.longitude)
            if distance <= radius_km:
                facilities_with_distance.append((facility, distance))
        
        # Trier par distance
        facilities_with_distance.sort(key=lambda x: x[1])
        facilities = [f[0] for f in facilities_with_distance]
        
        # Sérialiser avec le context
        serializer = self.get_serializer(
            facilities, 
            many=True,
            context={'user_latitude': user_lat, 'user_longitude': user_lng, 'request': request}
        )
        
        return Response({
            'count': len(facilities),
            'radius_km': radius_km,
            'center': {'latitude': user_lat, 'longitude': user_lng},
            'results': serializer.data
        })
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calcule la distance en km entre deux points GPS (formule de Haversine)."""
        R = 6371  # Rayon de la Terre en km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
