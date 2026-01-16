"""
Modèles pour l'app community (Zones à Risque).
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class RiskZone(models.Model):
    """
    Zone à risque calculée basée sur l'agrégation de données environnementales
    et de signaux respiratoires.
    
    Une RiskZone est liée à une Zone (de sensors) mais contient des données
    calculées et agrégées (niveau de risque, pollution, signaux respiratoires).
    """
    
    class RiskLevel(models.TextChoices):
        LOW = 'LOW', _('Faible')
        MODERATE = 'MODERATE', _('Modéré')
        HIGH = 'HIGH', _('Élevé')
        CRITICAL = 'CRITICAL', _('Critique')
    
    # Référence à la Zone géographique (dans sensors)
    zone = models.OneToOneField(
        'sensors.Zone',
        on_delete=models.CASCADE,
        related_name='risk_zone',
        verbose_name=_('Zone géographique')
    )
    
    # Niveau de risque calculé
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        verbose_name=_('Niveau de risque')
    )
    
    # Données agrégées
    pollution_level = models.FloatField(
        default=0.0,
        help_text=_('Niveau de pollution moyen (IQA)'),
        verbose_name=_('Niveau de pollution')
    )
    
    respiratory_signal_count = models.IntegerField(
        default=0,
        help_text=_('Nombre de signaux respiratoires détectés dans cette zone'),
        verbose_name=_('Nombre de signaux respiratoires')
    )
    
    high_risk_predictions_count = models.IntegerField(
        default=0,
        help_text=_('Nombre de prédictions à risque élevé dans cette zone'),
        verbose_name=_('Prédictions à risque élevé')
    )
    
    # Métadonnées
    last_updated = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Dernière mise à jour')
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Zone active')
    )
    
    # Rayon de la zone (en mètres, pour le calcul de proximité)
    radius_meters = models.FloatField(
        default=1000.0,
        help_text=_('Rayon de la zone en mètres (par défaut 1km)'),
        verbose_name=_('Rayon (m)')
    )
    
    class Meta:
        verbose_name = _('Zone à risque')
        verbose_name_plural = _('Zones à risque')
        ordering = ['-risk_level', '-last_updated']
        indexes = [
            models.Index(fields=['risk_level', 'is_active']),
            models.Index(fields=['last_updated']),
        ]
    
    def __str__(self):
        return f"{self.zone.name} - {self.get_risk_level_display()}"
    
    @property
    def latitude(self):
        """Retourne la latitude de la zone associée."""
        return self.zone.latitude
    
    @property
    def longitude(self):
        """Retourne la longitude de la zone associée."""
        return self.zone.longitude
    
    @property
    def name(self):
        """Retourne le nom de la zone associée."""
        return self.zone.name


class HealthFacility(models.Model):
    """
    Établissement de santé (hôpital, centre de pneumologie, etc.)
    avec coordonnées GPS pour calcul de proximité.
    """
    
    class FacilityType(models.TextChoices):
        HOSPITAL = 'HOSPITAL', _('Hôpital Général')
        PNEUMOLOGY_CENTER = 'PNEUMOLOGY_CENTER', _('Centre de Pneumologie')
        CLINIC = 'CLINIC', _('Clinique')
        HEALTH_CENTER = 'HEALTH_CENTER', _('Centre de Santé')
    
    name = models.CharField(
        max_length=255,
        verbose_name=_('Nom de l\'établissement')
    )
    
    facility_type = models.CharField(
        max_length=30,
        choices=FacilityType.choices,
        verbose_name=_('Type d\'établissement')
    )
    
    address = models.TextField(
        verbose_name=_('Adresse complète')
    )
    
    # Coordonnées GPS
    latitude = models.FloatField(
        verbose_name=_('Latitude')
    )
    
    longitude = models.FloatField(
        verbose_name=_('Longitude')
    )
    
    # Informations de contact
    phone = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('Téléphone')
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_('Email')
    )
    
    # Horaires
    opening_hours = models.TextField(
        blank=True,
        null=True,
        help_text=_('Ex: Lun-Ven: 8h-18h, Sam: 8h-12h'),
        verbose_name=_('Horaires d\'ouverture')
    )
    
    # Services disponibles
    has_emergency = models.BooleanField(
        default=False,
        verbose_name=_('Service d\'urgence')
    )
    
    has_pneumology = models.BooleanField(
        default=False,
        verbose_name=_('Service de pneumologie')
    )
    
    # Métadonnées
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Établissement actif')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Dernière mise à jour')
    )
    
    class Meta:
        verbose_name = _('Établissement de santé')
        verbose_name_plural = _('Établissements de santé')
        ordering = ['name']
        indexes = [
            models.Index(fields=['facility_type', 'is_active']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_facility_type_display()})"
