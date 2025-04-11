from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

class CsrfExemptMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Exempt CSRF for all /api/ routes
        if request.path.startswith('/api/'):
            request.csrf_processing_done = True  # Short-circuit CSRF checks
            return None  # Explicitly return None

class HeaderIDMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request method and path for debugging
        if request.method in ['PUT', 'DELETE'] and request.path.startswith('/api/'):
            logger.debug(f"Processing {request.method} request to {request.path}")
            logger.debug(f"Headers: {[k for k in request.META if k.startswith('HTTP_')]}")
            # Print all headers for debugging
            print(f"Processing {request.method} request to {request.path}")
            print(f"Headers: {[k for k in request.META if k.startswith('HTTP_')]}")

        if 'HTTP_X_OBJECT_ID' in request.META:
            request.object_id = request.META.get('HTTP_X_OBJECT_ID')
            if request.method in ['PUT', 'DELETE']:
                logger.debug(f"Set object_id to {request.object_id} for {request.method} request")
                print(f"Set object_id to {request.object_id} for {request.method} request")
        else:
            if request.method in ['PUT', 'DELETE'] and request.path.startswith('/api/'):
                logger.debug(f"No X-Object-ID header found for {request.method} request")
                print(f"No X-Object-ID header found for {request.method} request")
        
        if 'HTTP_X_WORKSPACE_ID' in request.META:
            request.workspace_id = request.META.get('HTTP_X_WORKSPACE_ID')
            
        if 'HTTP_X_PROJECT_ID' in request.META:
            request.project_id = request.META.get('HTTP_X_PROJECT_ID')
            
        if 'HTTP_X_SPRINT_ID' in request.META:
            request.sprint_id = request.META.get('HTTP_X_SPRINT_ID')
        
        return self.get_response(request)