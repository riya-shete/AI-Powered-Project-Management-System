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
    class Meta:
        model = Sprint
        fields = ['id', 'name', 'project', 'start_date', 'end_date', 'active', 'created_at', 'updated_at']

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
            'updated_at', 'due_date', 'resolution'
        ]

class RetrospectiveSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    
    class Meta:
        model = Retrospective
        fields = [
            'id', 'feedback', 'description', 'project', 'created_by', 
            'responsible', 'type', 'repeating', 'votes', 'voted_users', 'owner', 
            'created_at', 'updated_at'
        ]

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'sender', 'message', 'item_type', 'item_id', 'read', 'created_at']

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