# -*- coding: utf-8 -*-
"""
Script de test complet pour l'API de prédiction ML.
Utilise directement Django pour éviter les problèmes d'authentification.

Usage: python manage.py shell < test_ml_prediction.py
"""

import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asiko_connect.settings')
django.setup()

from asiko_connect.apps.users.models import User, PatientData
from asiko_connect.apps.sensors.models import SensorMeasurement, Prediction
from asiko_connect.apps.sensors.ml_model import ml_model
from asiko_connect.utils.calculs import calculate_trend, calculate_curb65, risk_level

print("=" * 70)
print("🧪 TEST COMPLET DE LA PRÉDICTION ML")
print("=" * 70)

# 1. Vérifier que le modèle ML est chargé
print("\n📊 ÉTAPE 1: Vérification du modèle ML")
print("-" * 70)
if ml_model is None:
    print("❌ ERREUR: Le modèle ML n'est pas chargé!")
    print("   Assure-toi que xgboost est installé et que le fichier model existe.")
    exit(1)
else:
    print(f"✅ Modèle ML chargé avec succès")
    print(f"   Type: {type(ml_model).__name__}")
    print(f"   Features attendues: {ml_model.n_features_in_}")

# 2. Récupérer ou créer un patient de test
print("\n👤 ÉTAPE 2: Préparation du patient de test")
print("-" * 70)

# Utiliser le patient test_ml créé précédemment
try:
    user = User.objects.get(email='test_ml@asiko.com')
    patient_data = user.patient_data
    print(f"✅ Patient trouvé: {user.email}")
except User.DoesNotExist:
    print("⚠️  Patient test_ml non trouvé, création...")
    user = User.objects.create_user(
        username='test_ml',
        email='test_ml@asiko.com',
        password='test123',
        role='PATIENT',
        first_name='Test',
        last_name='ML'
    )
    patient_data = PatientData.objects.create(
        user=user,
        age=45,
        smoking=True,
        diabetes=False,
        copd_asthma=False,
        immunosuppression=False
    )
    print(f"✅ Patient créé: {user.email}")

print(f"\n   Données statiques du patient:")
print(f"   - Âge: {patient_data.age} ans")
print(f"   - Fumeur: {'Oui' if patient_data.smoking else 'Non'}")
print(f"   - Diabète: {'Oui' if patient_data.diabetes else 'Non'}")
print(f"   - COPD/Asthme: {'Oui' if patient_data.copd_asthma else 'Non'}")
print(f"   - Immunosuppression: {'Oui' if patient_data.immunosuppression else 'Non'}")

# 3. Créer des mesures de capteurs
print("\n📡 ÉTAPE 3: Simulation de mesures de capteurs")
print("-" * 70)

# Données de test (patient avec risque modéré à élevé)
measurement_data = {
    'temperature': 38.5,      # Fièvre modérée
    'respiratory_rate': 26,   # Tachypnée
    'heart_rate': 98,         # Tachycardie légère
    'spo2': 91,               # Hypoxémie modérée
    'systolic_bp': 130,       # Tension normale
    'wbc': 12500              # Leucocytose modérée
}

print(f"   Mesures envoyées:")
for key, value in measurement_data.items():
    print(f"   - {key}: {value}")

# Récupérer les dernières mesures pour calcul des deltas
last_measurements = user.sensor_measurements.order_by('-created_at')[:5]

def get_last(field):
    return getattr(last_measurements[0], field) if last_measurements else None

# Calculer les deltas
delta_rr = measurement_data['respiratory_rate'] - get_last('respiratory_rate') if get_last('respiratory_rate') is not None else 0
delta_spo2 = measurement_data['spo2'] - get_last('spo2') if get_last('spo2') is not None else 0
delta_wbc = measurement_data['wbc'] - get_last('wbc') if get_last('wbc') is not None else 0

# Calculer les tendances
rr_trend = calculate_trend([m.respiratory_rate for m in last_measurements], measurement_data['respiratory_rate'])
spo2_trend = calculate_trend([m.spo2 for m in last_measurements], measurement_data['spo2'])

# Calculer CURB-65
curb65 = calculate_curb65(
    age=patient_data.age,
    confusion=False,
    bun_high=False,
    respiratory_rate=measurement_data['respiratory_rate'],
    systolic_bp=measurement_data['systolic_bp'],
    diastolic_bp=70
)

