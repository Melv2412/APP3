import json
from datetime import datetime
from asiko_connect.apps.alerts.event_bus import broadcast_queue

def notify_frontend(message, alert_id, phase):
    """
    Envoie un message à tous les utilisateurs connectés (broadcast)
    """
    payload = {
        "alert_id": alert_id,
        "phase": phase,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    print("Broadcasting alert:", payload)
    broadcast_queue.put(payload)

if __name__ == "__main__":
    notify_frontend(1, "Alerte")

import requests

def notify_esp(ESP_IP):
    try:
        url = f"http://{ESP_IP}/buzzer"
        response = requests.get(url, timeout=3)

        if response.status_code == 200:
            print("ESP32 notifié : buzzer activé")
            return True
        else:
            print("ESP32 a répondu avec une erreur :", response.status_code)
            return False

    except requests.exceptions.RequestException as e:
        print("Impossible de contacter l'ESP32 :", e)
        return False


    
def notify_aqi_update(aqi_value, sensor_id=None):
    """
    Diffuse la mise à jour de l'IQA en temps réel
    """
    payload = {
        "type": "aqi_update",
        "aqi": aqi_value,
        "sensor_id": sensor_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    # print(f"Broadcasting AQI: {aqi_value}")
    broadcast_queue.put(payload)
