# email_service.py
import logging
import os
from django.conf import settings
from .smtp_service import SMTPService
from .models import UserEmailAccount

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_service = SMTPService()
    
    def send_email_via_user_account(self, user, recipient_email: str, subject: str, body: str) -> dict:
        """Send email using user's personal email account"""
        try:
            user_account = UserEmailAccount.objects.filter(user=user, is_active=True).first()
            
            if not user_account:
                return {
                    'success': False, 
                    'error': 'No email account configured. Please connect your Gmail account first.'
                }
            
            if not user_account.smtp_password:
                return {
                    'success': False,
                    'error': 'Gmail account not properly configured. Please update your Gmail app password.'
                }
            
            # Send via user's personal SMTP
            result = self.smtp_service.send_email_via_user_account(
                user_account=user_account,
                recipient_email=recipient_email,
                subject=subject,
                body=body
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {'success': False, 'error': f'Sending failed: {str(e)}'}
    
    def send_email_via_pms(self, user, recipient_emails: list, subject: str, body: str) -> dict:
        """Send email using PMS email system"""
        try:
            # PMS SMTP configuration from environment
            pms_smtp_config = {
                'smtp_server': os.getenv('PMS_SMTP_SERVER', 'smtp.gmail.com'),
                'smtp_port': int(os.getenv('PMS_SMTP_PORT', 587)),
                'smtp_username': os.getenv('PMS_SMTP_USERNAME', 'pmsa01134@gmail.com'),
                'smtp_password': os.getenv('PMS_SMTP_PASSWORD', 'arcyhavgfvusvuki'),
                'use_tls': os.getenv('PMS_SMTP_USE_TLS', 'True').lower() == 'true'
            }
            
            # Add user's email to body for reply-to functionality
            user_email = user.email
            modified_body = f"{body}\n\n---\nThis email was sent on behalf of {user.get_full_name() or user.username} ({user_email})"
            
            # Send via PMS SMTP
            result = self.smtp_service.send_email(
                smtp_config=pms_smtp_config,
                recipient_email=','.join(recipient_emails),
                subject=subject,
                body=modified_body,
                from_email=pms_smtp_config['smtp_username'],
                reply_to=user_email  # Set reply-to to user's email
            )
            
            return result
            
        except Exception as e:
            logger.error(f"PMS email sending failed: {str(e)}")
            return {'success': False, 'error': f'PMS sending failed: {str(e)}'}
    
    def test_user_smtp_connection(self, user) -> dict:
        """Test user's SMTP connection"""
        user_account = UserEmailAccount.objects.filter(user=user, is_active=True).first()
        if not user_account:
            return {'success': False, 'error': 'No email account configured'}
        
        return self.smtp_service.test_user_smtp_connection(user_account)