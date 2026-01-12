# alerts/models.py
from django.db import models
from asiko_connect.apps.sensors.models import Sensor


class Alert(models.Model):
    PHASE_1 = "PHASE_1"
    PHASE_2 = "PHASE_2"
    PHASE_3 = "PHASE_3"

    PHASE_CHOICES = [
        (PHASE_1, "Phase 1"),
        (PHASE_2, "Phase 2"),
        (PHASE_3, "Phase 3"),
    ]

    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    phase = models.CharField(max_length=10, choices=PHASE_CHOICES)
    is_active = models.BooleanField(default=True)

    phase_1_started_at = models.DateTimeField()
    phase_2_started_at = models.DateTimeField(null=True, blank=True)
    phase_3_started_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
