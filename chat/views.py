from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.db.models import Q
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chatroom, Message, Notification
import json

from .serializers import NotificationSerializer
from django.http import HttpResponse


@ensure_csrf_cookie
def get_available_users(request):
    users = User.objects.filter(is_superuser=False).values('id', 'username')
    return JsonResponse({'success': True, 'users': list(users)})


# views.py
@csrf_exempt
@ensure_csrf_cookie
def create_chatroom(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        chatroom_name = data.get('name')
        chatroom_description = data.get('description')
        chatroom_type = data.get('type')
        chatroom_users = data.get('users', [])

        # Ensure the creator is included in the users list for private chatrooms
        if chatroom_type == 'private' and request.user.id not in chatroom_users:
            chatroom_users.append(request.user.id)

        # Create chatroom
        chatroom = Chatroom.objects.create(
            name=chatroom_name,
            description=chatroom_description,
            creator=request.user,
            type=chatroom_type
        )

        # Add users to the chatroom (only for private chatrooms)
        if chatroom_type == 'private':
            chatroom.users.add(*chatroom_users)

        return JsonResponse({'success': True, 'message': 'Chatroom created successfully'})
    else:
        return JsonResponse({'success': False, 'errors': 'Invalid method'})


@ensure_csrf_cookie
def chatroom_list(request):
    chatrooms = Chatroom.objects.filter(Q(type='global') | Q(creator=request.user) | Q(users=request.user)).distinct()
    chatroom_data = [{'id': chatroom.id, 'name': chatroom.name, 'type': chatroom.type} for chatroom in chatrooms]
    return JsonResponse({'success': True, 'chatroom': chatroom_data})


@ensure_csrf_cookie
def chatrooms(request, chatroom_id):
    try:
        chatroom = Chatroom.objects.get(id=chatroom_id)
        messages = Message.objects.filter(chatroom=chatroom).values('user__username', 'text')
        return JsonResponse({'messages': list(messages)})
    except Chatroom.DoesNotExist:
        return JsonResponse({'error': 'Chatroom not found'}, status=404)


@csrf_exempt
@ensure_csrf_cookie
@csrf_exempt
@ensure_csrf_cookie
def send_message(request, chatroom_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        message_text = data.get('text')
        chatroom = get_object_or_404(Chatroom, id=chatroom_id)

        # Check if the user is authorized to send a message in this chatroom
        if chatroom.type == 'private' and request.user not in chatroom.users.all():
            return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=403)

        message = Message.objects.create(text=message_text, chatroom=chatroom, user=request.user)
        channel_layer = get_channel_layer()

        # Broadcast the message to the WebSocket group
        async_to_sync(channel_layer.group_send)(
            f"chat_{chatroom_id}",
            {
                'type': 'chat_message',
                'message': {
                    'text': message_text,
                    'user_id': request.user.id,
                    'chatroom_id': chatroom_id,
                }
            }
        )

        return JsonResponse({'success': True, 'message': {'text': message.text, 'user__username': message.user.username}})
    else:
        return JsonResponse({'success': False, 'errors': 'Invalid method'})


@csrf_exempt
@ensure_csrf_cookie
def delete_chatroom(request, chatroom_id):
    chatroom = Chatroom.objects.get(id=chatroom_id)
    if chatroom.creator == request.user:
        chatroom.delete()
        return JsonResponse({'success': True, 'message': 'Chatroom deleted successfully'})
    else:
        return JsonResponse({'success': False, 'message': 'You are not authorized to delete this chatroom'})


@ensure_csrf_cookie
def get_chatroom_by_name(request, room_name):
    try:
        chatroom = Chatroom.objects.get(name=room_name)
        return JsonResponse({'id': chatroom.id, 'name': chatroom.name, 'type': chatroom.type})
    except Chatroom.DoesNotExist:
        return JsonResponse({'error': 'Chatroom does not exist'}, status=404)


@ensure_csrf_cookie
@csrf_exempt
def send_notification(request):
    message = request.GET.get('message', 'Default notification message')
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'notifications',  # This should match the group name in consumer
        {
            'type': 'notification_message',
            'message': message
        }
    )
    return JsonResponse({'status': 'Notification sent!'})


class NotificationView(APIView):
    def get(self, request):
        notifications = Notification.objects.all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
