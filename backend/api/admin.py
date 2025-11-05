#api/admin.py
from django.contrib import admin
from .models import (
    Workspace, WorkspaceMember, Project, Sprint, 
    Task, Bug, Retrospective, Bookmark, Invitation,
    UserProfile, Notification, ActivityLog, OTP
)

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'owner__username')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'created_by', 'created_at')
    list_filter = ('workspace',)
    search_fields = ('name', 'description')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'item_id', 'project', 'status', 'priority', 'assigned_to')
    list_filter = ('status', 'priority', 'project')
    search_fields = ('name', 'description', 'item_id')
    raw_id_fields = ('project', 'sprint', 'assigned_to', 'reporter')

@admin.register(Bug)
class BugAdmin(admin.ModelAdmin):
    list_display = ('summary', 'key', 'project', 'status', 'priority', 'assignee')
    list_filter = ('status', 'priority', 'type', 'project')
    search_fields = ('summary', 'description', 'key')
    raw_id_fields = ('project', 'reporter', 'assignee')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'notification_type', 'read', 'created_at')
    list_filter = ('notification_type', 'read')
    search_fields = ('user__username', 'message')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'content_type', 'object_id', 'created_at')
    list_filter = ('action', 'content_type')
    search_fields = ('user__username', 'details')

admin.site.register(WorkspaceMember)
admin.site.register(Sprint)
admin.site.register(Retrospective)
admin.site.register(Bookmark)
admin.site.register(Invitation)
admin.site.register(UserProfile)
admin.site.register(OTP)