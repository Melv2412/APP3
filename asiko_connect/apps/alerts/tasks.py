from celery import shared_task
from django.utils import timezone
from asiko_connect.utils.notify import notify_esp
from asiko_connect.utils.variables import *
from .models import Alert
from .services import compute_average_iqa
from celery import shared_task
from django.utils import timezone


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, retry_kwargs={"max_retries": 3})
def phase1_timer_task(self, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id, is_active=True)
    except Alert.DoesNotExist:
        # L’alerte n’existe plus ou a déjà été désactivée
        return

    # ⏱ Calcul de la moyenne IQA sur la fenêtre PHASE 1
    avg_iqa = compute_average_iqa(
        sensor=alert.sensor,
        start_time=alert.phase_1_started_at,
        duration_seconds=PASSAGE_PHASE_1,
        alert=alert  # ou None si tu veux tout le capteur
    )

    print(f"[PHASE 1] Alerte {alert.id} | IQA moyen = {avg_iqa}")

    #  Aucun calcul possible → on ferme
    if avg_iqa is None:
        alert.is_active = False
        alert.save(update_fields=["is_active"])
        print(f"[PHASE 1] Alerte {alert.id} désactivée (aucune mesure)")
        return

    # ❌ Moyenne sous le seuil → on ferme
    if avg_iqa < SEUIL_CRITIQUE*POURCENTAGE_SEUIL_ALERT:
        alert.is_active = False
        alert.save(update_fields=["is_active"])
        print(f"[PHASE 1] Alerte {alert.id} désactivée (IQA insuffisant)")
        return

    # ✅ Passage en PHASE 2
    alert.phase = Alert.PHASE_2
    alert.phase_2_started_at = timezone.now()
    alert.save(update_fields=["phase", "phase_2_started_at"])

    print(f"[PHASE 1 → PHASE 2] Alerte {alert.id}")

    notify_esp(ESP32_IP)

    # ⏱ Lancement du timer phase 2 (PAS immédiat)
    phase2_timer_task.apply_async(
        args=[alert.id],
        countdown=PASSAGE_PHASE_1_TO_2  # ou autre durée si tu veux
    )

@shared_task(bind=True)
def phase2_timer_task(self, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id, is_active=True)
    except Alert.DoesNotExist:
        return


    avg_iqa = compute_average_iqa(
        sensor=alert.sensor,
        start_time=alert.phase_2_started_at,
        duration_seconds=DUREE_CALCUL_IQA_PHASE_2,
        alert=alert  # ou None si tu veux tout le capteur
    )

    print(f"[PHASE 2] Alerte {alert.id} | IQA moyen = {avg_iqa}")

    if avg_iqa is None:
        alert.is_active = False
        alert.save(update_fields=["is_active"])
        print(f"[PHASE 2] Alerte {alert.id} désactivée (aucune mesure)")
        return

    if avg_iqa >= SEUIL_CRITIQUE:
        alert.phase = Alert.PHASE_3
        alert.phase_3_started_at = timezone.now()
        alert.save(update_fields=["phase", "phase_3_started_at"])

        print(f"[PHASE 2 → PHASE 3] Alerte {alert.id}")

        # ⏱ Désactivation automatique après PHASE 3 (5 minutes)
        phase3_timer_task.apply_async(
        args=[alert.id],
        countdown=PASSAGE_PHASE_2_TO_3  # 5 minutes
        )


    else:
        alert.is_active = False
        alert.save(update_fields=["is_active"])
        print(f"[PHASE 2] Alerte {alert.id} désactivée (IQA insuffisant)")


@shared_task(bind=True)
def phase3_timer_task(self, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id, is_active=True)
    except Alert.DoesNotExist:
        return

    # Sécurité : on désactive uniquement si on est bien en PHASE 3
    if alert.phase != Alert.PHASE_3:
        return
    
    

    avg_iqa = compute_average_iqa(
        sensor=alert.sensor,
        start_time=alert.phase_3_started_at,
        duration_seconds=DUREE_CALCUL_IQA_PHASE_3,
        alert=alert  # ou None si tu veux tout le capteur
    )
    

    if avg_iqa is None:
        print("PHASE 3 — Pas assez de données")
        return

    if avg_iqa and avg_iqa >= SEUIL_CRITIQUE:
        print("APPEL DES SERVICES D’URGENCE")

    alert.is_active = False
    alert.save(update_fields=["is_active"])

    print(f"[PHASE 3] Alerte {alert.id} désactivée automatiquement après 5 minutes")