"""
Modèles pour la gestion des données environnementales.
SPÉCIFIQUE À LA PRÉDICTION DE PNEUMONIE - ASIKO.

Ce module gère les données de pollution de l'air et environnementales
qui sont des facteurs de risque pour le développement de pneumonie.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class EnvironmentData(models.Model):
    """
    Modèle pour les données environnementales et de pollution.
    
    SPÉCIFIQUE À LA PNEUMONIE : Les données de pollution de l'air (PM2.5, PM10, NO₂)
    sont des facteurs de risque importants pour le développement de pneumonie,
    particulièrement chez les personnes vulnérables.
    """
    
    class DataSource(models.TextChoices):
        IOT_SENSOR = 'IOT_SENSOR', _('Capteur IoT')
        API_EXTERNE = 'API_EXTERNE', _('API Externe')
        MANUAL = 'MANUAL', _('Saisie manuelle')
        STATION_FIXE = 'STATION_FIXE', _('Station de mesure fixe')
    
    # Localisation (coordonnées GPS)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name=_('Latitude'),
        help_text=_('Latitude GPS (entre -90 et 90)')
    )
    
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name=_('Longitude'),
        help_text=_('Longitude GPS (entre -180 et 180)')
    )
    
    # Données de pollution de l'air (en µg/m³)
    pm25 = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('PM2.5'),
        help_text=_('Concentration de particules fines PM2.5 (µg/m³)')
    )
    
    pm10 = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('PM10'),
        help_text=_('Concentration de particules fines PM10 (µg/m³)')
    )
    
    no2 = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('NO₂'),
        help_text=_('Concentration de dioxyde d\'azote (µg/m³)')
    )
    
    # Données météorologiques
    humidity = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Humidité'),
        help_text=_('Humidité relative (%)')
    )
    
    temperature = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('Température'),
        help_text=_('Température de l\'air (°C)')
    )
    
    # Source et métadonnées
    source = models.CharField(
        max_length=20,
        choices=DataSource.choices,
        default=DataSource.IOT_SENSOR,
        verbose_name=_('Source des données')
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Horodatage'),
        help_text=_('Date et heure de la mesure')
    )
    
    class Meta:
        verbose_name = _('Donnée environnementale')
        verbose_name_plural = _('Données environnementales')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"Données environnementales à ({self.latitude}, {self.longitude}) - {self.timestamp}"
    
    @property
    def pollution_level(self):
        """
        Calcule un niveau de pollution global basé sur PM2.5, PM10 et NO₂.
        Retourne un score de 0 à 100.
        """
        score = 0
        count = 0
        
        # PM2.5 : Seuil OMS = 15 µg/m³ (mauvais > 35)
        if self.pm25 is not None:
            if self.pm25 > 35:
                score += 40
            elif self.pm25 > 25:
                score += 25
            elif self.pm25 > 15:
                score += 10
            count += 1
        
        # PM10 : Seuil OMS = 45 µg/m³ (mauvais > 75)
        if self.pm10 is not None:
            if self.pm10 > 75:
                score += 40
            elif self.pm10 > 55:
                score += 25
            elif self.pm10 > 45:
                score += 10
            count += 1
        
        # NO₂ : Seuil OMS = 25 µg/m³ (mauvais > 100)
        if self.no2 is not None:
            if self.no2 > 100:
                score += 20
            elif self.no2 > 75:
                score += 12
            elif self.no2 > 50:
                score += 6
            count += 1
        
        if count == 0:
            return None
        
        # Normaliser sur 100
        return min(100, score)
    
    @property
    def pollution_level_text(self):
        """Retourne un niveau textuel de pollution."""
        level = self.pollution_level
        if level is None:
            return _('Non disponible')
        elif level >= 60:
            return _('Très élevé')
        elif level >= 40:
            return _('Élevé')
        elif level >= 20:
            return _('Modéré')
        else:
            return _('Faible')
