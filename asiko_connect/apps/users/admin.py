"""
Configuration de l'interface d'administration pour les utilisateurs.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration de l'admin pour le modèle User personnalisé."""
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations ASIKO', {
            'fields': ('role', 'phone', 'date_of_birth', 'is_verified')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations ASIKO', {
            'fields': ('role', 'phone', 'date_of_birth', 'email', 'first_name', 'last_name')
        }),
    )
