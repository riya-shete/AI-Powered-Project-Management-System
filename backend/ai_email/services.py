# services.py
from django.utils import timezone  
from .models import AIEmailLog, EmailTemplate, UserEmailAccount
from .ollama_client import OllamaClient
from .email_service import EmailService
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

class AIEmailService:
    def __init__(self):
        self.ollama_client = OllamaClient()
        self.email_service = EmailService()
    
    def generate_email_draft(self, user: User, prompt: str, recipient_email: str, 
                           tone: str, custom_instructions: str = "") -> dict:
        try:
            result = self.ollama_client.generate_email(prompt, tone, custom_instructions)
            
            # If AI generation failed, return the error
            if not result['success']:
                return result
            
            # Store customization history
            customizations = [{
                'type': 'initial_generation',
                'instructions': prompt,
                'custom_instructions': custom_instructions,
                'timestamp': timezone.now().isoformat()
            }]
            
            email_log = AIEmailLog.objects.create(
                user=user,
                recipient_email=recipient_email,
                subject=result['subject'],
                body=result['body'],
                original_prompt=prompt,
                tone=tone,
                customizations=customizations,
                ai_model_used=result.get('model_used', 'ollama'),
                status='draft'
            )
            
            return {
                'success': True,
                'email_log_id': email_log.id,
                'subject': result['subject'],
                'body': result['body'],
                'tone_analysis': result.get('tone_analysis', ''),
                'ai_generated': result.get('ai_generated', False),
                'model_used': result.get('model_used', ''),
                'message': 'Email draft generated successfully'
            }
            
        except Exception as e:
            logger.error(f"Email generation failed: {str(e)}")
            return {'success': False, 'error': f'Generation failed: {str(e)}'}
    
    def customize_email_draft(self, email_log_id: int, instructions: str, user: User) -> dict:
        try:
            email_log = AIEmailLog.objects.get(id=email_log_id, user=user)
            
            result = self.ollama_client.customize_email(
                email_log.subject, 
                email_log.body, 
                instructions,
                email_log.tone
            )
            
            if not result['success']:
                return result
            
            # Update customization history
            customizations = email_log.customizations or []
            customizations.append({
                'type': 'customization',
                'instructions': instructions,
                'timestamp': timezone.now().isoformat(),
                'previous_subject': email_log.subject,
                'previous_body': email_log.body
            })
            
            # Update the draft
            email_log.subject = result['subject']
            email_log.body = result['body']
            email_log.customizations = customizations
            email_log.save()
            
            return {
                'success': True,
                'email_log_id': email_log.id,
                'subject': result['subject'],
                'body': result['body'],
                'tone_analysis': f"Customized while maintaining {email_log.tone} tone",
                'ai_generated': result.get('ai_generated', False),
                'model_used': result.get('model_used', ''),
                'message': 'Email customized successfully'
            }
            
        except AIEmailLog.DoesNotExist:
            return {'success': False, 'error': 'Email draft not found'}
        except Exception as e:
            logger.error(f"Email customization failed: {str(e)}")
            return {'success': False, 'error': f'Customization failed: {str(e)}'}
    
    def send_final_email(self, email_log_id: int, user: User, use_pms_email: bool = False, additional_recipients: list = None) -> dict:
        try:
            email_log = AIEmailLog.objects.get(id=email_log_id, user=user)
            
            # Prepare recipient list
            recipients = email_log.get_recipient_list()
            if additional_recipients:
                recipients.extend([r.strip() for r in additional_recipients if r.strip()])
            
            if not recipients:
                return {'success': False, 'error': 'No recipients specified'}
            
            # Send email based on user choice
            if use_pms_email:
                # Send from PMS email system
                result = self.email_service.send_email_via_pms(
                    user=user,
                    recipient_emails=recipients,
                    subject=email_log.subject,
                    body=email_log.body
                )
                sent_from_pms = True
                sent_from_email = "pms-system@company.com"
            else:
                # Send from user's personal email
                user_account = UserEmailAccount.objects.filter(user=user, is_active=True).first()
                if not user_account:
                    return {'success': False, 'error': 'No email account configured'}
                
                result = self.email_service.send_email_via_user_account(
                    user=user,
                    recipient_email=','.join(recipients),
                    subject=email_log.subject,
                    body=email_log.body
                )
                sent_from_pms = False
                sent_from_email = user_account.email
            
            if result['success']:
                email_log.status = 'sent'
                email_log.sent_at = timezone.now()
                email_log.sent_from_email = sent_from_email
                email_log.sent_from_pms = sent_from_pms
                email_log.recipient_email = ','.join(recipients)  # Update with final recipient list
                email_log.save()
                
                return {
                    'success': True,
                    'message': f'Email sent successfully to {len(recipients)} recipient(s)',
                    'recipients': recipients,
                    'sent_from_pms': sent_from_pms,
                    'sent_from': sent_from_email
                }
            else:
                email_log.status = 'failed'
                email_log.save()
                return result
                
        except AIEmailLog.DoesNotExist:
            return {'success': False, 'error': 'Email draft not found'}
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {'success': False, 'error': f'Sending failed: {str(e)}'}
    
    def get_user_drafts(self, user: User):
        """Get all email drafts for user"""
        return AIEmailLog.objects.filter(user=user, status='draft').order_by('-created_at')
    
    def get_draft_detail(self, draft_id: int, user: User):
        """Get specific email draft detail"""
        try:
            return AIEmailLog.objects.get(id=draft_id, user=user)
        except AIEmailLog.DoesNotExist:
            return None