# ai_email/ollama_client.py - COMPLETE ENHANCED VERSION
import requests
import json
import logging
import re
from typing import Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self):
        self.model_name = getattr(settings, 'OLLAMA_MODEL', 'llama3.1:8b')
        self.ollama_host = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
        
    def is_healthy(self) -> bool:
        """Check if AI service is available"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

    def generate_email(self, prompt: str, tone: str, custom_instructions: str = "") -> Dict[str, Any]:
        """Generate email with SPECIFIC, CONCRETE content - NO VAGUENESS"""
        
        if not self.is_healthy():
            return {
                "success": False,
                "error": "AI service unavailable. Please ensure Ollama is running with 'ollama serve'",
                "ai_generated": False
            }
        
        if not prompt.strip():
            return {
                "success": False, 
                "error": "Email prompt is required",
                "ai_generated": False
            }
        
        # ENHANCED system prompt for detailed, specific emails
        system_prompt = f"""You are a professional email writer. Follow these CRITICAL rules:

1. **BE SPECIFIC**: Provide concrete details, dates, names, and specifics
2. **NO PLACEHOLDERS**: Never use [brackets] or placeholders like [Project Name], [Your Name], [Date]
3. **COMPLETE INFORMATION**: Include specific call-to-actions, deadlines, and next steps
4. **TONE**: Write in {tone.upper()} business tone
5. **ACTION-ORIENTED**: Include clear next steps and specific deadlines

**EXAMPLES OF GOOD VS BAD:**

BAD: "Schedule a meeting for [Project Name]"
GOOD: "Schedule a requirement gathering meeting for the E-commerce Website Redesign project"

BAD: "Respond by [date]"
GOOD: "Please respond by Friday, December 15th, 2023"

BAD: "Contact us to discuss"
GOOD: "Please reply to this email with your availability for next Tuesday or Wednesday between 2-4 PM"

BAD: "Best regards, [Your Name]"
GOOD: "Best regards, Vivek Sharma"

**CUSTOM INSTRUCTIONS:**
{custom_instructions if custom_instructions else "None"}

**OUTPUT FORMAT (STRICT):**
Subject: [Specific, concrete subject line with NO brackets]
Body: [Complete email with specific details and NO placeholders]

**CRITICAL RULES:**
- DO NOT use generic placeholders [like this]
- DO NOT be vague - be specific and concrete
- DO NOT use markdown formatting
- DO NOT add extra explanations
- ALWAYS use real names, dates, and specific details
- If unsure about details, make them up but keep them realistic

**VERIFICATION**: Before responding, check that there are NO [brackets] in your output.
"""

        full_prompt = f"User Request: {prompt}"
        
        try:
            logger.info(f"Generating specific email: {prompt[:100]}...")
            
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": full_prompt,
                    "stream": False,
                    "system": system_prompt,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "timeout": 120000
                    }
                },
                timeout=150
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama API returned {response.status_code}: {response.text}")
                return {
                    "success": False,
                    "error": f"AI service error: HTTP {response.status_code}",
                    "ai_generated": False
                }
            
            result = response.json()
            ai_response = result.get('response', '').strip()
            
            # Parse the response
            parsed_result = self._parse_email_response(ai_response)
            
            # VALIDATE: Check for vagueness and placeholders
            if self._is_too_vague(parsed_result):
                logger.warning("Email too vague, regenerating with stricter prompt")
                regenerated_result = self._regenerate_with_stricter_prompt(prompt, tone, custom_instructions)
                if regenerated_result['success']:
                    return regenerated_result
                # If regeneration fails, continue with original but mark as potentially vague
            
            logger.info("Specific email generated successfully")
            return {
                'success': True,
                'subject': parsed_result.get('subject', 'Project Discussion'),
                'body': parsed_result.get('body', 'Email content'),
                'tone_analysis': f"Professional {tone} tone with specific details",
                'ai_generated': True,
                'model_used': self.model_name
            }
            
        except requests.exceptions.Timeout:
            logger.error("Email generation timed out after 150 seconds")
            return {
                'success': False,
                'error': 'AI service timeout - the model is taking too long to respond',
                'ai_generated': False
            }
        except requests.exceptions.ConnectionError:
            logger.error("Cannot connect to Ollama for email generation")
            return {
                'success': False,
                'error': 'Cannot connect to AI service. Please check if Ollama is running.',
                'ai_generated': False
            }
        except Exception as e:
            logger.error(f"Email generation failed: {e}")
            return {
                'success': False,
                'error': f'Email generation failed: {str(e)}',
                'ai_generated': False
            }

    def customize_email(self, original_subject: str, original_body: str, instructions: str, tone: str) -> Dict[str, Any]:
        """Customize existing email with STRICT instruction following"""
        
        if not self.is_healthy():
            return {
                "success": False,
                "error": "AI service unavailable",
                "ai_generated": False
            }
        
        # DEBUG: Log what we're sending to AI
        logger.info(f"=== CUSTOMIZATION REQUEST ===")
        logger.info(f"Original Subject: {original_subject}")
        logger.info(f"Instructions: {instructions}")
        logger.info(f"Tone: {tone}")
        
        # ENHANCED system prompt for STRICT instruction following
        system_prompt = f"""You are a professional email editor. Follow these CRITICAL rules:

