import json
import time
import jwt
from django.conf import settings
from django.http import StreamingHttpResponse
from .event_bus import get_user_queue

def sse_alert_stream(request):
    token = request.GET.get("token")

    if not token:
        return StreamingHttpResponse("Unauthorized", status=401)

    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded["user_id"]
    except Exception:
        return StreamingHttpResponse("Invalid token", status=401)

    queue = get_user_queue(user_id)

    def event_generator():
        while True:
            if not queue.empty():
                data = queue.get()
                yield f"data: {json.dumps(data)}\n\n"
            time.sleep(0.5)

    response = StreamingHttpResponse(event_generator(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
