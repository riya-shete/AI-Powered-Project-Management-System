# chat/models.py
from django.db import models
from django.contrib.auth.models import User
from api.models import Workspace  

class ChatRoom(models.Model):
    workspace = models.OneToOneField(Workspace, on_delete=models.CASCADE, related_name='chat_room')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Chat Room - {self.workspace.name}"

class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"