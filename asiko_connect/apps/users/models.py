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

    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Téléphone'))
    date_of_birth = models.DateField(blank=True, null=True, verbose_name=_('Date de naissance'))
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

    class EmergencyRelation(models.TextChoices):
        FATHER = 'FATHER', _('Père')
        MOTHER = 'MOTHER', _('Mère')
        SPOUSE = 'SPOUSE', _('Époux / Épouse')
        BROTHER = 'BROTHER', _('Frère')
        SISTER = 'SISTER', _('Sœur')
        OTHER = 'OTHER', _('Autre')

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

    # Contact d'urgence
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_relation = models.CharField(
        max_length=20,
        choices=EmergencyRelation.choices,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Données patient")
        verbose_name_plural = _("Données patients")

    def __str__(self):
        return f"Données statiques de {self.user.username}"
    
    def save(self, *args, **kwargs):
        """
        Synchronise automatiquement les données avec HealthProfile
        pour que les comorbidités et le tabagisme influencent l'indice de vulnérabilité.
        """
        super().save(*args, **kwargs)
        
        # Créer ou récupérer le HealthProfile
        from asiko_connect.apps.health_profiles.models import HealthProfile, Comorbidity
        
        health_profile, created = HealthProfile.objects.get_or_create(
            user=self.user,
            defaults={'age': self.age}
        )
        
        # Mettre à jour l'âge
        health_profile.age = self.age
        
        # Mettre à jour le statut tabagique
        if self.smoking:
            health_profile.smoking_status = 'CURRENT'
        else:
            health_profile.smoking_status = 'NEVER'
        
        health_profile.save()
        
        # Synchroniser les comorbidités
        # Diabète
        if self.diabetes:
            diabetes_comorbidity, _ = Comorbidity.objects.get_or_create(
                name='DIABETES',
                defaults={'severity': 'MODERATE', 'is_active': True}
            )
            health_profile.comorbidities.add(diabetes_comorbidity)
        
        # COPD/Asthme
        if self.copd_asthma:
            copd_comorbidity, _ = Comorbidity.objects.get_or_create(
                name='COPD',
                defaults={'severity': 'MODERATE', 'is_active': True}
            )
            asthma_comorbidity, _ = Comorbidity.objects.get_or_create(
                name='ASTHMA',
                defaults={'severity': 'MODERATE', 'is_active': True}
            )
            health_profile.comorbidities.add(copd_comorbidity, asthma_comorbidity)
        
        # Immunosuppression
        if self.immunosuppression:
            immuno_comorbidity, _ = Comorbidity.objects.get_or_create(
                name='IMMUNOSUPPRESSION',
                defaults={'severity': 'SEVERE', 'is_active': True}
            )
            health_profile.comorbidities.add(immuno_comorbidity)
        
        # Recalculer l'indice de vulnérabilité
        health_profile.calculate_vulnerability_index()
