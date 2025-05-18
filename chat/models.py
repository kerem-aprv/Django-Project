from django.db import models
from django.contrib.auth.models import User

from django.utils import timezone


class Chatroom(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_chatrooms')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=10, choices=[('private', 'Private'), ('global', 'Global')], default='global')
    users = models.ManyToManyField(User, related_name='chatrooms', blank=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    chatroom = models.ForeignKey(Chatroom, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message in {self.chatroom.name} by {self.user.username}"


class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
