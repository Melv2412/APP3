import json
import redis
from django.conf import settings
from django.utils.timezone import now
from datetime import datetime
from asiko_connect.apps.alerts.event_bus import get_user_queue


def notify_frontend(user_id, message, alert_id, phase):
    queue = get_user_queue(user_id)

    payload = {
        "alert_id": alert_id,
        "phase": phase,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }

    queue.put(payload)


if __name__ == "__main__":
    notify_frontend(1, "Alerte")