1. **INSTRUCTION COMPLIANCE**: You MUST implement ALL user instructions EXACTLY
2. **PRESERVE CORE**: Keep the original email's core message and purpose
3. **CHANGE TRACKING**: Only modify what is explicitly requested
4. **TONE MAINTENANCE**: Maintain {tone.upper()} tone throughout
5. **FORMAT PRESERVATION**: Keep the same email structure and formatting

**USER INSTRUCTIONS TO IMPLEMENT (MUST DO THESE):**
{instructions}

**FAILURE CONDITIONS (DO NOT DO THESE):**
- DO NOT ignore user instructions
- DO NOT change unrelated content
- DO NOT add extra explanations
- DO NOT use markdown formatting
- DO NOT remove the original core message

**OUTPUT FORMAT (STRICT):**
Subject: [updated subject line]
Body: [updated email body]

**VERIFICATION**: Before responding, verify you implemented ALL instructions.
Check that every part of the user instructions is reflected in your output.
"""

        prompt = f"""ORIGINAL EMAIL TO CUSTOMIZE:
Subject: {original_subject}
Body: {original_body}

Please provide the updated email implementing ONLY the requested changes:"""

        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "system": system_prompt,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for more consistent results
                        "top_p": 0.9,
                        "timeout": 120000
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                
                # DEBUG: Log AI response
                logger.info(f"AI Raw Response: {ai_response}")
                
                parsed_result = self._parse_email_response(ai_response)
                
                # VERIFY: Check if instructions were actually implemented
                instructions_implemented = self._verify_instructions(parsed_result, instructions, original_subject, original_body)
                
                if not instructions_implemented:
                    logger.warning("AI failed to implement instructions properly, using fallback")
                    # Fallback: Return original with manual modifications attempt
                    return self._manual_customization_fallback(original_subject, original_body, instructions)
                
                logger.info("Customization successful - instructions implemented")
                return {
                    'success': True,
                    'subject': parsed_result.get('subject', original_subject),
                    'body': parsed_result.get('body', original_body),
                    'ai_generated': True,
                    'model_used': self.model_name
                }
            else:
                logger.error(f"Customization API error: {response.status_code}")
                return {
                    'success': False,
                    'error': f"Customization failed: HTTP {response.status_code}",
                    'ai_generated': False
                }
                
        except Exception as e:
            logger.error(f"Customization failed: {str(e)}")
            return {
                'success': False,
                'error': f"Customization failed: {str(e)}",
                'ai_generated': False
            }

    def _is_too_vague(self, parsed_result):
        """Check if email contains vague placeholders"""
        subject = parsed_result.get('subject', '')
        body = parsed_result.get('body', '')
        
        content = (subject + body).lower()
        
        # Check for placeholder brackets
        if '[' in content and ']' in content:
            return True
        
        # Check for common vague phrases
        vague_indicators = [
            'project name', 'company name', 'your name', 'client name',
            'specific date', 'appropriate time', 'relevant details',
            'please provide', 'to be determined', 'tbd',
            'kind regards', 'best regards [your name]'  # Incomplete signatures
        ]
        
        for indicator in vague_indicators:
            if indicator in content:
                return True
        
        return False

    def _regenerate_with_stricter_prompt(self, prompt, tone, custom_instructions):
        """Regenerate with even stricter anti-vagueness prompting"""
        logger.info("Regenerating email with stricter anti-vagueness rules")
        
        strict_system_prompt = f"""CRITICAL: You MUST create SPECIFIC emails with NO VAGUENESS.

USER REQUEST: {prompt}
TONE: {tone}
CUSTOM INSTRUCTIONS: {custom_instructions}

**ABSOLUTE RULES:**
1. NEVER use [brackets] or placeholders
2. ALWAYS use concrete details:
   - Instead of "[Project Name]" → "Website Redesign Project" 
   - Instead of "[Date]" → "December 15, 2023"
   - Instead of "[Your Name]" → "Vivek"
   - Instead of "schedule a meeting" → "schedule a 30-minute call next Tuesday at 2 PM"
3. Make up realistic details if needed, but be SPECIFIC

