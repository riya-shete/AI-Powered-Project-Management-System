#chat/middleware.py
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token_key):
    """
    Asynchronously fetches a user from the database given a DRF auth token.
    """
    try:
        token = Token.objects.select_related('user').get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        logger.warn(f"WebSocket connection failed: Token not found.")
        return AnonymousUser()
    except Exception as e:
        logger.error(f"Error getting user from token: {e}")
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom Channels middleware to authenticate users via a token in the query string.
    """
    async def __call__(self, scope, receive, send):
        
        # Check if user is already authenticated by a preceding middleware (like session auth)
        if scope.get('user') and scope['user'].is_authenticated:
            return await super().__call__(scope, receive, send)

        # User is not authenticated via session, so try token auth from query string.
        # The frontend client must send its token like: ws://.../ws/chat/1/?token=YOUR_TOKEN_KEY
        try:
            query_string = scope.get('query_string', b'').decode('utf-8')
            parsed_query = parse_qs(query_string)
            token_key = parsed_query.get('token', [None])[0]

            if token_key:
                scope['user'] = await get_user_from_token(token_key)
            else:
                # This ensures scope['user'] exists, even if it's AnonymousUser
                scope['user'] = AnonymousUser()
                
        except Exception as e:
            logger.error(f"Error in TokenAuthMiddleware: {e}")
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
