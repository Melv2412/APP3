"""Models placeholder for `sensors` app."""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from asiko_connect.utils.calculs import calculate_air_quality_index


class SensorMeasurement(models.Model):
    """
    Mesures envoyées par les capteurs pour un patient.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sensor_measurements",
        verbose_name=_("Patient")
    )

    # Signes vitaux mesurés
    temperature = models.FloatField()
    respiratory_rate = models.FloatField()
    heart_rate = models.FloatField()
    spo2 = models.FloatField()
    systolic_bp = models.FloatField()
    wbc = models.FloatField()

    # Champs calculés
    curb65 = models.IntegerField(default=0)
    delta_respiratory_rate = models.FloatField(default=0.0)
    delta_spo2 = models.FloatField(default=0.0)
    delta_wbc = models.FloatField(default=0.0)
    rr_trend = models.FloatField(default=0.0)
    spo2_trend = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Mesure capteur")
        verbose_name_plural = _("Mesures capteurs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mesure de {self.user.username} à {self.created_at}"


class Prediction(models.Model):
    """
    Résultats des prédictions ML pour un patient.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="predictions",
        verbose_name=_("Patient")
    )
    input_data = models.JSONField()
    result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Prédiction")
        verbose_name_plural = _("Prédictions")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Prédiction pour {self.user.username} à {self.created_at}"


# sensors/models.py

class Zone(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True, verbose_name=_("Latitude"))
    longitude = models.FloatField(null=True, blank=True, verbose_name=_("Longitude"))

    def __str__(self):
        return self.name


class Sensor(models.Model):
    device_id = models.CharField(max_length=100, unique=True)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE)

    def __str__(self):
        return self.device_id


class AirQualityMeasurement(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name="measurements")
    alert = models.ForeignKey(
        "alerts.Alert",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="measurements"
    )

    pm25 = models.FloatField()
    pm10 = models.FloatField()
    o3 = models.FloatField()
    no2 = models.FloatField()
    so2 = models.FloatField()
    co = models.FloatField()
    humidity = models.FloatField()
    temperature = models.FloatField()

    iqa = models.FloatField()
    category = models.CharField(max_length=100)
    advice = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
