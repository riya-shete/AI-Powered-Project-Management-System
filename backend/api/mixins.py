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
        """
        Called early in the request lifecycle. We check for the header ID and
        inject it into the URL kwargs ('pk'), so DRF's default mechanisms can use it.
        """
        super().initial(request, *args, **kwargs)
        
        object_id = getattr(request, 'object_id', None)
        if object_id:
            self.kwargs['pk'] = object_id
            logger.debug(f"HeaderIDMixin: Injected pk={object_id} from X-Object-ID header.")

    def list(self, request, *args, **kwargs):
        """
        If a GET request is made to the list endpoint with an ID in the header,
        treat it as a 'retrieve' action for that single object.
        """
        if request.method == 'GET' and self.kwargs.get('pk'):
            return self.retrieve(request, *args, **kwargs)
        return super().list(request, *args, **kwargs)

    def get_object(self):
        """
        Override get_object only to provide a clearer error message when
        the ID from a header is not found.
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        if lookup_url_kwarg not in self.kwargs and 'pk' in self.kwargs:
            try:
                return super().get_object()
            except NotFound:
                model_name = self.get_queryset().model.__name__
                raise NotFound(f"No {model_name} found for ID '{self.kwargs['pk']}' provided in the header.")
        
        return super().get_object()

    # def dispatch(self, request, *args, **kwargs):
    #     # Override dispatch to handle all HTTP methods
    #     if hasattr(request, 'object_id') and request.object_id:
    #         self.kwargs['pk'] = request.object_id
    #         print(f"HeaderIDMixin.dispatch: Set pk={request.object_id} for {request.method} request")
    #     return super().dispatch(request, *args, **kwargs)

    # def destroy(self, request, *args, **kwargs):
    #     if hasattr(request, 'object_id') and request.object_id:
    #         self.kwargs['pk'] = request.object_id
    #         print(f"HeaderIDMixin.destroy: Set pk={request.object_id} for DELETE request")
    #     return super().destroy(request, *args, **kwargs)
        
    # def update(self, request, *args, **kwargs):
    #     if hasattr(request, 'object_id') and request.object_id:
    #         self.kwargs['pk'] = request.object_id
    #         print(f"HeaderIDMixin.update: Set pk={request.object_id} for PUT request")
    #     return super().update(request, *args, **kwargs)
                
    # def partial_update(self, request, *args, **kwargs):
    #     if hasattr(request, 'object_id') and request.object_id:
    #         self.kwargs['pk'] = request.object_id
    #         print(f"HeaderIDMixin.partial_update: Set pk={request.object_id} for PATCH request")
    #     return super().partial_update(request, *args, **kwargs)
        
    def update_with_header(self, request, *args, **kwargs):
        """Handle PUT requests to list endpoints with X-Object-ID header."""
        if not self.kwargs.get('pk'):
            return Response({"detail": "X-Object-ID header is required for this action."},
                            status=status.HTTP_400_BAD_REQUEST)
        return self.update(request, *args, **kwargs)
    
    def destroy_with_header(self, request, *args, **kwargs):
        """Handle DELETE requests to list endpoints with X-Object-ID header."""
        if not self.kwargs.get('pk'):
            return Response({"detail": "X-Object-ID header is required for this action."},
                            status=status.HTTP_400_BAD_REQUEST)
        return self.destroy(request, *args, **kwargs)