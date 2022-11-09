from django.urls import re_path
# from django.conf.urls import url
from . import consumer

websockets_urlpatterns = [
    re_path(r'^room/(?P<room_name>\w+)/$', consumer.ChatRoomConsumer.as_asgi())
]