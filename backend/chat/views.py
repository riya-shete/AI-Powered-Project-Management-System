# chat/views.py

from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer
from api.models import Workspace


# List all chat rooms 
class ChatRoomListView(generics.ListAPIView):
    queryset = ChatRoom.objects.select_related('workspace').all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]


# Gettingg chat messages for a workspace
class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.kwargs['workspace_id']
        workspace = get_object_or_404(Workspace, id=workspace_id)

        # Check if user has access to this workspace
        if not workspace.members.filter(id=self.request.user.id).exists():
            return ChatMessage.objects.none()

        chat_room, _ = ChatRoom.objects.get_or_create(
            workspace=workspace,
            defaults={'name': f"{workspace.name} Chat"}
        )

        # return last 50 messages
        return ChatMessage.objects.filter(room=chat_room).select_related('sender').order_by('-timestamp')[:50]
