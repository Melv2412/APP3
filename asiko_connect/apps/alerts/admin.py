# alerts/admin.py
from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("id", "sensor", "phase", "is_active", "created_at")
    list_filter = ("phase", "is_active")
