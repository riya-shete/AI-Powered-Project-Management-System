import json
from .models import ActivityLog, Notification
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def log_activity(user, action, content_type, object_id, details=None):
    """
    Utility function to log user activities
    
    Args:
        user: User performing the action
        action: One of 'create', 'update', 'delete', 'assign', 'status', 'comment', 'mention'
        content_type: Model name like 'task', 'bug', etc.
        object_id: ID or key of the object
        details: JSON serializable dictionary with additional details
    """
    log = ActivityLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=object_id,
        details=json.dumps(details) if details else ''
    )
    return log

def create_notification(user, sender, message, item_type, item_id):
    """
    Create a notification for a user
    
    Args:
        user: User to receive the notification
        sender: User sending the notification
        message: Notification message
        item_type: Type of item (task, bug, etc.)
        item_id: ID of the item
    """
    notification = Notification.objects.create(
        user=user,
        sender=sender,
        message=message,
        item_type=item_type,
        item_id=item_id
    )
    return notification

def update_user_activity(user):
    """
    Update the user's last active timestamp
    
    Args:
        user: User to update
    """
    from .models import UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.last_active = timezone.now()
    profile.save()
    return profile


def send_otp_email(email, otp_code):
    """
    Send OTP code to user's email
    
    Args:
        email: Email address to send OTP to
        otp_code: The OTP code to send
    """
    try:
        subject = "Your Login OTP Code"
        message = f"Your OTP code is: {otp_code}\n\nThis code will expire in 10 minutes."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"OTP email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False # Explicitly return False on failure