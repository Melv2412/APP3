from rest_framework import serializers
from .models import SensorMeasurement, Prediction
from asiko_connect.apps.users.serializers import UserSerializer
from asiko_connect.apps.users.models import User  # import de la classe réelle

class SensorMeasurementSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PATIENT),
        source='user',
        write_only=True
    )

    class Meta:
        model = SensorMeasurement
        fields = [
            'id', 'user', 'user_id',
            'temperature', 'respiratory_rate', 'heart_rate',
            'spo2', 'systolic_bp', 'wbc',
            'curb65', 'delta_respiratory_rate', 'delta_spo2', 'delta_wbc',
            'rr_trend', 'spo2_trend',
            'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'curb65',
            'delta_respiratory_rate', 'delta_spo2', 'delta_wbc',
            'rr_trend', 'spo2_trend', 'created_at'
        ]


class PredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PATIENT),
        source='user',
        write_only=True
    )

    class Meta:
        model = Prediction
        fields = ['id', 'user', 'user_id', 'input_data', 'result', 'created_at']
        read_only_fields = ['id', 'user', 'result', 'created_at']
