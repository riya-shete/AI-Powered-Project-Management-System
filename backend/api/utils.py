from .models import ActivityLog

def log_activity(user, action, content_type, object_id, details=None):
    """
    Helper function to log user activities
    
    Args:
        user: The user performing the action
        action: Type of action (e.g., 'create', 'update', 'delete', 'status', 'mention')
        content_type: Type of content being acted upon (e.g., 'task', 'bug', 'project')
        object_id: ID of the object being acted upon
        details: Additional details about the action (dictionary)
    """
    ActivityLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=object_id,
        details=details or {}
    )