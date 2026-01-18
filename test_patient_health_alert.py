# -*- coding: utf-8 -*-
import os
import django
import random

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asiko_connect.core.settings.base')
try:
    django.setup()
except Exception:
    os.environ['DJANGO_SETTINGS_MODULE'] = 'asiko_connect.settings'
    django.setup()

from asiko_connect.apps.users.models import User
from asiko_connect.apps.sensors.models import SensorMeasurement, Prediction
from asiko_connect.apps.treatments.services import suggest_actions_based_on_risk

# CONFIGURATION : Changez l'email par celui de votre compte test
TEST_EMAIL = "lama@gmail.com" 

def test_patient_health_alert():
    print(f"\n--- 🏥 TEST : ALERTE SANTÉ PATIENT ({TEST_EMAIL}) ---")
    try:
        user = User.objects.get(email=TEST_EMAIL)
        
        # 1. Simulation de constantes vitales CRITIQUES
        print("1. Injection de constantes vitales critiques...")
        measurement = SensorMeasurement.objects.create(
            user=user,
            temperature=39.8,
            respiratory_rate=30,
            heart_rate=115,
            spo2=87.0,
            systolic_bp=95,
            wbc=16000,
            curb65=3
        )

        # 1b. Création manuelle de la prédiction (normalement faite par l'API)
        print("1b. Simulation d'une prédiction à HAUT RISQUE par l'IA...")
        Prediction.objects.create(
            user=user,
            input_data={
                "temperature": 39.8,
                "respiratory_rate": 30,
                "heart_rate": 115,
                "spo2": 87.0
            },
            result={
                "risk_score": 0.88,
                "risk_level": "CRITIQUE",
                "recommendation": "Consultation immédiate"
            }
        )

        # 2. Déclenchement manuel de la logique d'IA pour les actions
        print("2. Analyse du risque et génération d'actions personnalisées...")
        actions = suggest_actions_based_on_risk(user)
        
        if actions:
            for action in actions:
                print(f"✅ ACTION GÉNÉRÉE : [{action.action_type}] {action.recommendation_text}")
                print(f"   Priorité : {action.priority}")
        else:
            print("❌ Aucune action générée. Vérifiez si une action identique n'est pas déjà active (non complétée).")

    except User.DoesNotExist:
        print(f"❌ Erreur : L'utilisateur {TEST_EMAIL} n'existe pas.")

if __name__ == "__main__":
    test_patient_health_alert()
