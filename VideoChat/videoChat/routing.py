from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import base.routing
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator

django_asgi_app = get_asgi_application()
application = ProtocolTypeRouter({
    'http': django_asgi_app,

    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                base.routing.websockets_urlpatterns
            )
        )
    )
})