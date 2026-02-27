# -*- coding: utf-8 -*-
import os
import django
from django.utils import timezone

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asiko_connect.settings')
django.setup()

from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.sensors.models import Sensor, Zone
from asiko_connect.apps.treatments.services import generate_prevention_actions_for_alert

def test_environment_zone_alert():
    print(f"\n--- 🌍 TEST : ALERTE ZONE À RISQUE (ENVIRONNEMENT) ---")
    
    # 1. Préparation d'une Zone de danger
    # On cherche une zone ou on la crée
    zone, _ = Zone.objects.get_or_create(
        name="Zone Industrielle Yopougon",
        defaults={'latitude': 5.3400, 'longitude': -4.0500}
    )
    
    # On crée un capteur pour cette zone (lié à l'admin id=1 par défaut)
    sensor, _ = Sensor.objects.get_or_create(
        device_id="YOP-SIM-001",
        defaults={'zone': zone, 'owner_id': 1}
    )

    # 2. Déclenchement d'une ALERTE CRITIQUE (Phase 3)
    # Cela simule une détection automatique de forte pollution
    print(f"1. Déclenchement d'une ALERTE CRITIQUE dans la zone : {zone.name}")
    alert = Alert.objects.create(
        sensor=sensor,
        phase=Alert.PHASE_3,
        is_active=True,
        phase_1_started_at=timezone.now()
    )

    # 3. Génération des actions pour TOUS les patients affectés
    print("2. Diffusion des protocoles de sécurité à tous les patients...")
    actions = generate_prevention_actions_for_alert(alert)
    
    if actions:
        print(f"  SUCCÈS : {len(actions)} actions préventives ont été créées.")
        print(f"   Exemple de consigne : {actions[0].recommendation_text}")
        print("   Vérifiez maintenant votre page 'Prévention' ou le badge 'Alertes' sur le dashboard.")
    else:
        print("❌ Aucune action générée. Cela peut arriver si l'alerte n'est pas active ou si les patients ont déjà ces actions.")

if __name__ == "__main__":
    test_environment_zone_alert()
