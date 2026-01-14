from rest_framework import serializers
from .models import SensorMeasurement, Prediction, AirQualityMeasurement
from asiko_connect.apps.users.serializers import UserSerializer
from asiko_connect.apps.users.models import User


class SensorMeasurementSerializer(serializers.ModelSerializer):
    """
    Serializer pour les mesures de capteurs.
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = SensorMeasurement
        fields = [
            'id', 'user', 'user_id', 'temperature', 'respiratory_rate', 
            'heart_rate', 'spo2', 'systolic_bp', 'wbc',
            'curb65', 'delta_respiratory_rate', 'delta_spo2', 'delta_wbc',
            'rr_trend', 'spo2_trend', 'created_at'
        ]
        read_only_fields = [
            'id', 'curb65', 'delta_respiratory_rate', 'delta_spo2', 
            'delta_wbc', 'rr_trend', 'spo2_trend', 'created_at'
        ]


class PredictionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les prédictions ML.
    """
    user = UserSerializer(read_only=True)
    probabilite_pneumonie_72h = serializers.SerializerMethodField()
    niveau_risque = serializers.SerializerMethodField()
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'user', 'input_data', 'result', 
            'probabilite_pneumonie_72h', 'niveau_risque', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_probabilite_pneumonie_72h(self, obj):
        """Extrait la probabilité depuis result."""
        if isinstance(obj.result, dict):
            return obj.result.get('probabilite_pneumonie_72h')
        return None
    
    def get_niveau_risque(self, obj):
        """Extrait le niveau de risque depuis result."""
        if isinstance(obj.result, dict):
            return obj.result.get('niveau_risque')
        return None


class AirQualityMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirQualityMeasurement
        fields = "__all__"
        read_only_fields = ("aqi", "created_at")


