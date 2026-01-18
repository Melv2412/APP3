import json
import time
from django.http import StreamingHttpResponse
from .event_bus import broadcast_queue  # Queue globale

def sse_alert_stream(request):
    """
    Flux SSE global : chaque utilisateur connecté reçoit toutes les alertes
    sans authentification.
    """
    def event_generator():
        while True:
            if not broadcast_queue.empty():
                data = broadcast_queue.get()
                print("Broadcasting to SSE:", data)
                yield f"data: {json.dumps(data)}\n\n"
            time.sleep(1)

    response = StreamingHttpResponse(event_generator(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
