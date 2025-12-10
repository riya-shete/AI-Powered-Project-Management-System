# chat/serializers.py
from rest_framework import serializers
from .models import ChatMessage, ChatRoom

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'sender', 'sender_name', 'timestamp', 'is_read']


class ChatRoomSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    message_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'workspace', 'workspace_name', 'message_count', 'created_at']
