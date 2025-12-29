# smtp_service.py
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .models import UserEmailAccount

logger = logging.getLogger(__name__)

class SMTPService:
    def __init__(self):
        self.logger = logger
    
    def send_email_via_user_account(self, user_account: UserEmailAccount, recipient_email: str, subject: str, body: str) -> dict:
        """Send email using user's personal SMTP credentials"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = user_account.email
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            # Add body to email
            msg.attach(MIMEText(body, 'html' if '<html>' in body.lower() else 'plain'))
            
            # Connect to SMTP server
            server = None
            try:
                server = smtplib.SMTP(user_account.smtp_server, user_account.smtp_port)
                
                if user_account.use_tls:
                    server.starttls()
                
                # Login using user's credentials
                server.login(user_account.smtp_username, user_account.smtp_password)
                
                # Send email
                server.send_message(msg)
                
                return {
                    'success': True, 
                    'message': f'Email sent successfully from {user_account.email}'
                }
                
            except smtplib.SMTPAuthenticationError as e:
                return {
                    'success': False, 
                    'error': f'Gmail authentication failed: {str(e)}. Please check your Gmail app password.'
                }
            except smtplib.SMTPException as e:
                return {
                    'success': False, 
                    'error': f'SMTP error: {str(e)}'
                }
            except Exception as e:
                return {
                    'success': False, 
                    'error': f'Connection error: {str(e)}'
                }
            finally:
                if server:
                    server.quit()
                    
        except Exception as e:
            logger.error(f"SMTP email sending failed: {str(e)}")
            return {'success': False, 'error': f'Sending failed: {str(e)}'}
    
    def send_email(self, smtp_config: dict, recipient_email: str, subject: str, body: str, from_email: str, reply_to: str = None) -> dict:
        """Generic email sending method for PMS system"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = from_email
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            if reply_to:
                msg['Reply-To'] = reply_to
            
            # Add body to email
            msg.attach(MIMEText(body, 'html' if '<html>' in body.lower() else 'plain'))
            
            # Connect to SMTP server
            server = None
            try:
                server = smtplib.SMTP(smtp_config['smtp_server'], smtp_config['smtp_port'])
                
                if smtp_config['use_tls']:
                    server.starttls()
                
                # Login using credentials
                server.login(smtp_config['smtp_username'], smtp_config['smtp_password'])
                
                # Send email
                server.send_message(msg)
                
                return {
                    'success': True, 
                    'message': f'Email sent successfully from {from_email}'
                }
                
            except smtplib.SMTPAuthenticationError as e:
                return {
                    'success': False, 
                    'error': f'SMTP authentication failed: {str(e)}'
                }
            except smtplib.SMTPException as e:
                return {
                    'success': False, 
                    'error': f'SMTP error: {str(e)}'
                }
            except Exception as e:
                return {
                    'success': False, 
                    'error': f'Connection error: {str(e)}'
                }
            finally:
                if server:
                    server.quit()
                    
        except Exception as e:
            logger.error(f"SMTP email sending failed: {str(e)}")
            return {'success': False, 'error': f'Sending failed: {str(e)}'}
    
    def test_user_smtp_connection(self, user_account: UserEmailAccount) -> dict:
        """Test user's SMTP connection"""
        try:
            server = None
            try:
                server = smtplib.SMTP(user_account.smtp_server, user_account.smtp_port)
                if user_account.use_tls:
                    server.starttls()
                server.login(user_account.smtp_username, user_account.smtp_password)
                return {'success': True, 'message': 'SMTP connection successful'}
            except smtplib.SMTPAuthenticationError as e:
                return {'success': False, 'error': f'Authentication failed: {str(e)}'}
            except Exception as e:
                return {'success': False, 'error': f'Connection failed: {str(e)}'}
            finally:
                if server:
                    server.quit()
        except Exception as e:
            return {'success': False, 'error': f'Test failed: {str(e)}'}