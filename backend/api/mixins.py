from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework import status
import re
import logging

logger = logging.getLogger(__name__)

class HeaderIDMixin:
    """
    A mixin that allows ViewSets to retrieve objects using IDs from headers
    instead of URL parameters.
    """
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.initial: Set pk={request.object_id} for {request.method} request")

    def list(self, request, *args, **kwargs):
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.list: Redirecting to retrieve with pk={request.object_id}")
            return self.retrieve(request, *args, **kwargs)
        return super().list(request, *args, **kwargs)

    def get_object(self):
        if hasattr(self.request, 'object_id') and self.request.object_id:
            try:
                print(f"HeaderIDMixin.get_object: Looking for object with pk={self.request.object_id}")
                obj = self.get_queryset().get(pk=self.request.object_id)
                self.check_object_permissions(self.request, obj)
                return obj
            except self.get_queryset().model.DoesNotExist:
                raise NotFound(f"No {self.get_queryset().model.__name__} matches the given query with ID {self.request.object_id}.")
        return super().get_object()

    def dispatch(self, request, *args, **kwargs):
        # Override dispatch to handle all HTTP methods
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.dispatch: Set pk={request.object_id} for {request.method} request")
        return super().dispatch(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.destroy: Set pk={request.object_id} for DELETE request")
        return super().destroy(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.update: Set pk={request.object_id} for PUT request")
        return super().update(request, *args, **kwargs)
                
    def partial_update(self, request, *args, **kwargs):
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            print(f"HeaderIDMixin.partial_update: Set pk={request.object_id} for PATCH request")
        return super().partial_update(request, *args, **kwargs)
        
    def update_with_header(self, request, *args, **kwargs):
        """Handle PUT requests to list endpoints with X-Object-ID header"""
        print(f"HeaderIDMixin.update_with_header: Handling PUT request to list endpoint")
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            return self.update(request, *args, **kwargs)
        return Response({"detail": "Object ID is required in X-Object-ID header"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    def destroy_with_header(self, request, *args, **kwargs):
        """Handle DELETE requests to list endpoints with X-Object-ID header"""
        print(f"HeaderIDMixin.destroy_with_header: Handling DELETE request to list endpoint")
        if hasattr(request, 'object_id') and request.object_id:
            self.kwargs['pk'] = request.object_id
            return self.destroy(request, *args, **kwargs)
        return Response({"detail": "Object ID is required in X-Object-ID header"}, 
                       status=status.HTTP_400_BAD_REQUEST)
