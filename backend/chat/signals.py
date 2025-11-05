#signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models import Workspace  # Adjust based on your model location
from .models import ChatRoom

@receiver(post_save, sender=Workspace)
def create_chat_room(sender, instance, created, **kwargs):
    if created:
        ChatRoom.objects.create(
            workspace=instance,
            name=f"{instance.name} Chat"
        )