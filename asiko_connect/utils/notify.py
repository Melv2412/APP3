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
