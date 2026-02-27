"""
Signaux pour l'app alerts.
Déclenche automatiquement la génération d'actions préventives
quand une alerte est créée ou devient active.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from .models import Alert

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Alert)
def alert_created_or_updated(sender, instance, created, **kwargs):
    """
    Signal déclenché quand une alerte est créée ou mise à jour.
    Génère automatiquement les actions préventives pour les utilisateurs affectés.
    """
    try:
        # Ne générer que si l'alerte est active
        if instance.is_active:
            logger.info(f"🚨 Génération d'actions préventives pour l'alerte {instance.id}")
            
            # Import local pour éviter les imports circulaires
            from asiko_connect.apps.treatments.services import generate_prevention_actions_for_alert_to_users
            
            # Générer les actions préventives
            actions_created = generate_prevention_actions_for_alert_to_users(instance)
            
            if actions_created:
                logger.info(f"  {len(actions_created)} action(s) préventive(s) créée(s) pour l'alerte {instance.id}")
            else:
                logger.warning(f"⚠️ Aucune action préventive créée pour l'alerte {instance.id}")
    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération des actions préventives: {str(e)}", exc_info=True)