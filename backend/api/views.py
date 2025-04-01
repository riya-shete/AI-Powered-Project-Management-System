from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
import json

from .models import (
    Workspace, WorkspaceMember, Project, Sprint,
    Task, Bug, Retrospective, Notification, Bookmark, UserProfile, ActivityLog,
    Invitation
)
from .serializers import (
    UserSerializer, UserProfileSerializer, WorkspaceSerializer, 
    WorkspaceMemberSerializer, ProjectSerializer, SprintSerializer, 
    TaskSerializer, BugSerializer, RetrospectiveSerializer, 
    NotificationSerializer, BookmarkSerializer, ActivityLogSerializer, 
    InvitationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        search_term = request.data.get('search', '')
        if search_term:
            users = User.objects.filter(
                Q(username__icontains=search_term) | 
                Q(email__icontains=search_term) |
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term)
            )
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        return Response([])

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.last_active = timezone.now()
        profile.save()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Workspace.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role='owner')

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace', None)
        if workspace_id:
            return Project.objects.filter(workspace_id=workspace_id, workspace__members=self.request.user)
        return Project.objects.filter(workspace__members=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project', None)
        active = self.request.query_params.get('active', None)
        
        queryset = Sprint.objects.filter(project__workspace__members=self.request.user)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if active == 'true':
            queryset = queryset.filter(active=True)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        sprint = self.get_object()
        project = sprint.project
        
        # Deactivate all other sprints in the project
        Sprint.objects.filter(project=project, active=True).update(active=False)
        
        # Activate the current sprint
        sprint.active = True
        sprint.save()
        
        serializer = self.get_serializer(sprint)
        return Response(serializer.data)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Task.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.query_params.get('project', None)
        sprint_id = self.request.query_params.get('sprint', None)
        status_param = self.request.query_params.get('status', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset
    
    def perform_create(self, serializer):
        task = serializer.save(reporter=self.request.user)
        
        # Log activity
        log_activity(
            user=self.request.user,
            action='create',
            content_type='task',
            object_id=task.item_id,
            details={
                'task_name': task.name,
                'project_id': task.project.id,
                'project_name': task.project.name
            }
        )
        
        return task
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        task.assigned_to = user
        task.save()
        
        # Create notification
        Notification.objects.create(
            user=user,
            sender=request.user,
            message=f"{request.user.username} has assigned you to task '{task.name}'",
            item_type='task',
            item_id=task.item_id
        )
        
        # Log activity
        log_activity(
            user=request.user,
            action='assign',
            content_type='task',
            object_id=task.item_id,
            details={
                'task_name': task.name,
                'project_id': task.project.id,
                'assigned_user_id': user.id,
                'assigned_username': user.username
            }
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = task.status
        task.status = new_status
        task.save()
        
        # Log activity
        log_activity(
            user=request.user,
            action='status',
            content_type='task',
            object_id=task.item_id,
            details={
                'task_name': task.name,
                'project_id': task.project.id,
                'old_status': old_status,
                'new_status': new_status
            }
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)

class BugViewSet(viewsets.ModelViewSet):
    queryset = Bug.objects.all()
    serializer_class = BugSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Bug.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.query_params.get('project', None)
        status_param = self.request.query_params.get('status', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        bug = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        bug.assignee = user
        bug.save()
        
        # Create notification
        Notification.objects.create(
            user=user,
            sender=request.user,
            message=f"{request.user.username} has assigned you to bug '{bug.summary}'",
            item_type='bug',
            item_id=bug.key
        )
        
        serializer = self.get_serializer(bug)
        return Response(serializer.data)

class RetrospectiveViewSet(viewsets.ModelViewSet):
    queryset = Retrospective.objects.all()
    serializer_class = RetrospectiveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Retrospective.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.query_params.get('project', None)
        type_param = self.request.query_params.get('type', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if type_param:
            queryset = queryset.filter(type=type_param)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        retro = self.get_object()
        retro.votes += 1
        retro.save()
        
        serializer = self.get_serializer(retro)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"status": "All notifications marked as read"})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Invitation.objects.filter(workspace__members=self.request.user)
    
    def perform_create(self, serializer):
        invitation = serializer.save(sender=self.request.user)
        
        # Send invitation email (in production, use Celery for async tasks)
        self.send_invitation_email(invitation)
        
        return invitation
    
    def send_invitation_email(self, invitation):
        # This would be implemented to send actual emails
        # For now, just log it
        print(f"Sending invitation to {invitation.email} for {invitation.workspace.name}")
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        token = request.query_params.get('token', None)
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = Invitation.objects.get(token=token, status='pending')
            serializer = self.get_serializer(invitation)
            return Response(serializer.data)
        except Invitation.DoesNotExist:
            return Response({"error": "Invalid or expired invitation"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        
        if invitation.status != 'pending':
            return Response({"error": "This invitation has already been processed"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email matches the current user
        if invitation.email.lower() != request.user.email.lower():
            return Response({"error": "This invitation is for a different email address"}, status=status.HTTP_403_FORBIDDEN)
        
        # Add user to workspace
        WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=request.user,
            role=invitation.role
        )
        
        # Log the activity - Add this code
        log_activity(
            user=request.user,
            action='join',
            content_type='workspace',
            object_id=invitation.workspace.id,
            details={'invitation_id': invitation.id}
        )
    
        # Update invitation status
        invitation.status = 'accepted'
        invitation.save()
        
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        
        if invitation.status != 'pending':
            return Response({"error": "This invitation has already been processed"}, status=status.HTTP_400_BAD_REQUEST)
        
        invitation.status = 'declined'
        invitation.save()
        
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace', None)
        project_id = self.request.query_params.get('project', None)
        
        # Base queryset - activities in workspaces user is a member of
        queryset = ActivityLog.objects.filter(
            user__workspaces__in=self.request.user.workspaces.all()
        ).order_by('-created_at')
        
        if workspace_id:
            # Filter activities for specific workspace
            queryset = queryset.filter(
                user__workspaces__id=workspace_id,
                user__workspaces__members=self.request.user
            )
        
        if project_id:
        # Safer approach to filter by project
            project_activities = queryset.filter(
                content_type='project',
                object_id=project_id
            )
            
            # Find activities with project references
            # Parse the JSON details field properly instead of string contains
            task_activities = queryset.filter(
                content_type__in=['task', 'bug', 'sprint']
            )
            
            # Filter task activities where project_id matches
            related_activities = []
            for activity in task_activities:
                try:
                    details = json.loads(activity.details)
                    if details.get('project_id') == int(project_id):
                        related_activities.append(activity.id)
                except:
                    pass
            
            related_queryset = ActivityLog.objects.filter(id__in=related_activities)
            queryset = project_activities | related_queryset
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def mentions(self, request):
        # Get activities where user was mentioned
        queryset = ActivityLog.objects.filter(
            action='mention',
            details__contains=f'"mentioned_user_id": {request.user.id}'
        ).order_by('-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bookmarks(self, request):
        # Get user's bookmarked items
        bookmarks = Bookmark.objects.filter(user=request.user)
    
        # Build a query to efficiently fetch related activities
        bookmark_conditions = Q()
        for bookmark in bookmarks:
            bookmark_conditions |= Q(content_type=bookmark.item_type, object_id=bookmark.item_id)
        
        # Get activities in a single query
        if bookmark_conditions:
            activities = ActivityLog.objects.filter(bookmark_conditions).order_by('-created_at')[:50]
            serializer = self.get_serializer(activities, many=True)
            return Response(serializer.data)
        return Response([])
    
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