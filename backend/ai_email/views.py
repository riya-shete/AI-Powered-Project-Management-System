# ai_email/views.py - COMPLETE VERSION
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token

from .models import AIEmailLog, UserEmailAccount
from .ollama_client import OllamaClient
from .email_service import EmailService

logger = logging.getLogger(__name__)
ai_client = OllamaClient()
email_service = EmailService()

def authenticate_token(request):
    """Simple token authentication"""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Token '):
        token_key = auth_header[6:].strip()
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
    return None

@csrf_exempt
@require_http_methods(["POST"])
def generate_email(request):
    """Generate AI email"""
    try:
        # Authenticate user
        user = authenticate_token(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Invalid or missing token. Use: Authorization: Token your_token'
            }, status=401)

        # Parse request data
        data = json.loads(request.body)
        
        # Basic validation
        prompt = data.get('prompt', '').strip()
        recipient_email = data.get('recipient_email', '').strip()
        tone = data.get('tone', 'professional').strip()
        
        if not prompt:
            return JsonResponse({
                'success': False,
                'error': 'Prompt is required'
            }, status=400)

        # Generate email using AI
        ai_result = ai_client.generate_email(prompt, tone)
        
        if not ai_result['success']:
            return JsonResponse({
                'success': False,
                'error': ai_result.get('error', 'AI generation failed')
            }, status=500)

        # Create email log
        email_log = AIEmailLog.objects.create(
            user=user,
            recipient_email=recipient_email,
            subject=ai_result['subject'],
            body=ai_result['body'],
            original_prompt=prompt,
            tone=tone,
            ai_model_used=ai_result.get('model_used', 'ollama'),
            status='draft'
        )

        return JsonResponse({
            'success': True,
            'email_log_id': email_log.id,
            'subject': ai_result['subject'],
            'body': ai_result['body'],
            'tone_analysis': ai_result.get('tone_analysis', tone),
            'ai_generated': True,
            'model_used': ai_result.get('model_used', ''),
            'message': 'Email draft generated successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Email generation error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Generation failed: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def customize_email(request):
    """Customize existing AI email"""
    try:
        user = authenticate_token(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)

        data = json.loads(request.body)
        email_log_id = data.get('email_log_id')
        instructions = data.get('instructions', '').strip()

        if not email_log_id:
            return JsonResponse({
                'success': False,
                'error': 'email_log_id is required'
            }, status=400)

        if not instructions:
            return JsonResponse({
                'success': False,
                'error': 'instructions are required'
            }, status=400)

        # Get original email
        try:
            email_log = AIEmailLog.objects.get(id=email_log_id, user=user)
        except AIEmailLog.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Email not found'
            }, status=404)

        # Customize using AI
        ai_result = ai_client.customize_email(
            email_log.subject,
            email_log.body,
            instructions,
            email_log.tone
        )

        if not ai_result['success']:
            return JsonResponse({
                'success': False,
                'error': ai_result.get('error', 'Customization failed')
            }, status=500)

        # Update email
        email_log.subject = ai_result['subject']
        email_log.body = ai_result['body']
        email_log.save()

        return JsonResponse({
            'success': True,
            'email_log_id': email_log.id,
            'subject': ai_result['subject'],
            'body': ai_result['body'],
            'ai_generated': True,
            'message': 'Email customized successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Customization error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Customization failed: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def send_email(request):
    """Send the final email"""
    try:
        user = authenticate_token(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)

        data = json.loads(request.body)
        email_log_id = data.get('email_log_id')
        use_pms_email = data.get('use_pms_email', False)
        additional_recipients = data.get('additional_recipients', [])

        if not email_log_id:
            return JsonResponse({
                'success': False,
                'error': 'email_log_id is required'
            }, status=400)

        # Get email
        try:
            email_log = AIEmailLog.objects.get(id=email_log_id, user=user)
        except AIEmailLog.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Email not found'
            }, status=404)

        # Prepare recipient list
        recipients = email_log.get_recipient_list()
        if additional_recipients:
            recipients.extend([r.strip() for r in additional_recipients if r.strip()])

        if not recipients:
            return JsonResponse({
                'success': False,
                'error': 'No recipients specified'
            }, status=400)

        # Send email
        if use_pms_email:
            # Send from PMS email system
            result = email_service.send_email_via_pms(
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
                return JsonResponse({
                    'success': False,
                    'error': 'No email account configured'
                }, status=400)
            
            result = email_service.send_email_via_user_account(
                user=user,
                recipient_email=','.join(recipients),
                subject=email_log.subject,
                body=email_log.body
            )
            sent_from_pms = False
            sent_from_email = user_account.email

        if result['success']:
            email_log.status = 'sent'
            email_log.sent_from_email = sent_from_email
            email_log.sent_from_pms = sent_from_pms
            email_log.save()

            return JsonResponse({
                'success': True,
                'message': f'Email sent successfully to {len(recipients)} recipient(s)',
                'recipients': recipients,
                'sent_from_pms': sent_from_pms,
                'sent_from': sent_from_email
            })
        else:
            email_log.status = 'failed'
            email_log.save()
            return JsonResponse({
                'success': False,
                'error': result.get('error', 'Failed to send email')
            }, status=500)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Email sending error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Sending failed: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_email_drafts(request):
    """Get user's email drafts"""
    try:
        user = authenticate_token(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)

        drafts = AIEmailLog.objects.filter(user=user, status='draft').order_by('-created_at')
        
        drafts_data = []
        for draft in drafts:
            drafts_data.append({
                'id': draft.id,
                'subject': draft.subject,
                'recipient_email': draft.recipient_email,
                'tone': draft.tone,
                'created_at': draft.created_at.isoformat(),
                'customization_count': len(draft.customizations) if draft.customizations else 0
            })
        
        return JsonResponse({
            'success': True,
            'drafts': drafts_data
        })
        
    except Exception as e:
        logger.error(f"Get drafts error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to get drafts: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_email_draft_detail(request, draft_id):
    """Get specific email draft details"""
    try:
        user = authenticate_token(request)
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)

        try:
            draft = AIEmailLog.objects.get(id=draft_id, user=user)
        except AIEmailLog.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Draft not found'
            }, status=404)
        
        return JsonResponse({
            'success': True,
            'draft': {
                'id': draft.id,
                'subject': draft.subject,
                'body': draft.body,
                'recipient_email': draft.recipient_email,
                'tone': draft.tone,
                'created_at': draft.created_at.isoformat(),
                'customizations': draft.customizations or [],
                'ai_model_used': draft.ai_model_used
            }
        })
        
    except Exception as e:
        logger.error(f"Get draft detail error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Failed to get draft: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def test_auth(request):
    """Test authentication endpoint"""
    user = authenticate_token(request)
    return JsonResponse({
        'success': True,
        'authenticated': bool(user),
        'user': user.username if user else None,
        'message': 'Token authentication test'
    })

# Simple test endpoint without auth
@csrf_exempt
@require_http_methods(["GET"])
def test_endpoint(request):
    """Test endpoint"""
    return JsonResponse({
        'success': True,
        'message': 'AI Email endpoints are working!',
        'endpoints': [
            '/ai-email/generate/',
            '/ai-email/customize/', 
            '/ai-email/send/',
            '/ai-email/drafts/',
            '/ai-email/test-auth/'
        ]
    })