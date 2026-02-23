import os
import joblib
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'asiko_connect', 'model', 'pneumonia_model.pkl')

ml_model = joblib.load(MODEL_PATH)




