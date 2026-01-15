from rest_framework import serializers

from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.community.models import RiskZone
from asiko_connect.apps.environment.models import EnvironmentData
from asiko_connect.apps.sensors.models import Prediction, SensorMeasurement
from asiko_connect.apps.treatments.models import PreventionAction


class RiskZoneSerializer(serializers.ModelSerializer):
    """
    Serializer léger pour exposer les zones à risque sur le dashboard
    santé publique.
    """

    latitude = serializers.FloatField(source="zone.latitude", read_only=True)
    longitude = serializers.FloatField(source="zone.longitude", read_only=True)
    name = serializers.CharField(source="zone.name", read_only=True)

    class Meta:
        model = RiskZone
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "risk_level",
            "pollution_level",
            "respiratory_signal_count",
            "high_risk_predictions_count",
            "last_updated",
            "is_active",
            "radius_meters",
        ]


class PollutionPointSerializer(serializers.ModelSerializer):
    """
    Serializer pour la carte pollution (points géolocalisés).
    """

    pollution_level = serializers.SerializerMethodField()
    pollution_level_text = serializers.SerializerMethodField()

    class Meta:
        model = EnvironmentData
        fields = [
            "id",
            "latitude",
            "longitude",
            "pm25",
            "pm10",
            "no2",
            "humidity",
            "temperature",
            "pollution_level",
            "pollution_level_text",
            "timestamp",
        ]

    def get_pollution_level(self, obj):
        return obj.pollution_level

    def get_pollution_level_text(self, obj):
        return obj.pollution_level_text


class TrendPointSerializer(serializers.Serializer):
    """
    Point de tendance temporelle (pour graphiques simples).
    """

    date = serializers.DateField()
    total = serializers.IntegerField()
    high_risk = serializers.IntegerField()
    alerts = serializers.IntegerField()


class PredictionEntrySerializer(serializers.ModelSerializer):
    """
    Entrée de journal pour une prédiction (vue patient/doctor).
    """

    probabilite_pneumonie_72h = serializers.SerializerMethodField()
    niveau_risque = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = [
            "id",
            "user",
            "result",
            "probabilite_pneumonie_72h",
            "niveau_risque",
            "created_at",
        ]
        read_only_fields = fields

    def get_probabilite_pneumonie_72h(self, obj):
        if isinstance(obj.result, dict):
            return obj.result.get("probabilite_pneumonie_72h")
        return None

    def get_niveau_risque(self, obj):
        if isinstance(obj.result, dict):
            return obj.result.get("niveau_risque")
        return None


class MeasurementEntrySerializer(serializers.ModelSerializer):
    """
    Entrée de journal pour une mesure capteur.
    """

    class Meta:
        model = SensorMeasurement
        fields = [
            "id",
            "user",
            "temperature",
            "respiratory_rate",
            "heart_rate",
            "spo2",
            "systolic_bp",
            "wbc",
            "curb65",
            "rr_trend",
            "spo2_trend",
            "created_at",
        ]
        read_only_fields = fields


class PreventionActionEntrySerializer(serializers.ModelSerializer):
    """
    Entrée de journal pour une action préventive.
    """

    class Meta:
        model = PreventionAction
        fields = [
            "id",
            "user",
            "action_type",
            "recommendation_text",
            "priority",
            "completed",
            "completed_at",
            "created_at",
        ]
        read_only_fields = fields


class AlertEntrySerializer(serializers.ModelSerializer):
    """
    Entrée de journal pour une alerte (sans lien user direct dans le modèle).
    """

    class Meta:
        model = Alert
        fields = [
            "id",
            "sensor",
            "phase",
            "is_active",
            "phase_1_started_at",
            "phase_2_started_at",
            "phase_3_started_at",
            "created_at",
        ]
        read_only_fields = fields


class EnvironmentEntrySerializer(serializers.ModelSerializer):
    """
    Entrée de journal pour une donnée environnementale.
    """

    pollution_level = serializers.SerializerMethodField()
    pollution_level_text = serializers.SerializerMethodField()

    class Meta:
        model = EnvironmentData
        fields = [
            "id",
            "latitude",
            "longitude",
            "pm25",
            "pm10",
            "no2",
            "humidity",
            "temperature",
            "pollution_level",
            "pollution_level_text",
            "timestamp",
        ]
        read_only_fields = fields

    def get_pollution_level(self, obj):
        return obj.pollution_level

    def get_pollution_level_text(self, obj):
        return obj.pollution_level_text
