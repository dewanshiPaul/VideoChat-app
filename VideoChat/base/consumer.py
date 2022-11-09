import json
from channels.consumer import AsyncConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer,WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatRoomConsumer(WebsocketConsumer):
    def websocket_connect(self,event):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room_%s'%self.room_name

        async_to_sync (self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        
        print('room name:',self.room_group_name)
        print('channel name:',self.channel_name)
    
    #message to room
    def websocket_receive(self, event):
        message = event['text'].split(':')
        username = message[2]
        username = username[1:len(username)-2]
        message = message[1].split(',')[0]
        message = message[1:len(message)-1]
        print('message:',message)
        
        async_to_sync (self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'websocket_message',
                "message": message,
                'username': username,
            }
        )
    #message to websocket
    def websocket_message(self, event):
        message = event['message']
        username = event['username']

        self.send(text_data=json.dumps({
            'type': 'websocket.send',
            'message': message,
            'username': username,
        }))

        print('chatroom_message:',event)