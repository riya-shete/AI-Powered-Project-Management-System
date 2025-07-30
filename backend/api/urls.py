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

class CustomRouter(DefaultRouter):
    routes = [
        Route(
            url=r'^{prefix}{trailing_slash}$',
            mapping={
                'get': 'list',
                'post': 'create',
                'patch': 'update_with_header',
                'put': 'update_with_header',
                'delete': 'destroy_with_header'
            },
            name='{basename}-list',
            detail=False,
            initkwargs={'suffix': 'List'}
        ),
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
# router.register(r'notifications', NotificationViewSet)
router.register(r'bookmarks', BookmarkViewSet)
router.register(r'invitations', InvitationViewSet)
router.register(r'activities', ActivityLogViewSet)

notification_patterns = [
    path('', views.NotificationViewSet.as_view({
        'get': 'list',
        'post': 'create',
        'patch': 'update_with_header',
        'put': 'update_with_header',
        'delete': 'destroy_with_header'
    }), name='notification-main-action'),
    path('mark_all_read/', views.NotificationViewSet.as_view({'post': 'mark_all_read'}), name='notification-mark-all-read'),
    path('clear_all/', views.NotificationViewSet.as_view({'delete': 'clear_all'}), name='notification-clear-all'),
    path('unread_count/', views.NotificationViewSet.as_view({'get': 'unread_count'}), name='notification-unread-count'),
    path('by_type/', views.NotificationViewSet.as_view({'get': 'by_type'}), name='notification-by-type'),
    path('mark_read/', views.NotificationViewSet.as_view({'post': 'mark_read'}), name='notification-mark-read')
]

urlpatterns = [
    path('', include(router.urls)),
    path('register/', csrf_exempt(views.register_user), name='register'),
    path('auth/request-otp/', views.request_otp, name='request_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('notifications/', include(notification_patterns)),
]