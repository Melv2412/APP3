from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# ---------------------------------
# CHARGEMENT DU MODÈLE
# ---------------------------------
MODEL_PATH = "modele_pneumonie_xgb_gptcsv.pkl"
model = joblib.load(MODEL_PATH)

app = FastAPI(
    title="API Prédiction Pneumonie",
    description="Prédiction du risque de pneumonie à 72h",
    version="1.0"
)

# ---------------------------------
# SCHÉMA D'ENTRÉE
# (DOIT MATCHER LES FEATURES DU MODÈLE)
# ---------------------------------
class PatientData(BaseModel):
    age: int
    smoking: int
    diabetes: int
    copd_asthma: int
    immunosuppression: int

    temperature: float
    respiratory_rate: float
    heart_rate: float
    spo2: float
    systolic_bp: float
    wbc: float

    curb65: int

    delta_respiratory_rate: float
    delta_spo2: float
    delta_wbc: float

    rr_trend: float
    spo2_trend: float

# ---------------------------------
# UTILITAIRE SCORE DE RISQUE
# ---------------------------------
def risk_level(prob):
    if prob < 0.3:
        return "Faible"
    elif prob < 0.6:
        return "Modéré"
    else:
        return "Élevé"

# ---------------------------------
# ENDPOINT DE PRÉDICTION
# ---------------------------------
@app.post("/predict")
def predict_pneumonia(data: PatientData):

    input_df = pd.DataFrame([data.dict()])

    prob = float(model.predict_proba(input_df)[0][1])


    return {
        "probabilite_pneumonie_72h": round(prob, 3),
        "niveau_risque": risk_level(prob)
    }

# ---------------------------------
# ENDPOINT DE SANTÉ
# ---------------------------------
@app.get("/")
def root():
    return {"status": "API Pneumonie opérationnelle "}