**OUTPUT**: Specific subject and body with NO placeholders.
"""
        
        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "system": strict_system_prompt,
                    "options": {
                        "temperature": 0.5,  # Lower temperature for more consistency
                        "timeout": 120000
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                parsed_result = self._parse_email_response(ai_response)
                
                # Check if regeneration fixed vagueness
                if not self._is_too_vague(parsed_result):
                    logger.info("Regeneration successful - vagueness fixed")
                    return {
                        'success': True,
                        'subject': parsed_result.get('subject', 'Project Discussion'),
                        'body': parsed_result.get('body', 'Email content'),
                        'tone_analysis': 'Professional with specific details',
                        'ai_generated': True,
                        'model_used': self.model_name,
                        'regenerated': True
                    }
            
            return {
                'success': False,
                'error': 'Failed to generate specific email after regeneration',
                'ai_generated': False
            }
        
        except Exception as e:
            logger.error(f"Regeneration failed: {str(e)}")
            return {
                'success': False,
                'error': f'Regeneration failed: {str(e)}',
                'ai_generated': False
            }

    def _verify_instructions(self, parsed_result, instructions, original_subject, original_body):
        """Verify that the AI actually implemented the instructions"""
        new_subject = parsed_result.get('subject', '')
        new_body = parsed_result.get('body', '')
        
        # Check if subject changed when it should have
        if any(keyword in instructions.lower() for keyword in ['subject', 'title', 'change subject', 'update subject']):
            if new_subject == original_subject:
                logger.warning("Subject should have changed but didn't")
                return False
        
        # Check for specific instruction keywords
        instruction_keywords = ["urgent", "tomorrow", "asap", "deadline", "vivek", "signature", "add", "change", "include"]
        for keyword in instruction_keywords:
            if keyword in instructions.lower() and keyword not in (new_subject + new_body).lower():
                # Some keywords might not need to appear literally, but check context
                if keyword in ['urgent', 'tomorrow', 'asap', 'vivek']:
                    logger.warning(f"Keyword '{keyword}' from instructions not found in response")
                    return False
        
        return True

    def _manual_customization_fallback(self, original_subject, original_body, instructions):
        """Fallback when AI fails to customize properly"""
        logger.info("Using manual customization fallback")
        
        # Simple string replacements based on common instructions
        new_subject = original_subject
        new_body = original_body
        
        # Apply common transformations
        if "urgent" in instructions.lower() and "urgent" not in new_subject.lower():
            new_subject = f"URGENT: {new_subject}"
        
        if "tomorrow" in instructions.lower() and "tomorrow" not in new_body.lower():
            new_body = new_body + "\n\nWe need your response by tomorrow."
        
        if "vivek" in instructions.lower() and "signature" in instructions.lower():
            if "vivek" not in new_body.lower():
                # Find and replace generic signature
                if "regards" in new_body.lower() or "sincerely" in new_body.lower():
                    # Replace existing signature
                    lines = new_body.split('\n')
                    for i in range(len(lines)-1, max(0, len(lines)-5), -1):
                        if any(sig in lines[i].lower() for sig in ['regards', 'sincerely', 'thank you']):
                            lines[i] = "Best regards,"
                            if i+1 < len(lines):
                                lines[i+1] = "Vivek"
                            break
                    new_body = '\n'.join(lines)
                else:
                    # Add new signature
                    new_body = new_body + "\n\nBest regards,\nVivek"
        
        return {
            'success': True,
            'subject': new_subject,
            'body': new_body,
            'ai_generated': False,
            'fallback_used': True
        }

    def _parse_email_response(self, response_text: str) -> Dict[str, str]:
        """Parse AI response to extract subject and body"""
        lines = response_text.split('\n')
        subject = ""
        body = ""
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.lower().startswith('subject:'):
                subject = line[8:].strip()
                current_section = 'subject'
            elif line.lower().startswith('body:'):
                body = line[5:].strip()
                current_section = 'body'
            elif current_section == 'body' and line:
                body += '\n' + line
            elif current_section == 'subject' and line and not subject:
                subject = line
        
        # Fallback if parsing fails
        if not subject or not body:
            parts = response_text.split('\n\n', 1)
            if len(parts) >= 2:
                subject = parts[0].replace('Subject:', '').strip()
                body = parts[1].replace('Body:', '').strip()
            else:
                # Last resort - use first line as subject, rest as body
                lines = response_text.strip().split('\n')
                if lines:
                    subject = lines[0]
                    body = '\n'.join(lines[1:]) if len(lines) > 1 else "Email content"
        
        return {
            'subject': subject,
            'body': body
        }

    def _parse_json_response(self, response_text: str) -> Any:
        """Parse JSON response from AI (fallback method)"""
        cleaned_text = response_text.strip()
        
        # Remove markdown code blocks if present
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith('```'):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            try:
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = cleaned_text[start_idx:end_idx]
                    return json.loads(json_str)
            except json.JSONDecodeError:
                return {"error": "Failed to parse AI response as JSON"}
        
        return {"error": "JSON parsing failed"}
    