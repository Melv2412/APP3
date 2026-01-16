"""
Admin pour l'app community (Zones à Risque et Établissements de Santé).
"""
from django.contrib import admin
from .models import RiskZone, HealthFacility


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


@admin.register(HealthFacility)
class HealthFacilityAdmin(admin.ModelAdmin):
    """Admin pour les établissements de santé."""
    
    list_display = [
        'name',
        'facility_type',
        'address',
        'phone',
        'has_emergency',
        'has_pneumology',
        'is_active',
    ]
    list_filter = ['facility_type', 'has_emergency', 'has_pneumology', 'is_active']
    search_fields = ['name', 'address']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'facility_type', 'address', 'is_active')
        }),
        ('Localisation', {
            'fields': ('latitude', 'longitude')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'opening_hours')
        }),
        ('Services', {
            'fields': ('has_emergency', 'has_pneumology')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
