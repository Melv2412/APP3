import json
import time
from django.http import StreamingHttpResponse
from .event_bus import broadcast_queue  # Queue globale

# Stockage en mémoire de la dernière donnée diffusée
LATEST_DATA = None

def sse_alert_stream(request):
    """
    Flux SSE global : chaque utilisateur connecté reçoit toutes les alertes
    sans authentification.
    """
    def event_generator():
        global LATEST_DATA
        
        # 1. Envoyer la dernière donnée connue dès la connexion (si elle existe)
        if LATEST_DATA:
            yield f"data: {json.dumps(LATEST_DATA)}\n\n"
        
        # 2. Boucle infinie pour écouter les nouvelles données
        while True:
            if not broadcast_queue.empty():
                data = broadcast_queue.get()
                LATEST_DATA = data  # Mise à jour du cache mémoire
                print("Broadcasting to SSE:", data)
                yield f"data: {json.dumps(data)}\n\n"
            time.sleep(1)

    response = StreamingHttpResponse(event_generator(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
