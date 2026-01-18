import requests
import time
import random

# URL de l'API
URL = "http://127.0.0.1:8000/api/sensors/data/"

# Token JWT

# Headers
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Données fixes
DEVICE_ID = "ESP32_TEST_001"

# GPS (optionnel)
LATITUDE = 5.348  # Exemple Abidjan
LONGITUDE = -4.003

payload = {
    "device_id": "ESP32_TEST_001",
    "pm25": 180.0,       # très élevé
    "pm10": 350.0,       # très élevé
    "o3": 120.0,         # élevé
    "no2": 90.0,         # élevé
    "so2": 45.0,         # élevé
    "co": 250.0,         # élevé
    "humidity": 80.0,    # optionnellement élevé
    "temperature": 35.0, # chaud, peut accentuer l'effet
    "latitude": 5.348,
    "longitude": -4.003
}


def send_data(interval_seconds=1, repetitions=100):
    for i in range(repetitions):

        try:
            response = requests.post(URL, json=payload, headers=HEADERS)

            try:
                data = response.json()
            except:
                data = response.text

            print(f"[{i+1}/{repetitions}] {response.status_code} → {data}")

            # Gestion des erreurs serveur
            if response.status_code == 404:
                print("Capteur non trouvé : vérifie device_id dans la base")
                break

            if response.status_code == 401:
                print("Token invalide ou expiré")
                break

        except Exception as e:
            print(f"Erreur réseau : {e}")

        time.sleep(interval_seconds)

if __name__ == "__main__":
    send_data()
