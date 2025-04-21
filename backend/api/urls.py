from django.urls import path, include
from rest_framework.routers import DefaultRouter, Route, DynamicRoute, SimpleRouter
from .views import (
    UserViewSet, UserProfileViewSet, WorkspaceViewSet,
    ProjectViewSet, SprintViewSet, TaskViewSet, BugViewSet,
    RetrospectiveViewSet, NotificationViewSet, BookmarkViewSet,
    InvitationViewSet, ActivityLogViewSet, CustomAuthToken
)
from . import views
from django.views.decorators.csrf import csrf_exempt

# Custom router that allows PUT/DELETE on list endpoints
class CustomRouter(DefaultRouter):
    routes = [
        # List route with PUT/DELETE support
        Route(
            url=r'^{prefix}{trailing_slash}$',
            mapping={
                'get': 'list',
                'post': 'create',
                'put': 'update_with_header',  # Custom action for PUT on list endpoint
                'delete': 'destroy_with_header'  # Custom action for DELETE on list endpoint
            },
            name='{basename}-list',
            detail=False,
            initkwargs={'suffix': 'List'}
        ),
        # Detail route (unchanged)
        Route(
            url=r'^{prefix}/{lookup}{trailing_slash}$',
            mapping={
                'get': 'retrieve',
                'put': 'update',
                'patch': 'partial_update',
                'delete': 'destroy'
            },
            name='{basename}-detail',
            detail=True,
            initkwargs={'suffix': 'Instance'}
        ),
        # Dynamically generated routes (unchanged)
        DynamicRoute(
            url=r'^{prefix}/{lookup}/{url_path}{trailing_slash}$',
            name='{basename}-{url_name}',
            detail=True,
            initkwargs={}
        ),
        DynamicRoute(
            url=r'^{prefix}/{url_path}{trailing_slash}$',
            name='{basename}-{url_name}',
            detail=False,
            initkwargs={}
        ),
    ]

router = CustomRouter()
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
    # Remove or comment out the old token endpoint
    # path('auth/token/', csrf_exempt(CustomAuthToken.as_view()), name='api_token_auth'),
    # Keep the OTP endpoints
    path('auth/request-otp/', views.request_otp, name='request_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
]
