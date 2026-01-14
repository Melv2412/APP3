"""
Modèles pour l'app treatments (Actions Préventives).
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class PreventionAction(models.Model):
    """
    Action préventive recommandée pour un utilisateur.
    Générée automatiquement à partir des alertes, prédictions ou zones à risque.
    """
    
    # Types d'actions
    AVOID_ZONE = "AVOID_ZONE"
    WEAR_MASK = "WEAR_MASK"
    CHECK_SPO2 = "CHECK_SPO2"
    CONSULT_DOCTOR = "CONSULT_DOCTOR"
    STAY_HOME = "STAY_HOME"
    HYDRATE = "HYDRATE"
    REST = "REST"
    MONITOR_SYMPTOMS = "MONITOR_SYMPTOMS"
    OTHER = "OTHER"
    
    ACTION_TYPE_CHOICES = [
        (AVOID_ZONE, _("Éviter une zone")),
        (WEAR_MASK, _("Porter un masque")),
        (CHECK_SPO2, _("Vérifier SpO₂")),
        (CONSULT_DOCTOR, _("Consulter un médecin")),
        (STAY_HOME, _("Rester à domicile")),
        (HYDRATE, _("S'hydrater")),
        (REST, _("Se reposer")),
        (MONITOR_SYMPTOMS, _("Surveiller les symptômes")),
        (OTHER, _("Autre")),
    ]
    
    # Priorités
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    
    PRIORITY_CHOICES = [
        (HIGH, _("Haute")),
        (MEDIUM, _("Moyenne")),
        (LOW, _("Basse")),
    ]
    
    # Relations
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prevention_actions",
        verbose_name=_("Utilisateur")
    )
    
    alert = models.ForeignKey(
        "alerts.Alert",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prevention_actions",
        verbose_name=_("Alerte associée")
    )
    
    # Champs principaux
    action_type = models.CharField(
        max_length=50,
        choices=ACTION_TYPE_CHOICES,
        verbose_name=_("Type d'action")
    )
    
    recommendation_text = models.TextField(
        verbose_name=_("Texte de recommandation")
    )
    
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default=MEDIUM,
        verbose_name=_("Priorité")
    )
    
    completed = models.BooleanField(
        default=False,
        verbose_name=_("Complétée")
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Date de complétion")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Action préventive")
        verbose_name_plural = _("Actions préventives")
        ordering = ["-priority", "-created_at"]
        indexes = [
            models.Index(fields=["user", "completed"]),
            models.Index(fields=["alert", "completed"]),
            models.Index(fields=["priority", "completed"]),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.user.username} ({self.get_priority_display()})"
    
    def mark_as_completed(self):
        """Marque l'action comme complétée."""
        from django.utils import timezone
        self.completed = True
        self.completed_at = timezone.now()
        self.save(update_fields=["completed", "completed_at"])
