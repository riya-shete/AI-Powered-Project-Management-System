from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone
from .models import UserProfile, Task, Bug, Invitation, Sprint, Workspace, WorkspaceMember, Project, Notification
from .utils import create_notification

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

# New signals for notifications

@receiver(post_save, sender=Invitation)
def invitation_notification(sender, instance, created, **kwargs):
    """
    Send notification when a user is invited to a workspace
    """
    if created:
        try:
            invited_user = User.objects.get(email=instance.email)
            message = f"You've been invited to join the workspace '{instance.workspace.name}'"
            create_notification(
                user=invited_user,
                sender=instance.sender,
                message=message,
                item_type='workspace',
                item_id=str(instance.workspace.id),
                notification_type='invitation',
                url=f"/invitations"
            )
        except User.DoesNotExist:
            pass

@receiver(post_save, sender=Task)
def task_assignment_notification(sender, instance, created, **kwargs):
    """
    Send notification when a task is assigned to a user
    """
    if instance.assigned_to and (created or (kwargs.get('update_fields') and 'assigned_to' in kwargs.get('update_fields'))):
        project_name = instance.project.name if instance.project else "a project"
        message = f"You've been assigned to task '{instance.name}' in {project_name}"
        create_notification(
            user=instance.assigned_to,
            sender=instance.reporter,  # Use reporter as sender
            message=message,
            item_type='task',
            item_id=str(instance.id),
            notification_type='assignment',
            url=f"/projects/{instance.project.id if instance.project else ''}/tasks/{instance.id}"
        )

@receiver(post_save, sender=Bug)
def bug_assignment_notification(sender, instance, created, **kwargs):
    """
    Send notification when a bug is assigned to a user
    """
    if instance.assignee and (created or (kwargs.get('update_fields') and 'assignee' in kwargs.get('update_fields'))):
        project_name = instance.project.name if instance.project else "a project"
        message = f"You've been assigned to fix bug '{instance.summary}' in {project_name}"
        create_notification(
            user=instance.assignee,
            sender=instance.reporter,  # Use reporter as sender
            message=message,
            item_type='bug',
            item_id=str(instance.id),
            notification_type='assignment',
            url=f"/projects/{instance.project.id if instance.project else ''}/bugs/{instance.id}"
        )

@receiver(post_save, sender=Sprint)
def sprint_start_notification(sender, instance, created, **kwargs):
    if not created and 'active' in (kwargs.get('update_fields') or []):
        project = instance.project
        if not project:
            return

        members = WorkspaceMember.objects.filter(workspace=project.workspace).select_related('user')
        sender_user = instance.assigned_by if hasattr(instance, 'assigned_by') else None
        
        if instance.active:
            message = f"Sprint '{instance.name}' has started in project '{project.name}'"
        else:
            message = f"Sprint '{instance.name}' has been completed in project '{project.name}'"
        
        notifications_to_create = [
            Notification(
                user=member.user,
                sender=sender_user,
                message=message,
                item_type='sprint',
                item_id=str(instance.id),
                notification_type='status_change',
                url=f"/projects/{project.id}/sprints/{instance.id}"
            ) for member in members
        ]
        
        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)


@receiver(post_save, sender=WorkspaceMember)
def new_member_notification(sender, instance, created, **kwargs):
    if created:
        admins = WorkspaceMember.objects.filter(workspace=instance.workspace, role__in=['admin', 'owner']).select_related('user')
        
        notifications_to_create = [
            Notification(
                user=admin.user,
                sender=instance.user,
                message=f"{instance.user.username} has joined the workspace '{instance.workspace.name}'",
                item_type='workspace',
                item_id=str(instance.workspace.id),
                notification_type='system',
                url=f"/workspaces/{instance.workspace.id}/members"
            ) for admin in admins if admin.user != instance.user
        ]

        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)

@receiver(post_save, sender=Task)
def task_status_notification(sender, instance, created, **kwargs):
    """
    Send notification when a task status changes
    """
    if not created and kwargs.get('update_fields') and 'status' in kwargs.get('update_fields'):
        if instance.assigned_to and instance.assigned_to != instance.reporter:
            message = f"Task '{instance.name}' status changed to {instance.status}"
            create_notification(
                user=instance.assigned_to,
                sender=instance.reporter,
                message=message,
                item_type='task',
                item_id=str(instance.id),
                notification_type='status_change',
                url=f"/projects/{instance.project.id if instance.project else ''}/tasks/{instance.id}"
            )

@receiver(post_save, sender=Bug)
def bug_status_notification(sender, instance, created, **kwargs):
    """
    Send notification when a bug status changes
    """
    if not created and kwargs.get('update_fields') and 'status' in kwargs.get('update_fields'):
        if instance.assignee and instance.assignee != instance.reporter:
            message = f"Bug '{instance.summary}' status changed to {instance.status}"
            create_notification(
                user=instance.assignee,
                sender=instance.reporter,
                message=message,
                item_type='bug',
                item_id=str(instance.id),
                notification_type='status_change',
                url=f"/projects/{instance.project.id if instance.project else ''}/bugs/{instance.id}"
            )