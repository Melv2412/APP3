from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modèle utilisateur global pour ASIKO.
    Peut être PATIENT, DOCTOR ou ADMIN.
    """

    class Role(models.TextChoices):
        PATIENT = 'PATIENT', _('Patient')
        DOCTOR = 'DOCTOR', _('Médecin')
        ADMIN = 'ADMIN', _('Administrateur')

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

    is_verified = models.BooleanField(default=False, verbose_name=_('Compte vérifié'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT

    @property
    def is_doctor(self):
        return self.role == self.Role.DOCTOR

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN


class PatientData(models.Model):
    """
    Données STATIQUES du patient (créées une seule fois).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_data",
        verbose_name=_("Patient")
    )

    # Données démographiques / antécédents
    age = models.PositiveIntegerField()
    smoking = models.BooleanField(default=False)
    diabetes = models.BooleanField(default=False)
    copd_asthma = models.BooleanField(default=False)
    immunosuppression = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Données patient")
        verbose_name_plural = _("Données patients")

    def __str__(self):
        return f"Données statiques de {self.user.username}"
