"""
Modèles pour la gestion des profils de santé des patients.
SPÉCIFIQUE À LA PRÉDICTION DE PNEUMONIE - ASIKO.

Ce module gère les facteurs de risque et l'indice de vulnérabilité
spécifiquement pour prédire le risque de développer une pneumonie.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import date


class Comorbidity(models.Model):
    """
    Modèle pour les comorbidités (maladies chroniques).
    
    SPÉCIFIQUE À LA PNEUMONIE : Liste des comorbidités qui sont
    des facteurs de risque connus pour développer une pneumonie.
    """
    
    class ComorbidityType(models.TextChoices):
        ASTHMA = 'ASTHMA', _('Asthme')
        DIABETES = 'DIABETES', _('Diabète')
        HEART_DISEASE = 'HEART_DISEASE', _('Maladie cardiaque')
        COPD = 'COPD', _('BPCO (Bronchopneumopathie chronique obstructive)')
        KIDNEY_DISEASE = 'KIDNEY_DISEASE', _('Maladie rénale')
        LIVER_DISEASE = 'LIVER_DISEASE', _('Maladie hépatique')
        CANCER = 'CANCER', _('Cancer')
        IMMUNOSUPPRESSION = 'IMMUNOSUPPRESSION', _('Immunosuppression')
        OTHER = 'OTHER', _('Autre')
    
    name = models.CharField(
        max_length=50,
        choices=ComorbidityType.choices,
        verbose_name=_('Type de comorbidité')
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Description')
    )
    
    severity = models.CharField(
        max_length=20,
        choices=[
            ('MILD', _('Légère')),
            ('MODERATE', _('Modérée')),
            ('SEVERE', _('Sévère')),
        ],
        default='MILD',
        verbose_name=_('Sévérité')
    )
    
    diagnosed_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de diagnostic')
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active')
    )
    
    class Meta:
        verbose_name = _('Comorbidité')
        verbose_name_plural = _('Comorbidités')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.get_name_display()} ({self.get_severity_display()})"


class VaccinationStatus(models.Model):
    """
    Modèle pour le statut vaccinal.
    
    SPÉCIFIQUE À LA PNEUMONIE : Vaccins qui protègent contre
    les infections respiratoires pouvant mener à la pneumonie
    (pneumonie, COVID-19, grippe).
    """
    
    class VaccineType(models.TextChoices):
        PNEUMONIA = 'PNEUMONIA', _('Vaccin pneumonie (Pneumovax, Prevenar)')
        COVID19 = 'COVID19', _('Vaccin COVID-19')
        FLU = 'FLU', _('Vaccin grippe')
        OTHER = 'OTHER', _('Autre')
    
    vaccine_type = models.CharField(
        max_length=20,
        choices=VaccineType.choices,
        verbose_name=_('Type de vaccin')
    )
    
    is_vaccinated = models.BooleanField(
        default=False,
        verbose_name=_('Vacciné')
    )
    
    vaccination_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de vaccination')
    )
    
    booster_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de rappel')
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes')
    )
    
    class Meta:
        verbose_name = _('Statut vaccinal')
        verbose_name_plural = _('Statuts vaccinaux')
        ordering = ['vaccine_type']
    
    def __str__(self):
        status = _('Vacciné') if self.is_vaccinated else _('Non vacciné')
        return f"{self.get_vaccine_type_display()} - {status}"


class HealthProfile(models.Model):
    """
    Modèle principal pour le profil de santé d'un patient.
    Lié à un User (OneToOne).
    
    SPÉCIFIQUE À LA PNEUMONIE : Ce profil contient uniquement
    les informations nécessaires pour évaluer le risque de
    développer une pneumonie (facteurs de risque, comorbidités,
    statut vaccinal, indice de vulnérabilité à la pneumonie).
    """
    
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='health_profile',
        verbose_name=_('Utilisateur')
    )
    
    # Informations démographiques et médicales
    age = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(150)],
        verbose_name=_('Âge')
    )
    
    height = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
        help_text=_('Taille en cm'),
        verbose_name=_('Taille (cm)')
    )
    
    weight = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
        help_text=_('Poids en kg'),
        verbose_name=_('Poids (kg)')
    )
    
    # Comorbidités
    comorbidities = models.ManyToManyField(
        Comorbidity,
        blank=True,
        related_name='health_profiles',
        verbose_name=_('Comorbidités')
    )
    
    # Statut vaccinal
    vaccination_statuses = models.ManyToManyField(
        VaccinationStatus,
        blank=True,
        related_name='health_profiles',
        verbose_name=_('Statuts vaccinaux')
    )
    
    # Historique médical
    medical_history = models.TextField(
        blank=True,
        null=True,
        help_text=_('Historique médical général'),
        verbose_name=_('Historique médical')
    )
    
    # Facteurs de risque additionnels
    smoking_status = models.CharField(
        max_length=20,
        choices=[
            ('NEVER', _('Jamais')),
            ('FORMER', _('Ancien fumeur')),
            ('CURRENT', _('Fumeur actuel')),
        ],
        default='NEVER',
        verbose_name=_('Statut tabagique')
    )
    
    alcohol_consumption = models.CharField(
        max_length=20,
        choices=[
            ('NONE', _('Aucune')),
            ('OCCASIONAL', _('Occasionnelle')),
            ('REGULAR', _('Régulière')),
            ('HEAVY', _('Importante')),
        ],
        default='NONE',
        verbose_name=_('Consommation d\'alcool')
    )
    
    # Indice de vulnérabilité (calculé)
    vulnerability_index = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Score de vulnérabilité calculé (0-100)'),
        verbose_name=_('Indice de vulnérabilité')
    )
    
    vulnerability_index_last_calculated = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Dernier calcul de l\'indice')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de mise à jour')
    )
    
    class Meta:
        verbose_name = _('Profil de santé')
        verbose_name_plural = _('Profils de santé')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Profil de santé de {self.user.username}"
    
    def calculate_age(self):
        """Calcule l'âge à partir de la date de naissance si disponible."""
        if self.user.date_of_birth:
            today = date.today()
            return today.year - self.user.date_of_birth.year - (
                (today.month, today.day) < (self.user.date_of_birth.month, self.user.date_of_birth.day)
            )
        return self.age
    
    def calculate_vulnerability_index(self):
        """
        Calcule l'indice de vulnérabilité SPÉCIFIQUE À LA PNEUMONIE.
        
        Basé sur les facteurs de risque connus pour la pneumonie :
        - Âge (0-30 points) : les personnes âgées sont plus à risque
        - Comorbidités respiratoires et systémiques (0-40 points)
        - Statut vaccinal contre pneumonie/COVID/grippe (0-20 points de réduction)
        - Facteurs de risque (tabagisme, alcool) (0-10 points)
        
        Score total : 0-100 (plus élevé = plus vulnérable à la pneumonie)
        """
        score = 0.0
        
        # 1. Score basé sur l'âge (0-30 points)
        age = self.calculate_age()
        if age:
            if age >= 75:
                score += 30
            elif age >= 65:
                score += 25
            elif age >= 55:
                score += 15
            elif age >= 45:
                score += 10
            elif age >= 35:
                score += 5
            # 0-34 ans : 0 points
        
        # 2. Score basé sur les comorbidités (0-40 points)
        comorbidities = self.comorbidities.filter(is_active=True)
        comorbidity_count = comorbidities.count()
        
        if comorbidity_count > 0:
            # Score de base pour avoir des comorbidités
            base_score = min(comorbidity_count * 8, 30)  # Max 30 pour le nombre
            score += base_score
            
            # Bonus pour comorbidités sévères
            severe_count = comorbidities.filter(severity='SEVERE').count()
            score += min(severe_count * 5, 10)  # Max 10 pour sévérité
        
        # 3. Score basé sur le statut vaccinal (0-20 points de réduction)
        vaccination_bonus = 0
        vaccination_statuses = self.vaccination_statuses.all()
        
        # Vaccination pneumonie
        pneumonia_vaccine = vaccination_statuses.filter(
            vaccine_type='PNEUMONIA',
            is_vaccinated=True
        ).first()
        if pneumonia_vaccine:
            vaccination_bonus += 10
        
        # Vaccination COVID-19
        covid_vaccine = vaccination_statuses.filter(
            vaccine_type='COVID19',
            is_vaccinated=True
        ).first()
        if covid_vaccine:
            vaccination_bonus += 5
        
        # Vaccination grippe (récente)
        flu_vaccine = vaccination_statuses.filter(
            vaccine_type='FLU',
            is_vaccinated=True
        ).first()
        if flu_vaccine and flu_vaccine.vaccination_date:
            # Vérifier si la vaccination est récente (moins de 12 mois)
            months_since_vaccination = (
                (timezone.now().date() - flu_vaccine.vaccination_date).days / 30
            )
            if months_since_vaccination < 12:
                vaccination_bonus += 5
        
        # Réduire le score avec le bonus vaccinal
        score = max(0, score - vaccination_bonus)
        
        # 4. Score basé sur les facteurs de risque (0-10 points)
        if self.smoking_status == 'CURRENT':
            score += 8
        elif self.smoking_status == 'FORMER':
            score += 3
        
        if self.alcohol_consumption == 'HEAVY':
            score += 5
        elif self.alcohol_consumption == 'REGULAR':
            score += 2
        
        # Normaliser entre 0 et 100
        score = min(100, max(0, score))
        
        # Sauvegarder le score
        self.vulnerability_index = round(score, 2)
        self.vulnerability_index_last_calculated = timezone.now()
        self.save(update_fields=['vulnerability_index', 'vulnerability_index_last_calculated'])
        
        return self.vulnerability_index
    
    def get_vulnerability_level(self):
        """
        Retourne le niveau de vulnérabilité à la PNEUMONIE basé sur l'indice.
        """
        if not self.vulnerability_index:
            return _('Non calculé')
        
        if self.vulnerability_index >= 70:
            return _('Très élevé')
        elif self.vulnerability_index >= 50:
            return _('Élevé')
        elif self.vulnerability_index >= 30:
            return _('Modéré')
        elif self.vulnerability_index >= 15:
            return _('Faible')
        else:
            return _('Très faible')
    
    @property
    def bmi(self):
        """Calcule l'IMC (Indice de Masse Corporelle)."""
        if self.height and self.weight and self.height > 0:
            height_m = self.height / 100  # Conversion cm en m
            return round(self.weight / (height_m ** 2), 2)
        return None
