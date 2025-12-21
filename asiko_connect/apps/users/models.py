"""
Modèles pour la gestion des utilisateurs (Patients et Médecins).
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour ASIKO.
    Supporte les rôles PATIENT, DOCTOR et ADMIN.
    """
    
    class Role(models.TextChoices):
        PATIENT = 'PATIENT', _('Patient')
        DOCTOR = 'DOCTOR', _('Médecin')
        ADMIN = 'ADMIN', _('Administrateur')
    
    # Champs additionnels
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
        verbose_name=_('Rôle')
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('Téléphone')
    )
    
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de naissance')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de mise à jour')
    )
    
    is_verified = models.BooleanField(
        default=False,
        verbose_name=_('Compte vérifié')
    )
    
    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_patient(self):
        """Vérifie si l'utilisateur est un patient."""
        return self.role == self.Role.PATIENT
    
    @property
    def is_doctor(self):
        """Vérifie si l'utilisateur est un médecin."""
        return self.role == self.Role.DOCTOR
    
    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est un administrateur."""
        return self.role == self.Role.ADMIN
