from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from .models import Chatroom, Message
from django.contrib.auth.models import User
import json
from .serializers import NotificationSerializer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.chatroom_id = self.scope['url_route']['kwargs']['chatroom_id']
        self.room_group_name = f'chat_{self.chatroom_id}'

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data=None, bytes_data=None):
        if text_data:
            self.handle_message(text_data)

    def handle_message(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'message':
            message = Message(text=data['text'], chatroom=Chatroom.objects.get(id=data['chatroom_id']))
            message.user = User.objects.get(id=data['user_id'])
            message.save()

            # Send message to WebSocket
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'text': message.text,
                        'username': message.user.username,
                        'chatroom_id': message.chatroom.id,
                    }
                }
            )

    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'type': 'message',
            'text': message['text'],
            'username': message['username'],
            'chatroom_id': message['chatroom_id'],
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'notifications'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_message = json.loads(text_data)
        if text_message['type'] == 'notification':
            notification = NotificationSerializer(data=text_message)
            if notification.is_valid():
                notification.save()
                await self.send(text_data=json.dumps({
                    'type': 'notification',
                    'message': notification.data
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid notification data'
                }))

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message']
        }))