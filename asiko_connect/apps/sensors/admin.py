# sensors/admin.py
from django.contrib import admin
from .models import Sensor, Zone, AirQualityMeasurement

admin.site.register(Zone)
admin.site.register(Sensor)
admin.site.register(AirQualityMeasurement)
