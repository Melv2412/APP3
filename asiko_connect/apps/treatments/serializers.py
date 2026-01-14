"""
Serializers pour l'app treatments (Actions Préventives).
"""
from rest_framework import serializers
from .models import PreventionAction


class PreventionActionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les actions préventives.
    """
    action_type_display = serializers.CharField(
        source='get_action_type_display',
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    alert_id = serializers.IntegerField(
        source='alert.id',
        read_only=True
    )
    sensor_zone = serializers.CharField(
        source='alert.sensor.zone.name',
        read_only=True
    )
    
    class Meta:
        model = PreventionAction
        fields = [
            'id',
            'user',
            'alert',
            'alert_id',
            'sensor_zone',
            'action_type',
            'action_type_display',
            'recommendation_text',
            'priority',
            'priority_display',
            'completed',
            'completed_at',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'completed_at',
        ]
