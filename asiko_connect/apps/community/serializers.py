"""
Serializers pour l'app community (Zones à Risque et Établissements de Santé).
"""
from rest_framework import serializers
from .models import RiskZone, HealthFacility


class RiskZoneSerializer(serializers.ModelSerializer):
    """Serializer pour les zones à risque."""
    
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    latitude = serializers.FloatField(source='zone.latitude', read_only=True)
    longitude = serializers.FloatField(source='zone.longitude', read_only=True)
    
    class Meta:
        model = RiskZone
        fields = [
            'id',
            'zone',
            'zone_name',
            'latitude',
            'longitude',
            'risk_level',
            'risk_level_display',
            'pollution_level',
            'respiratory_signal_count',
            'high_risk_predictions_count',
            'last_updated',
            'is_active',
            'radius_meters',
        ]
        read_only_fields = [
            'id',
            'risk_level',
            'pollution_level',
            'respiratory_signal_count',
            'high_risk_predictions_count',
            'last_updated',
        ]


class RiskZoneMapSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour l'affichage sur la carte."""
    
    name = serializers.CharField(source='zone.name', read_only=True)
    latitude = serializers.FloatField(source='zone.latitude', read_only=True)
    longitude = serializers.FloatField(source='zone.longitude', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    
    class Meta:
        model = RiskZone
        fields = [
            'id',
            'name',
            'latitude',
            'longitude',
            'risk_level',
            'risk_level_display',
            'pollution_level',
            'respiratory_signal_count',
            'radius_meters',
        ]


class HealthFacilitySerializer(serializers.ModelSerializer):
    """Serializer pour les établissements de santé."""
    
    facility_type_display = serializers.CharField(source='get_facility_type_display', read_only=True)
    distance_km = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthFacility
        fields = [
            'id',
            'name',
            'facility_type',
            'facility_type_display',
            'address',
            'latitude',
            'longitude',
            'phone',
            'email',
            'opening_hours',
            'has_emergency',
            'has_pneumology',
            'distance_km',
        ]
    
    def get_distance_km(self, obj):
        """
        Calcule la distance entre l'établissement et la position de l'utilisateur.
        La position est passée dans le context du serializer.
        """
        user_lat = self.context.get('user_latitude')
        user_lng = self.context.get('user_longitude')
        
        if user_lat is None or user_lng is None:
            return None
        
        # Formule de Haversine pour calculer la distance
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Rayon de la Terre en km
        
        lat1 = radians(user_lat)
        lon1 = radians(user_lng)
        lat2 = radians(obj.latitude)
        lon2 = radians(obj.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)
