import json
import redis
from django.conf import settings
from django.utils.timezone import now

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def notify_frontend(*, user_id, message, alert_id, phase):
    payload = {
        "message": message,
        "alert_id": alert_id,
        "phase": phase,
        "timestamp": now().isoformat()
    }

    channel = f"alerts:user:{user_id}"
    redis_client.publish(channel, json.dumps(payload))

    
def notify_esp(alert):
    print("NOTIFY ESP32 FUNCTION CALLED")


if __name__ == "__main__":
    notify_frontend(1, "Alerte")
