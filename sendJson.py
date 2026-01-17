import requests
import time

# URL de l'API
URL = "http://127.0.0.1:8000/api/sensors/data/"

# Token d'accès
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4NTU3ODc2LCJpYXQiOjE3Njg1NTQyNzYsImp0aSI6IjNjZjVlNzMyZDdhNTRlMDM5YTU4MGY4ZDkzNjdlMzdjIiwidXNlcl9pZCI6IjMifQ.hei4i53v7NnceL3Vqo7vFCWVFG2Ax85zDpvNcgZoGwc".strip()

# Entêtes HTTP avec Bearer token
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Exemple de données à envoyer
payload = {
    "device_id": "ESP32_TEST_001",
    "pm25": 35.2,
    "pm10": 554.1,
    "o3": 12.3,
    "no2": 20.5,
    "so2": 5.4,
    "co": 100.8,
    "humidity": 60.0,
    "temperature": 28.5
}

def send_data(interval_seconds=0.5, repetitions=100):
    """
    Envoie des données à l'API toutes les `interval_seconds` secondes,
    pendant `repetitions` fois.
    """
    for i in range(repetitions):
        try:
            response = requests.post(URL, json=payload, headers=HEADERS)
            print(f"[{i+1}/{repetitions}] Status: {response.status_code}, Response: {response.json()}")
        except Exception as e:
            print(f"Erreur à l'envoi {i+1}: {e}")
        time.sleep(interval_seconds)

if __name__ == "__main__":
    send_data()
