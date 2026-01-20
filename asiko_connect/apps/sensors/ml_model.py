import os
import joblib
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'asiko_connect', 'model', 'pneumonia_model.pkl')



print("MODEL_PATH =", MODEL_PATH)
print("Existe ?", os.path.exists(MODEL_PATH))


# Charger le modèle ML de manière optionnelle (pour éviter erreur si xgboost non installé)
try:
    if os.path.exists(MODEL_PATH):
        ml_model = joblib.load(MODEL_PATH)
    else:
        ml_model = None
except Exception as e:
    ml_model = None


