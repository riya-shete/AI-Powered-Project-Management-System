#chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatRoom, ChatMessage
from api.models import Workspace
from .serializers import ChatMessageSerializer
import logging

logger = logging.getLogger(__name__)

# --- Database Helper Functions ---

@database_sync_to_async
def check_workspace_access(user, workspace_id):
    """
    Asynchronously checks if a user is a member of the given workspace.
    """
    if not user or not user.is_authenticated:
        return False
    try:
        # Verify the user is in the workspace's members list.
        return Workspace.objects.get(id=workspace_id).members.filter(id=user.id).exists()
    except Workspace.DoesNotExist:
        logger.warn(f"User {user.id} tried to join non-existent workspace {workspace_id}")
        return False

@database_sync_to_async
def save_chat_message(workspace_id, user, content):
    """
    Asynchronously finds the correct chat room and saves a new message to the database.
    """
    try:
        # Get or create the chat room linked to the workspace.
        chat_room, created = ChatRoom.objects.get_or_create(workspace_id=workspace_id)
        
        message = ChatMessage.objects.create(
            room=chat_room,
            sender=user,
            content=content
        )
        return message
    except Exception as e:
        logger.error(f"Failed to save chat message for workspace {workspace_id}: {e}")
        return None

@database_sync_to_async
def serialize_message(message):
    """
    Asynchronously serializes a ChatMessage instance.
    This must be async because the serializer accesses related models (like sender.username).
    """
    serializer = ChatMessageSerializer(message)
    return serializer.data

# --- Chat Consumer ---

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.workspace_id = self.scope['url_route']['kwargs']['workspace_id']
        self.room_group_name = f'chat_{self.workspace_id}'
        self.user = self.scope.get('user')

        # 1. Authentication Check: Reject anonymous users.
        if not self.user or not self.user.is_authenticated:
            logger.warn(f"Anonymous user rejected from ws/chat/{self.workspace_id}")
            await self.close(code=4001)  # 4001 = Custom code for "Unauthenticated"
            return

        # 2. Authorization Check: Reject users who aren't members of this workspace.
        has_access = await check_workspace_access(self.user, self.workspace_id)
        
        if not has_access:
            logger.warn(f"User {self.user.username} (ID: {self.user.id}) forbidden from ws/chat/{self.workspace_id}")
            await self.close(code=4003)  # 4003 = Custom code for "Forbidden"
            return

        # User is authenticated and authorized. Accept the connection.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"User {self.user.username} connected to chat for workspace {self.workspace_id}")

    async def disconnect(self, close_code):
        if hasattr(self, 'user'):
             # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"User {self.user.username} disconnected from chat (Code: {close_code})")

    async def receive(self, text_data):
        """
        Called when a message is received from the WebSocket client.
        """
        try:
            text_data_json = json.loads(text_data)
            message_content = text_data_json.get('message')

            if not message_content:
                logger.warn("Received empty message. Ignoring.")
                return

            # 1. Save the new message to the database
            new_message = await save_chat_message(self.workspace_id, self.user, message_content)
            
            if not new_message:
                logger.error("Message was not saved, so not broadcasting.")
                return 

            # 2. Serialize the saved message object (this has the real ID, timestamp, etc.)
            serialized_message_data = await serialize_message(new_message)

            # 3. Broadcast the REAL message data to the entire room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',  # This calls the chat_message method below
                    'message_data': serialized_message_data # Send the complete, serialized object
                }
            )
        except json.JSONDecodeError:
            logger.warn(f"Received invalid JSON from user {self.user.username}")
        except Exception as e:
            logger.error(f"Error in receive method: {e}")

    async def chat_message(self, event):
        """
        Called when this consumer receives a message from the room group (from group_send).
        """
        message_data = event['message_data']
        
        # Send the message data (as a JSON string) down to the client.
        await self.send(text_data=json.dumps(message_data))
