from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Workspace, WorkspaceMember, Project, Sprint, 
    Task, Bug, Retrospective, Notification, Bookmark, UserProfile,
    Invitation, ActivityLog, OTP
)
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        
        user.set_password(password)
        user.save()
        
        return user
        
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'job_title', 'phone', 'location', 'avatar', 'last_active']

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'role', 'joined_at']

class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMemberSerializer(source='workspacemember_set', many=True, read_only=True)
    
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'owner', 'members', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'workspace', 'created_by', 'created_at', 'updated_at']

class SprintSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    assigned_by_details = UserSerializer(source='assigned_by', read_only=True)    
    class Meta:
        model = Sprint
        fields = ['id', 'name', 'project', 'start_date', 'end_date', 'active', 
                'description', 'goal', 'priority', 'assigned_to', 'assigned_by', 'assigned_to_details', 'assigned_by_details','created_at', 'updated_at']
        extra_kwargs = {
            'assigned_to': {'write_only': True, 'required': False, 'allow_null': True},
            'assigned_by': {'write_only': True, 'required': False, 'allow_null': True}
        }
class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'name', 'description', 'project', 'sprint', 'assigned_to', 
            'reporter', 'status', 'priority', 'role', 'item_id', 
            'created_at', 'updated_at', 'due_date'
        ]

class BugSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    
    class Meta:
        model = Bug
        fields = [
            'id', 'summary', 'description', 'project', 'reporter', 
            'assignee', 'status', 'priority', 'key', 'created_at', 
            'updated_at', 'due_date', 'resolution', 'type'
        ]

class RetrospectiveSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    voted_by = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    votes = serializers.IntegerField(source='voted_by.count', read_only=True)

    class Meta:
        model = Retrospective
        fields = [
            'id', 'feedback', 'description', 'project', 'created_by', 
            'responsible', 'type', 'repeating', 'votes', 'voted_by', 'owner', 
            'created_at', 'updated_at'
        ]

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'sender', 'message', 'notification_type', 'item_type', 
                 'item_id', 'read', 'created_at', 'time_since', 'url']
    
    def get_time_since(self, obj):
        """Return a human-readable time difference"""
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            if diff.days == 1:
                return "yesterday"
            elif diff.days < 7:
                return f"{diff.days} days ago"
            else:
                return obj.created_at.strftime("%b %d, %Y")
        else:
            hours = diff.seconds // 3600
            if hours > 0:
                return f"{hours} hour{'s' if hours > 1 else ''} ago"
            
            minutes = (diff.seconds % 3600) // 60
            if minutes > 0:
                return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            
            return "just now"

class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'item_type', 'item_id', 'created_at']

class InvitationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Invitation
        fields = ['id', 'workspace', 'email', 'sender', 'role', 'status', 'token', 'created_at', 'view_only']

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'action', 'content_type', 'object_id', 'details', 'created_at']


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)