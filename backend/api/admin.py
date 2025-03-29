from django.contrib import admin
from .models import (
    Workspace, WorkspaceMember, Project, Sprint, 
    Bug, Retrospective, Bookmark, Invitation
)

admin.site.register(Workspace)
admin.site.register(WorkspaceMember)
admin.site.register(Project)
admin.site.register(Sprint)
admin.site.register(Bug)
admin.site.register(Retrospective)
admin.site.register(Bookmark)
admin.site.register(Invitation)