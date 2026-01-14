"""
Services pour la génération automatique d'actions préventives.
"""
from django.utils import timezone
from django.db.models import Q
from asiko_connect.apps.treatments.models import PreventionAction
from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.sensors.models import Sensor, Zone


def generate_prevention_actions_for_alert(alert):
    """
    Génère des actions préventives pour tous les utilisateurs
    basées sur une alerte donnée.
    
    Args:
        alert: Instance d'Alert
    
    Returns:
        list: Liste des PreventionAction créées
    """
    if not alert or not alert.is_active:
        return []
    
    actions_created = []
    
    # Récupérer tous les utilisateurs (patients) qui pourraient être affectés
    # Pour l'instant, on génère pour tous les patients
    # TODO: Filtrer par zone géographique si nécessaire
    from asiko_connect.apps.users.models import User
    users = User.objects.filter(role=User.Role.PATIENT)
    
    # Déterminer le type d'action et la priorité selon la phase de l'alerte
    if alert.phase == Alert.PHASE_1:
        # Phase 1 : Avertissement modéré
        action_type = PreventionAction.WEAR_MASK
        priority = PreventionAction.MEDIUM
        recommendation_text = (
            f"Attention : Un niveau de pollution élevé a été détecté dans la zone {alert.sensor.zone.name}. "
            f"Portez un masque si vous devez sortir."
        )
    elif alert.phase == Alert.PHASE_2:
        # Phase 2 : Action urgente
        action_type = PreventionAction.AVOID_ZONE
        priority = PreventionAction.HIGH
        recommendation_text = (
            f"Zone à risque détectée : {alert.sensor.zone.name}. "
            f"Éloignez-vous rapidement de cette zone si vous vous y trouvez."
        )
    elif alert.phase == Alert.PHASE_3:
        # Phase 3 : Évacuation critique
        action_type = PreventionAction.AVOID_ZONE
        priority = PreventionAction.HIGH
        recommendation_text = (
            f"⚠️ ALERTE CRITIQUE : Zone {alert.sensor.zone.name} en danger. "
            f"Éloignez-vous immédiatement de cette zone. Restez à domicile si possible."
        )
    else:
        return []
    
    # Créer une action pour chaque utilisateur
    for user in users:
        # Vérifier si une action similaire existe déjà et n'est pas complétée
        existing_action = PreventionAction.objects.filter(
            user=user,
            alert=alert,
            action_type=action_type,
            completed=False
        ).first()
        
        if not existing_action:
            action = PreventionAction.objects.create(
                user=user,
                alert=alert,
                action_type=action_type,
                recommendation_text=recommendation_text,
                priority=priority
            )
            actions_created.append(action)
    
    # Pour Phase 3, ajouter aussi une action "Rester à domicile" pour chaque utilisateur
    if alert.phase == Alert.PHASE_3:
        for user in users:
            existing_stay_home = PreventionAction.objects.filter(
                user=user,
                alert=alert,
                action_type=PreventionAction.STAY_HOME,
                completed=False
            ).first()
            
            if not existing_stay_home:
                stay_home_action = PreventionAction.objects.create(
                    user=user,
                    alert=alert,
                    action_type=PreventionAction.STAY_HOME,
                    recommendation_text=(
                        f"Restez à domicile. La zone {alert.sensor.zone.name} présente un risque critique."
                    ),
                    priority=PreventionAction.HIGH
                )
                actions_created.append(stay_home_action)
    
    return actions_created


def generate_prevention_actions_for_user(user, prediction=None, alerts=None, risk_zones=None):
    """
    Génère des actions préventives pour un utilisateur spécifique
    basées sur ses prédictions, alertes actives et zones à risque.
    
    Args:
        user: Instance d'User (patient)
        prediction: Instance de Prediction (optionnel)
        alerts: QuerySet d'Alert actives (optionnel)
        risk_zones: Liste de zones à risque (optionnel)
    
    Returns:
        list: Liste des PreventionAction créées
    """
    actions_created = []
    
    # Actions basées sur les alertes actives
    if alerts:
        for alert in alerts:
            if alert.is_active:
                actions = generate_prevention_actions_for_alert(alert)
                # Filtrer pour cet utilisateur
                user_actions = [a for a in actions if a.user == user]
                actions_created.extend(user_actions)
    
    # Actions basées sur les prédictions (risque élevé)
    if prediction and prediction.result:
        risk_score = prediction.result.get('risk_score', 0)
        if risk_score > 0.7:  # Risque élevé
            # Vérifier si l'action existe déjà
            existing = PreventionAction.objects.filter(
                user=user,
                action_type=PreventionAction.CONSULT_DOCTOR,
                completed=False
            ).first()
            
            if not existing:
                action = PreventionAction.objects.create(
                    user=user,
                    action_type=PreventionAction.CONSULT_DOCTOR,
                    recommendation_text=(
                        f"Votre risque de pneumonie est élevé ({risk_score*100:.0f}%). "
                        f"Consultez un médecin dès que possible."
                    ),
                    priority=PreventionAction.HIGH
                )
                actions_created.append(action)
    
    # Actions basées sur les zones à risque
    if risk_zones:
        for zone in risk_zones:
            # Vérifier si l'action existe déjà
            existing = PreventionAction.objects.filter(
                user=user,
                action_type=PreventionAction.AVOID_ZONE,
                recommendation_text__icontains=zone.get('name', ''),
                completed=False
            ).first()
            
            if not existing:
                action = PreventionAction.objects.create(
                    user=user,
                    action_type=PreventionAction.AVOID_ZONE,
                    recommendation_text=(
                        f"Zone à risque détectée : {zone.get('name', 'Zone')}. "
                        f"Évitez cette zone si possible."
                    ),
                    priority=PreventionAction.MEDIUM
                )
                actions_created.append(action)
    
    return actions_created


def suggest_actions_based_on_risk(user):
    """
    Suggère des actions préventives basées sur le profil de risque de l'utilisateur.
    Utilise les prédictions récentes, alertes actives et zones à risque.
    
    Args:
        user: Instance d'User (patient)
    
    Returns:
        list: Liste des PreventionAction créées
    """
    # Récupérer les prédictions récentes
    from asiko_connect.apps.sensors.models import Prediction
    recent_prediction = Prediction.objects.filter(
        user=user
    ).order_by('-created_at').first()
    
    # Récupérer les alertes actives
    active_alerts = Alert.objects.filter(is_active=True)
    
    # Récupérer les zones à risque (simplifié pour l'instant)
    # TODO: Implémenter la logique de détection des zones à risque
    
    return generate_prevention_actions_for_user(
        user=user,
        prediction=recent_prediction,
        alerts=active_alerts,
        risk_zones=None
    )