print(f"\n   Valeurs calculées:")
print(f"   - CURB-65: {curb65}")
print(f"   - Delta FR: {delta_rr}")
print(f"   - Delta SpO2: {delta_spo2}")
print(f"   - Delta WBC: {delta_wbc}")
print(f"   - Tendance FR: {rr_trend}")
print(f"   - Tendance SpO2: {spo2_trend}")

# Créer la mesure
measurement = SensorMeasurement.objects.create(
    user=user,
    temperature=measurement_data['temperature'],
    respiratory_rate=measurement_data['respiratory_rate'],
    heart_rate=measurement_data['heart_rate'],
    spo2=measurement_data['spo2'],
    systolic_bp=measurement_data['systolic_bp'],
    wbc=measurement_data['wbc'],
    curb65=curb65,
    delta_respiratory_rate=delta_rr,
    delta_spo2=delta_spo2,
    delta_wbc=delta_wbc,
    rr_trend=rr_trend,
    spo2_trend=spo2_trend
)

print(f"\n✅ Mesure créée avec ID: {measurement.id}")

# 4. Préparer le vecteur de features pour le modèle ML
print("\n🤖 ÉTAPE 4: Préparation des features pour le modèle ML")
print("-" * 70)

X = [
    patient_data.age,
    int(patient_data.smoking),
    int(patient_data.diabetes),
    int(patient_data.copd_asthma),
    int(patient_data.immunosuppression),
    measurement.temperature,
    measurement.respiratory_rate,
    measurement.heart_rate,
    measurement.spo2,
    measurement.systolic_bp,
    measurement.wbc,
    measurement.curb65,
    measurement.delta_respiratory_rate,
    measurement.delta_spo2,
    measurement.delta_wbc,
    measurement.rr_trend,
    measurement.spo2_trend
]

feature_names = [
    'age', 'smoking', 'diabetes', 'copd_asthma', 'immunosuppression',
    'temperature', 'respiratory_rate', 'heart_rate', 'spo2', 'systolic_bp',
    'wbc', 'curb65', 'delta_rr', 'delta_spo2', 'delta_wbc', 'rr_trend', 'spo2_trend'
]

print(f"   Vecteur de features (17 valeurs):")
for i, (name, value) in enumerate(zip(feature_names, X), 1):
    print(f"   {i:2d}. {name:20s} = {value}")

# 5. Faire la prédiction ML
print("\n🎯 ÉTAPE 5: Prédiction ML")
print("-" * 70)

try:
    # Prédiction
    prob = float(ml_model.predict_proba([X])[0][1])
    risk = risk_level(prob)
    
    print(f"✅ Prédiction réussie!")
    print(f"\n   📊 RÉSULTATS:")
    print(f"   {'=' * 50}")
    print(f"   Probabilité de pneumonie à 72h: {prob:.1%} ({prob:.4f})")
    print(f"   Niveau de risque: {risk}")
    print(f"   {'=' * 50}")
    
    # Interprétation
    if risk == 'CRITIQUE':
        print(f"\n   🚨 ALERTE: Risque CRITIQUE - Hospitalisation immédiate recommandée")
    elif risk == 'ELEVE':
        print(f"\n   ⚠️  ATTENTION: Risque ÉLEVÉ - Consultation médicale urgente")
    elif risk == 'MODERE':
        print(f"\n   ⚡ VIGILANCE: Risque MODÉRÉ - Surveillance rapprochée nécessaire")
    else:
        print(f"\n   ✅ NORMAL: Risque faible - Continuer la surveillance")
    
    # 6. Stocker la prédiction
    print("\n💾 ÉTAPE 6: Sauvegarde de la prédiction")
    print("-" * 70)
    
    prediction = Prediction.objects.create(
        user=user,
        input_data=X,
        result={
            'probabilite_pneumonie_72h': round(prob, 3),
            'niveau_risque': risk
        }
    )
    
    print(f"✅ Prédiction sauvegardée avec ID: {prediction.id}")
    print(f"   Créée le: {prediction.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 7. Résumé final
    print("\n" + "=" * 70)
    print("✅ TEST RÉUSSI - TOUS LES COMPOSANTS FONCTIONNENT")
    print("=" * 70)
    print(f"\n📈 Statistiques:")
    print(f"   - Total mesures pour ce patient: {user.sensor_measurements.count()}")
    print(f"   - Total prédictions pour ce patient: {user.predictions.count()}")
    print(f"\n🎉 Le système de prédiction ML est opérationnel!")
    
except Exception as e:
    print(f"\n❌ ERREUR lors de la prédiction:")
    print(f"   {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 70)
print("FIN DU TEST")
print("=" * 70)
