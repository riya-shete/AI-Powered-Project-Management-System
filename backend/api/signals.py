from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from .models import UserProfile
from django.utils import timezone

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to create or update a UserProfile when a User is saved
    """
    UserProfile.objects.get_or_create(user=instance)

@receiver(user_logged_in)
def update_user_last_login(sender, user, request, **kwargs):
    """
    Update user's last_active timestamp when they log in
    """
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.last_active = timezone.now()
    profile.save()