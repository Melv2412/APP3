import os
import joblib
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'asiko_connect', 'model', 'pneumonia_model.pkl')

# Charger le modèle ML de manière optionnelle (pour éviter erreur si xgboost non installé)
try:
    if os.path.exists(MODEL_PATH):
        ml_model = joblib.load(MODEL_PATH)
    else:
        ml_model = None
except (ImportError, ModuleNotFoundError, FileNotFoundError) as e:
    # XGBoost ou le fichier modèle n'est pas disponible
    ml_model = None
