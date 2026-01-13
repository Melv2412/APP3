"""
Views pour les données environnementales.
"""
import math
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Avg, Max, Min, Count
from django.utils import timezone
from datetime import timedelta

from .models import EnvironmentData
from .serializers import EnvironmentDataSerializer, EnvironmentDataNearbySerializer


class EnvironmentDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les données environnementales.
    
    Permet de créer, lire, mettre à jour et supprimer des données environnementales.
    """
    queryset = EnvironmentData.objects.all()
    serializer_class = EnvironmentDataSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['source', 'latitude', 'longitude']
    ordering_fields = ['timestamp', 'pm25', 'pm10', 'no2']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Récupère les données environnementales proches d'un point géographique.
        
        Paramètres de requête:
        - latitude: Latitude du point (requis)
        - longitude: Longitude du point (requis)
        - radius_km: Rayon de recherche en km (défaut: 5 km)
        - limit: Nombre maximum de résultats (défaut: 10)
        """
        serializer = EnvironmentDataNearbySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        lat = float(serializer.validated_data['latitude'])
        lng = float(serializer.validated_data['longitude'])
        radius_km = serializer.validated_data.get('radius_km', 5.0)
        limit = serializer.validated_data.get('limit', 10)
        
        # Calcul approximatif de la distance (formule de Haversine simplifiée)
        # Pour une zone de 5 km, on utilise ~0.045 degrés de latitude/longitude
        lat_delta = radius_km / 111.0  # 1 degré ≈ 111 km
        lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
        
        # Filtrer les données dans la zone
        nearby_data = EnvironmentData.objects.filter(
            latitude__gte=lat - lat_delta,
            latitude__lte=lat + lat_delta,
            longitude__gte=lng - lng_delta,
            longitude__lte=lng + lng_delta,
        ).order_by('-timestamp')[:limit]
        
        serializer_response = EnvironmentDataSerializer(nearby_data, many=True)
        return Response(serializer_response.data)
    
    @action(detail=False, methods=['get'], url_path='current/(?P<lat>[^/.]+)/(?P<lng>[^/.]+)')
    def current(self, request, lat=None, lng=None):
        """
        Récupère les données environnementales actuelles pour un point géographique.
        
        Retourne la moyenne des données dans un rayon de 1 km au cours des dernières 24h.
        """
        try:
            lat = float(lat)
            lng = float(lng)
        except (ValueError, TypeError):
            return Response(
                {"error": "Latitude et longitude doivent être des nombres valides."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Zone de recherche : 1 km
        lat_delta = 1.0 / 111.0
        lng_delta = 1.0 / (111.0 * math.cos(math.radians(lat)))
        
        # Dernières 24 heures
        since = timezone.now() - timedelta(hours=24)
        
        # Filtrer et agréger
        current_data = EnvironmentData.objects.filter(
            latitude__gte=lat - lat_delta,
            latitude__lte=lat + lat_delta,
            longitude__gte=lng - lng_delta,
            longitude__lte=lng + lng_delta,
            timestamp__gte=since
        ).aggregate(
            avg_pm25=Avg('pm25'),
            avg_pm10=Avg('pm10'),
            avg_no2=Avg('no2'),
            avg_humidity=Avg('humidity'),
            avg_temperature=Avg('temperature'),
            max_pm25=Max('pm25'),
            max_pm10=Max('pm10'),
            max_no2=Max('no2'),
            count=Count('id')
        )
        
        if current_data['count'] == 0:
            return Response(
                {"message": "Aucune donnée disponible pour cette localisation."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculer le niveau de pollution moyen
        pollution_score = 0
        count_poll = 0
        
        if current_data['avg_pm25']:
            if current_data['avg_pm25'] > 35:
                pollution_score += 40
            elif current_data['avg_pm25'] > 25:
                pollution_score += 25
            elif current_data['avg_pm25'] > 15:
                pollution_score += 10
            count_poll += 1
        
        if current_data['avg_pm10']:
            if current_data['avg_pm10'] > 75:
                pollution_score += 40
            elif current_data['avg_pm10'] > 55:
                pollution_score += 25
            elif current_data['avg_pm10'] > 45:
                pollution_score += 10
            count_poll += 1
        
        if current_data['avg_no2']:
            if current_data['avg_no2'] > 100:
                pollution_score += 20
            elif current_data['avg_no2'] > 75:
                pollution_score += 12
            elif current_data['avg_no2'] > 50:
                pollution_score += 6
            count_poll += 1
        
        pollution_level = min(100, pollution_score) if count_poll > 0 else None
        
        return Response({
            'location': {
                'latitude': lat,
                'longitude': lng
            },
            'averages': {
                'pm25': round(current_data['avg_pm25'], 2) if current_data['avg_pm25'] else None,
                'pm10': round(current_data['avg_pm10'], 2) if current_data['avg_pm10'] else None,
                'no2': round(current_data['avg_no2'], 2) if current_data['avg_no2'] else None,
                'humidity': round(current_data['avg_humidity'], 2) if current_data['avg_humidity'] else None,
                'temperature': round(current_data['avg_temperature'], 2) if current_data['avg_temperature'] else None,
            },
            'maximums': {
                'pm25': round(current_data['max_pm25'], 2) if current_data['max_pm25'] else None,
                'pm10': round(current_data['max_pm10'], 2) if current_data['max_pm10'] else None,
                'no2': round(current_data['max_no2'], 2) if current_data['max_no2'] else None,
            },
            'pollution_level': round(pollution_level, 2) if pollution_level else None,
            'data_points_count': current_data['count'],
            'period': '24h'
        })
