# -*- coding: utf-8 -*-
import os
import django
import random

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asiko_connect.core.settings.base')
try:
    django.setup()
except Exception:
    # Essai avec l'autre chemin de paramètre si le premier échoue
    os.environ['DJANGO_SETTINGS_MODULE'] = 'asiko_connect.settings'
    django.setup()

from asiko_connect.apps.users.models import User, PatientData
from asiko_connect.apps.sensors.models import SensorMeasurement, Prediction
from asiko_connect.apps.sensors.ml_model import ml_model
from asiko_connect.utils.calculs import calculate_trend, calculate_curb65, risk_level

def generate_for_user(email, temp, rr, spo2, heart, sys_bp, wbc, is_smoker=False):
    print(f"\n--- Génération pour {email} ---")
    try:
        user = User.objects.get(email=email)
        
        # S'assurer que le PatientData existe
        patient_data, created = PatientData.objects.get_or_create(
            user=user,
            defaults={
                'age': random.randint(25, 60),
                'smoking': is_smoker,
                'diabetes': False,
                'copd_asthma': False,
                'immunosuppression': False
            }
        )

        # Calculer Curb65
        curb = calculate_curb65(patient_data.age, False, False, rr, sys_bp, 75)

        # Créer la mesure
        measurement = SensorMeasurement.objects.create(
            user=user,
            temperature=temp,
            respiratory_rate=rr,
            heart_rate=heart,
            spo2=spo2,
            systolic_bp=sys_bp,
            wbc=wbc,
            curb65=curb
        )

        # Vecteur ML
        X = [
            patient_data.age, int(patient_data.smoking), int(patient_data.diabetes),
            int(patient_data.copd_asthma), int(patient_data.immunosuppression),
            temp, rr, heart, spo2, sys_bp, wbc, curb, 0, 0, 0, 0, 0
        ]

        # Prediction
        if ml_model:
            prob = float(ml_model.predict_proba([X])[0][1])
            risk = risk_level(prob)
            
            Prediction.objects.create(
                user=user,
                input_data=X,
                result={'probabilite_pneumonie_72h': round(prob, 3), 'niveau_risque': risk}
            )
            print(f"✅ Succès: Probabilité = {prob:.1%}, Risque = {risk}")
        else:
            print("❌ Modèle ML non chargé")

    except User.DoesNotExist:
        print(f"❌ Utilisateur {email} non trouvé dans la base.")

# 1. Générer pour le Patient (Risque Modéré)
generate_for_user('lama@gmail.com', temp=38.4, rr=26, spo2=91, heart=105, sys_bp=135, wbc=13000, is_smoker=True)

# 2. Générer pour le Docteur (Risque Faible)
generate_for_user('docteur@gmail.com', temp=36.8, rr=16, spo2=98, heart=72, sys_bp=120, wbc=7000, is_smoker=False)

print("\nTerminé ! Vérifiez vos dashboards.")
