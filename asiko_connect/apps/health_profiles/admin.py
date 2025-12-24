"""
Configuration de l'interface d'administration pour les profils de santé.
"""
from django.contrib import admin
from .models import HealthProfile, Comorbidity, VaccinationStatus


@admin.register(Comorbidity)
class ComorbidityAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour les comorbidités."""
    
    list_display = ['name', 'severity', 'is_active', 'diagnosed_date']
    list_filter = ['name', 'severity', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(VaccinationStatus)
class VaccinationStatusAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour les statuts vaccinaux."""
    
    list_display = ['vaccine_type', 'is_vaccinated', 'vaccination_date', 'booster_date']
    list_filter = ['vaccine_type', 'is_vaccinated']
    search_fields = ['notes']
    ordering = ['vaccine_type']


@admin.register(HealthProfile)
class HealthProfileAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour les profils de santé."""
    
    list_display = [
        'user',
        'age',
        'vulnerability_index',
        'vulnerability_level_display',
        'smoking_status',
        'created_at',
    ]
    list_filter = [
        'smoking_status',
        'alcohol_consumption',
        'created_at',
    ]
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'medical_history',
    ]
    readonly_fields = [
        'vulnerability_index',
        'vulnerability_index_last_calculated',
        'created_at',
        'updated_at',
        'bmi',
    ]
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Informations démographiques', {
            'fields': ('age', 'height', 'weight', 'bmi')
        }),
        ('Comorbidités et vaccinations', {
            'fields': ('comorbidities', 'vaccination_statuses')
        }),
        ('Historique médical', {
            'fields': ('medical_history',)
        }),
        ('Facteurs de risque', {
            'fields': ('smoking_status', 'alcohol_consumption')
        }),
        ('Indice de vulnérabilité', {
            'fields': (
                'vulnerability_index',
                'vulnerability_index_last_calculated',
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ['comorbidities', 'vaccination_statuses']
    
    def vulnerability_level_display(self, obj):
        """Affiche le niveau de vulnérabilité."""
        return obj.get_vulnerability_level()
    vulnerability_level_display.short_description = 'Niveau de vulnérabilité'
    
    actions = ['recalculate_vulnerability_index']
    
    def recalculate_vulnerability_index(self, request, queryset):
        """Action admin pour recalculer l'indice de vulnérabilité."""
        count = 0
        for profile in queryset:
            profile.calculate_vulnerability_index()
            count += 1
        
        self.message_user(
            request,
            f"Indice de vulnérabilité recalculé pour {count} profil(s)."
        )
    recalculate_vulnerability_index.short_description = "Recalculer l'indice de vulnérabilité"
