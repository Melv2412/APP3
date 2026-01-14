"""
Serializers pour les alertes.
"""
from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer pour les alertes.
    """
    sensor_device_id = serializers.CharField(source='sensor.device_id', read_only=True)
    measurements_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Alert
        fields = [
            'id', 'sensor', 'sensor_device_id', 'phase', 'is_active',
            'phase_1_started_at', 'phase_2_started_at', 'phase_3_started_at',
            'created_at', 'measurements_count'
        ]
        read_only_fields = ['id', 'created_at', 'phase_1_started_at', 'phase_2_started_at', 'phase_3_started_at']
    
    def get_measurements_count(self, obj):
        """Retourne le nombre de mesures associées à cette alerte."""
        if hasattr(obj, 'measurements'):
            return obj.measurements.count()
        return 0
