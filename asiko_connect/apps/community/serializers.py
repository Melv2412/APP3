"""
Serializers pour l'app community (Zones à Risque).
"""
from rest_framework import serializers
from .models import RiskZone


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
