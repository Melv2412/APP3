"""
Admin pour l'app treatments (Actions Préventives).
"""
from django.contrib import admin
from .models import PreventionAction


@admin.register(PreventionAction)
class PreventionActionAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les actions préventives.
    """
    list_display = [
        'id',
        'user',
        'action_type',
        'priority',
        'completed',
        'alert',
        'created_at',
        'completed_at',
    ]
    list_filter = [
        'action_type',
        'priority',
        'completed',
        'created_at',
    ]
    search_fields = [
        'user__username',
        'user__email',
        'recommendation_text',
        'alert__id',
    ]
    readonly_fields = ['created_at', 'completed_at']
    ordering = ['-priority', '-created_at']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('user', 'alert', 'action_type', 'priority')
        }),
        ('Recommandation', {
            'fields': ('recommendation_text',)
        }),
        ('Statut', {
            'fields': ('completed', 'completed_at')
        }),
        ('Dates', {
            'fields': ('created_at',)
        }),
    )
