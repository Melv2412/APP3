"""
Admin pour l'app community (Zones à Risque).
"""
from django.contrib import admin
from .models import RiskZone


@admin.register(RiskZone)
class RiskZoneAdmin(admin.ModelAdmin):
    """Admin pour les zones à risque."""
    
    list_display = [
        'zone',
        'risk_level',
        'pollution_level',
        'respiratory_signal_count',
        'high_risk_predictions_count',
        'is_active',
        'last_updated',
    ]
    list_filter = ['risk_level', 'is_active', 'last_updated']
    search_fields = ['zone__name']
    readonly_fields = ['last_updated']
    ordering = ['-risk_level', '-last_updated']
