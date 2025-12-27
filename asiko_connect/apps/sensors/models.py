"""Models placeholder for `sensors` app."""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


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
