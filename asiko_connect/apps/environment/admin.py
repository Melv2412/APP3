"""
Configuration admin pour l'app environment.
"""
from django.contrib import admin
from .models import EnvironmentData


@admin.register(EnvironmentData)
class EnvironmentDataAdmin(admin.ModelAdmin):
    """Admin pour les données environnementales."""
    
    list_display = [
        'id',
        'latitude',
        'longitude',
        'pm25',
        'pm10',
        'no2',
        'pollution_level_text',
        'temperature',
        'humidity',
        'source',
        'timestamp',
    ]
    
    list_filter = [
        'source',
        'timestamp',
    ]
    
    search_fields = [
        'latitude',
        'longitude',
    ]
    
    readonly_fields = [
        'pollution_level',
        'pollution_level_text',
        'timestamp',
    ]
    
    fieldsets = (
        ('Localisation', {
            'fields': ('latitude', 'longitude')
        }),
        ('Pollution de l\'air', {
            'fields': ('pm25', 'pm10', 'no2', 'pollution_level', 'pollution_level_text')
        }),
        ('Météorologie', {
            'fields': ('temperature', 'humidity')
        }),
        ('Métadonnées', {
            'fields': ('source', 'timestamp')
        }),
    )
    
    ordering = ['-timestamp']
