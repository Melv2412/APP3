# sensors/admin.py
from django.contrib import admin
from .models import Sensor,AirQualityMeasurement

admin.site.register(Sensor)
admin.site.register(AirQualityMeasurement)
