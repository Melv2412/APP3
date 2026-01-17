import json
import redis
from django.http import StreamingHttpResponse
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def alerts_stream(request):
    # # Auth JWT depuis cookie
    # auth = JWTAuthentication()
    # validated = auth.authenticate(request)

    # if not validated:
    #     print("foua")
    #     return StreamingHttpResponse(status=401)

    # user, _ = validated
    userid=1  # pour tester sans auth car sse ne fonctionne pas avec auth
    channel = f"alerts:user:{userid}"

    pubsub = redis_client.pubsub()
    pubsub.subscribe(channel)

    def event_stream():
        for message in pubsub.listen():
            if message["type"] == "message":
                yield f"data: {message['data']}\n\n"

    response = StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream"
    )
    response["Cache-Control"] = "no-cache"
    return response
