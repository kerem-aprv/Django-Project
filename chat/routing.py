from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from . import consumers

application = ProtocolTypeRouter({
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                re_path(r'ws/chat/(?P<chatroom_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
                re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
            ])
        )
    ),
})