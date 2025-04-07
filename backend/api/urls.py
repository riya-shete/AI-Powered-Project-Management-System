from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UserProfileViewSet, WorkspaceViewSet,
    ProjectViewSet, SprintViewSet, TaskViewSet, BugViewSet,
    RetrospectiveViewSet, NotificationViewSet, BookmarkViewSet,
    InvitationViewSet, ActivityLogViewSet, CustomAuthToken
)
from . import views
from django.views.decorators.csrf import csrf_exempt

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'workspaces', WorkspaceViewSet)

router.register(r'projects', ProjectViewSet)
router.register(r'sprints', SprintViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'bugs', BugViewSet)
router.register(r'retrospectives', RetrospectiveViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'bookmarks', BookmarkViewSet)
router.register(r'invitations', InvitationViewSet)
router.register(r'activities', ActivityLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', csrf_exempt(views.register_user), name='register'),
    path('auth/', include('rest_framework.urls')),
    path('auth/token/', csrf_exempt(CustomAuthToken.as_view()), name='api_token_auth'),
    path('auth/login/', views.login_view, name='api_login'),  # Add this line
]
