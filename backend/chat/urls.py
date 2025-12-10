# chat/urls.py
from django.urls import path
from .views import ChatRoomListView, ChatHistoryView

urlpatterns = [
    path('chatroom/', ChatRoomListView.as_view(), name='chat-room-list'),
    path('rooms/', ChatRoomListView.as_view(), name='chat-room-list-alias'),  # cleaner alias
    #Then both of these will work:
    #GET /chat/chatroom/
    #GET /chat/rooms/
    path('history/<int:workspace_id>/messages/', ChatHistoryView.as_view(), name='chat-history'),
]
