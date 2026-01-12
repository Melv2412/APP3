from rest_framework import serializers
from .models import SensorMeasurement
from asiko_connect.apps.alerts.models import Alert
from .models import AirQualityMeasurement
class SensorMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorMeasurement
        fields = "__all__"
        read_only_fields = ['curb65', 'delta_respiratory_rate', 'delta_spo2', 'delta_wbc', 'rr_trend', 'spo2_trend']



class AirQualityMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirQualityMeasurement
        fields = "__all__"
        read_only_fields = ("aqi", "created_at")


