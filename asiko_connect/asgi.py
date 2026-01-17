import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from asiko_connect.apps.alerts import routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "asiko_connect.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            alerts.routing.websocket_urlpatterns
        )
    ),
})
