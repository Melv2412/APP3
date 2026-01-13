"""
Serializers pour les données environnementales.
"""
from rest_framework import serializers
from .models import EnvironmentData


class EnvironmentDataSerializer(serializers.ModelSerializer):
    """Serializer pour les données environnementales."""
    
    pollution_level = serializers.FloatField(read_only=True)
    pollution_level_text = serializers.CharField(read_only=True)
    
    class Meta:
        model = EnvironmentData
        fields = [
            'id',
            'latitude',
            'longitude',
            'pm25',
            'pm10',
            'no2',
            'humidity',
            'temperature',
            'source',
            'timestamp',
            'pollution_level',
            'pollution_level_text',
        ]
        read_only_fields = ['id', 'timestamp', 'pollution_level', 'pollution_level_text']
    
    def validate(self, data):
        """Validation croisée des données."""
        # Vérifier qu'au moins une donnée environnementale est fournie
        has_pollution = any([data.get('pm25'), data.get('pm10'), data.get('no2')])
        has_weather = any([data.get('humidity'), data.get('temperature')])
        
        if not (has_pollution or has_weather):
            raise serializers.ValidationError(
                "Au moins une donnée environnementale ou météorologique doit être fournie."
            )
        
        return data


class EnvironmentDataNearbySerializer(serializers.Serializer):
    """Serializer pour la requête de données proches."""
    
    latitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=True,
        help_text="Latitude du point de référence"
    )
    
    longitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=True,
        help_text="Longitude du point de référence"
    )
    
    radius_km = serializers.FloatField(
        default=5.0,
        min_value=0.1,
        max_value=100.0,
        help_text="Rayon de recherche en kilomètres (par défaut: 5 km)"
    )
    
    limit = serializers.IntegerField(
        default=10,
        min_value=1,
        max_value=100,
        help_text="Nombre maximum de résultats (par défaut: 10)"
    )
