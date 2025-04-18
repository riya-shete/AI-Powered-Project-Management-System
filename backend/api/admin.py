from django.contrib import admin
from .models import (
    Workspace, WorkspaceMember, Project, Sprint, 
    Task, Bug, Retrospective, Bookmark, Invitation,
    UserProfile, Notification, ActivityLog, OTP
)

admin.site.register(Workspace)
admin.site.register(WorkspaceMember)
admin.site.register(Project)
admin.site.register(Sprint)
admin.site.register(Task)
admin.site.register(Bug)
admin.site.register(Retrospective)
admin.site.register(Bookmark)
admin.site.register(Invitation)
admin.site.register(UserProfile)
admin.site.register(Notification)
admin.site.register(ActivityLog)
admin.site.register(OTP)