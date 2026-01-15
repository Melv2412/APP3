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
