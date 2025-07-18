from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets
import random
import string

class Workspace(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_workspaces')
    members = models.ManyToManyField(User, related_name='workspaces', through='WorkspaceMember')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class WorkspaceMember(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('team_leader', 'Team Leader'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    )
    
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('workspace', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.workspace.name} ({self.role})"

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='projects')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Sprint(models.Model):
    name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprints')
    start_date = models.DateField()
    end_date = models.DateField()
    active = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    goal = models.TextField(blank=True)
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_sprints')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sprints_assigned_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"

class Task(models.Model):
    STATUS_CHOICES = (
        ('backlog', 'Backlog'),
        ('ready', 'Ready to Start'),
        ('in_progress', 'In Progress'),
        ('review', 'Waiting for Review'),
        ('stuck', 'Stuck'),
        ('done', 'Done'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    sprint = models.ForeignKey(Sprint, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='backlog')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    role = models.CharField(max_length=50, blank=True)
    item_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    section = models.CharField(max_length=50, default='main_sprint', blank=True)
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.item_id:
            self.item_id = str(self.pk + 1000000)
            super().save(update_fields=['item_id'])

class Bug(models.Model):
    STATUS_CHOICES = (
        ('to_do', 'To Do'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('not_resolved', 'Not Resolved'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    TYPE_CHOICES = (
        ('bug', 'Bug'),
        ('task', 'Task'),
        ('feature', 'Feature'),
        ('wallet','Wallet'),
        ('warning','Warning'),
    )
    
    summary = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bugs')
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_bugs')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bugs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='to_do')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    key = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    resolution = models.CharField(max_length=100, blank=True) 
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='bug')
    def __str__(self):
        return self.summary

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.key:
            project_prefix = self.project.name[:3].upper()
            self.key = f"{project_prefix}-{self.pk}"
            super().save(update_fields=['key'])

class Retrospective(models.Model):
    TYPE_CHOICES = (
        ('improve', 'Improve'),
        ('keep', 'Keep'),
        ('discussion', 'Discussion'),
    )
    
    feedback = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='retrospectives')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_retrospectives')
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='responsible_retrospectives')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='discussion')
    repeating = models.BooleanField(default=False)
    owner = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    voted_by = models.ManyToManyField(User, related_name='voted_retrospectives', blank=True)

    def __str__(self):
        return self.feedback

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('invitation', 'Invitation'),
        ('assignment', 'Assignment'),
        ('mention', 'Mention'),
        ('comment', 'Comment'),
        ('status_change', 'Status Change'),
        ('deadline', 'Deadline'),
        ('system', 'System'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    item_type = models.CharField(max_length=50)
    item_id = models.CharField(max_length=20)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    url = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.message[:30]}"

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    item_type = models.CharField(max_length=50)
    item_id = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item_type', 'item_id')

    def __str__(self):
        return f"{self.user.username} - {self.item_type} - {self.item_id}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    job_title = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    last_active = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user.username
    
class Invitation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )
    
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    role = models.CharField(max_length=20, default='member')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    view_only = models.BooleanField(default=False)

    def __str__(self):
        return f"Invitation to {self.email} for {self.workspace.name}"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('assign', 'Assigned'),
        ('status', 'Status Change'),
        ('comment', 'Commented'),
        ('mention', 'Mentioned'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    content_type = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')

    def __str__(self):
        return f"{self.user.username} {self.action} {self.content_type} at {self.created_at}"


class OTP(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.email}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            # Generate a 6-digit OTP
            self.code = ''.join(random.choices(string.digits, k=6))
        
        if not self.expires_at:
            # Set expiry to 10 minutes from now
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
            
        super().save(*args, **kwargs)
    
    @classmethod
    def generate_otp(cls, email):
        # Invalidate any existing OTPs for this email
        cls.objects.filter(email=email, is_used=False).update(is_used=True)
        
        # Create a new OTP
        otp = cls.objects.create(email=email)
        return otp
    
    @classmethod
    def verify_otp(cls, email, code):
        try:
            otp = cls.objects.get(
                email=email,
                code=code,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            otp.is_used = True
            otp.save()
            return True
        except cls.DoesNotExist:
            return False