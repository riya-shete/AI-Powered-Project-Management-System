import json
import requests
from django.conf import settings
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

class GoogleOAuthManager:
    @staticmethod
    def get_authorization_url():
        """Generate Google OAuth authorization URL"""
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'https://www.googleapis.com/auth/gmail.send',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        query_string = '&'.join([f'{k}={v}' for k, v in params.items()])
        return f"{base_url}?{query_string}"

    @staticmethod
    def exchange_code_for_tokens(authorization_code):
        """Exchange authorization code for access and refresh tokens"""
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'code': authorization_code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        }
        
        try:
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Token exchange failed: {str(e)}")
            return None

    @staticmethod
    def refresh_access_token(refresh_token):
        """Refresh access token using refresh token"""
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        
        try:
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Token refresh failed: {str(e)}")
            return None

    @staticmethod
    def send_email_via_gmail(access_token, recipient_email, subject, body, from_email):
        """Send email using Gmail API"""
        import base64
        from email.mime.text import MIMEText
        
        # Create email message
        message = MIMEText(body)
        message['to'] = recipient_email
        message['from'] = from_email
        message['subject'] = subject
        
        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        # Send via Gmail API
        send_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        data = {
            'raw': raw_message
        }
        
        try:
            response = requests.post(send_url, headers=headers, json=data)
            response.raise_for_status()
            return {'success': True, 'message': 'Email sent successfully via Gmail API'}
        except requests.RequestException as e:
            logger.error(f"Gmail API send failed: {str(e)}")
            return {'success': False, 'error': str(e)}