# backend/middleware.py - Alternative simpler approach

from django.utils.deprecation import MiddlewareMixin

class CsrfExemptMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)

class HeaderIDMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.object_id = request.META.get('HTTP_X_OBJECT_ID')
        request.workspace_id = request.META.get('HTTP_X_WORKSPACE_ID')
        request.project_id = request.META.get('HTTP_X_PROJECT_ID')
        request.sprint_id = request.META.get('HTTP_X_SPRINT_ID')