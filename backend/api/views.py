from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import NotFound

from .models import (
    Workspace, WorkspaceMember, Project, Sprint,
    Task, Bug, Retrospective, Notification, Bookmark, UserProfile, ActivityLog,
    Invitation, OTP
)
from .serializers import (
    UserSerializer, UserProfileSerializer, WorkspaceSerializer, 
    WorkspaceMemberSerializer, ProjectSerializer, SprintSerializer, 
    TaskSerializer, BugSerializer, RetrospectiveSerializer, 
    NotificationSerializer, BookmarkSerializer, ActivityLogSerializer, 
    InvitationSerializer, OTPRequestSerializer, OTPVerifySerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .mixins import HeaderIDMixin
from .utils import log_activity, create_notification, update_user_activity, send_otp_email

class UserViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action == 'destroy':
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        if hasattr(self.request, 'object_id'):
            try:
                obj = self.get_queryset().get(pk=self.request.object_id)
                self.check_object_permissions(self.request, obj)
                return obj
            except User.DoesNotExist:
                raise NotFound(f"No User matches the given query with ID {self.request.object_id}.")
        return super().get_object()
    
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

class UserProfileViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().select_related('user')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        profile = update_user_activity(request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    # def update(self, request, *args, **kwargs):
    #     print(f"UserProfileViewSet.update: Handling PUT request with kwargs={kwargs}")
    #     return super().update(request, *args, **kwargs)
        
    # def put(self, request, *args, **kwargs):
    #     print(f"UserProfileViewSet.put: Handling PUT request to list endpoint")
    #     if hasattr(request, 'object_id') and request.object_id:
    #         self.kwargs['pk'] = request.object_id
    #         return self.update(request, *args, **kwargs)
    #     return Response({"detail": "Object ID is required in X-Object-ID header"}, 
    #                    status=status.HTTP_400_BAD_REQUEST)

class WorkspaceViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Workspace.objects.filter(members=self.request.user).prefetch_related('members')

    
    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role='owner')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.META.get('HTTP_X_WORKSPACE_ID') or self.request.query_params.get('workspace')
        
        # Base queryset scoped to the user
        queryset = Project.objects.filter(workspace__members=self.request.user)
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset.select_related('created_by', 'workspace')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SprintViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.request.META.get('HTTP_X_PROJECT_ID') or self.request.query_params.get('project', None)
        active = self.request.query_params.get('active', None)
        
        queryset = Sprint.objects.filter(project__workspace__members=self.request.user)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if active == 'true':
            queryset = queryset.filter(active=True)
            
        return queryset.select_related('project', 'assigned_to', 'assigned_by')

    def perform_create(self, serializer):
        """
        Automatically sets the assigned_by field to the current user upon sprint creation.
        """
        serializer.save(assigned_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        sprint = self.get_object()
        project = sprint.project
        
        Sprint.objects.filter(project=project, active=True).update(active=False)
        
        sprint.active = True
        sprint.save()
        
        serializer = self.get_serializer(sprint)
        return Response(serializer.data)

class TaskViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Task.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.META.get('HTTP_X_PROJECT_ID') or self.request.query_params.get('project', None)
        sprint_id = self.request.META.get('HTTP_X_SPRINT_ID') or self.request.query_params.get('sprint', None)
        status_param = self.request.query_params.get('status', None)

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)
        
        if status_param:
            queryset = queryset.filter(status=status_param)  
        return queryset.select_related('project', 'sprint', 'assigned_to', 'reporter')
    
    def perform_create(self, serializer):
        task = serializer.save(reporter=self.request.user)
        log_activity(
            user=self.request.user, action='create', content_type='task', object_id=task.item_id,
            workspace=task.project.workspace, project=task.project,
            details={'task_name': task.name}
        )
        return task

    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        
        if not user.workspaces.filter(id=task.project.workspace.id).exists():
            return Response({"error": "User is not a member of this workspace"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        task.assigned_to = user
        task.save(update_fields=['assigned_to'])  # Add update_fields to trigger the signal correctly
        
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
        task.save(update_fields=['status'])
        
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

class BugViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Bug.objects.all()
    serializer_class = BugSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Bug.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.META.get('HTTP_X_PROJECT_ID') or self.request.query_params.get('project', None)
        status_param = self.request.query_params.get('status', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset
    
    def perform_create(self, serializer):
            bug = serializer.save(assignee=self.request.user)
            
            # Add activity logging
            log_activity(
                user=self.request.user,
                action='create',
                content_type='bug',
                object_id=bug.key,
                details={
                    'bug_summary': bug.summary,
                    'project_id': bug.project.id,
                    'project_name': bug.project.name
                }
            )
            
            return bug
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        bug = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        
        if not user.workspaces.filter(id=bug.project.workspace.id).exists():
            return Response({"error": "User is not a member of this workspace"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        bug.assignee = user
        bug.save(update_fields=['assignee'])  # Add update_fields to trigger the signal correctly
        log_activity(
            user=request.user,
            action='assign',
            content_type='bug',
            object_id=bug.key,
            details={
                'bug_summary': bug.summary,
                'project_id': bug.project.id,
                'assigned_user_id': user.id,
                'assigned_username': user.username
            }
        )
        create_notification(
            user=user,
            sender=request.user,
            message=f"{request.user.username} has assigned you to bug '{bug.summary}'",
            item_type='bug',
            item_id=bug.key
        )
        
        serializer = self.get_serializer(bug)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        bug = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = bug.status
        bug.status = new_status
        bug.save(update_fields=['status'])  # Add update_fields to trigger the signal correctly
        
        log_activity(
            user=request.user,
            action='status',
            content_type='bug',
            object_id=bug.key,
            details={
                'bug_summary': bug.summary,
                'project_id': bug.project.id,
                'old_status': old_status,
                'new_status': new_status
            }
        )
        
        if bug.assignee and bug.assignee != request.user:
            create_notification(
                user=bug.assignee,
                sender=request.user,
                message=f"Bug '{bug.summary}' status changed from {old_status} to {new_status}",
                item_type='bug',
                item_id=bug.key
            )
        
        serializer = self.get_serializer(bug)
        return Response(serializer.data)


class RetrospectiveViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Retrospective.objects.all()
    serializer_class = RetrospectiveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Retrospective.objects.filter(project__workspace__members=self.request.user)
        
        project_id = self.request.META.get('HTTP_X_PROJECT_ID') or self.request.query_params.get('project', None)
        type_param = self.request.query_params.get('type', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if type_param:
            queryset = queryset.filter(type=type_param)
            
        return queryset.select_related('project', 'created_by', 'responsible').prefetch_related('voted_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        retro = self.get_object()
        
        if retro.voted_by.filter(pk=request.user.id).exists():
            return Response({"error": "You have already voted on this retrospective"},
                            status=status.HTTP_400_BAD_REQUEST)
        retro.voted_by.add(request.user)        
        log_activity(
            user=request.user,
            action='vote',
            content_type='retrospective',
            object_id=retro.id,
            workspace=retro.project.workspace,
            project=retro.project,
            details={'feedback': retro.feedback}
        )
        serializer = self.get_serializer(retro)
        return Response(serializer.data)

class NotificationViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user).order_by('-created_at')
        
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
            
        read_status = self.request.query_params.get('read')
        if read_status is not None:
            is_read = read_status.lower() == 'true'
            queryset = queryset.filter(read=is_read)
            
        return queryset
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"status": "All notifications marked as read"})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        try:
            notification = self.get_object()
            notification.read = True
            notification.save()
            return Response({"status": "Notification marked as read"})
        except NotFound:
            return Response({"error": "Notification ID is required. Please provide it in the X-Object-ID header."}, 
                           status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all read notifications for the current user"""
        Notification.objects.filter(user=request.user, read=True).delete()
        return Response({"status": "All read notifications cleared"})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get the count of unread notifications"""
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({"count": count})
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get notifications grouped by type"""
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        
        result = {}
        for notification_type, _ in Notification.NOTIFICATION_TYPES:
            type_notifications = notifications.filter(notification_type=notification_type)
            serializer = self.get_serializer(type_notifications, many=True)
            result[notification_type] = serializer.data
            
        return Response(result)

class BookmarkViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvitationViewSet(HeaderIDMixin, viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_email = self.request.user.email
        return Invitation.objects.filter(
            Q(workspace__members=self.request.user) |  # User is a workspace member
            Q(sender=self.request.user) |              # User is the sender
            Q(email__iexact=user_email)                # User is the receiver
        ).distinct()
    
    def perform_create(self, serializer):
        invitation = serializer.save(sender=self.request.user)
        return invitation
    
    
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
        
        if invitation.email.lower() != request.user.email.lower():
            return Response({"error": "This invitation is for a different email address"}, status=status.HTTP_403_FORBIDDEN)
        
        WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=request.user,
            role=invitation.role
        )
        
        log_activity(
            user=request.user,
            action='join',
            content_type='workspace',
            object_id=invitation.workspace.id,
            details={'invitation_id': invitation.id}
        )
    
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

class ActivityLogViewSet(HeaderIDMixin, viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.META.get('HTTP_X_WORKSPACE_ID') or self.request.query_params.get('workspace', None)
        project_id = self.request.META.get('HTTP_X_PROJECT_ID') or self.request.query_params.get('project', None)
        
        queryset = ActivityLog.objects.filter(
            workspace__members=self.request.user
        )
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        elif workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
            
        return queryset.select_related('user', 'workspace', 'project').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def mentions(self, request):
        queryset = ActivityLog.objects.filter(
            action='mention',
            details__contains=f'"mentioned_user_id": {request.user.id}'
        ).order_by('-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bookmarks(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user)
    
        bookmark_conditions = Q()
        for bookmark in bookmarks:
            bookmark_conditions |= Q(content_type=bookmark.item_type, object_id=bookmark.item_id)
        
        if bookmark_conditions:
            activities = ActivityLog.objects.filter(bookmark_conditions).order_by('-created_at')[:50]
            serializer = self.get_serializer(activities, many=True)
            return Response(serializer.data)
        return Response([])
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Create a new user without requiring authentication
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Request an OTP code to be sent to the user's email
    """
    serializer = OTPRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        user = None
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
        
        otp = OTP.generate_otp(email)
        
        send_otp_email(email, otp.code)
        
        return Response({
            'message': 'OTP sent to your email',
            'email': email
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
    
        try:
            otp = OTP.objects.get(
                email=email,
                code=otp_code,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                user = User.objects.create(username=username, email=email)
                user.set_unusable_password()
                user.save()
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            otp.is_used = True
            otp.save()
            update_user_activity(user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'username': user.username
            })
        except OTP.DoesNotExist:
            return Response(
                {"error": "Invalid or expired OTP"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)