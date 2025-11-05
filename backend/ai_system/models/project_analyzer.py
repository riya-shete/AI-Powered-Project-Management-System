import requests
import json
import logging
from typing import Dict, List, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class ProjectAnalyzer:
    def __init__(self):
        self.model_name = getattr(settings, 'OLLAMA_MODEL', 'llama3.1:8b')
        self.ollama_host = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
        self.use_http = True  # Force using HTTP requests for reliability
        self._initialize_client()
    
    def _initialize_client(self):
        """Test connection to Ollama"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [m['name'] for m in models]
                logger.info(f"✅ Connected to Ollama at {self.ollama_host}")
                logger.info(f"📦 Available models: {model_names}")
                
                # Check if our model is available
                if self.model_name not in model_names:
                    logger.warning(f"⚠️ Model {self.model_name} not found. Available: {model_names}")
                    return False
                return True
            else:
                logger.error(f"❌ Ollama returned HTTP {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Cannot connect to Ollama at {self.ollama_host}: {e}")
            return False
    
    def is_healthy(self) -> bool:
        """Check if AI service is available"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def analyze_project(self, project_description: str, project_type: str = "general") -> Dict[str, Any]:
        """Analyze project using reliable HTTP requests"""
        if not self.is_healthy():
            return {"error": "AI service unavailable. Please ensure Ollama is running with 'ollama serve'"}
        
        if not project_description.strip():
            return {"error": "Project description is required"}
        
        prompt = f"""
        Analyze this {project_type} project description and provide a task breakdown in EXACT JSON format:
        
        PROJECT: {project_description}
        
        Return ONLY valid JSON in this exact structure:
        {{
            "tasks": [
                {{
                    "name": "Specific task name",
                    "description": "Detailed task description", 
                    "priority": "High/Medium/Low",
                    "estimated_hours": 8,
                    "type": "development/design/testing"
                }}
            ],
            "tech_stack": ["Python", "Django", "React"],
            "timeline_weeks": 3,
            "project_title": "Descriptive project name"
        }}
        
        Important: 
        - Return ONLY the JSON, no other text
        - "tasks" must be an array of objects with exactly these fields
        - "tech_stack" must be an array of strings
        - "timeline_weeks" must be a number
        """
        
        try:
            logger.info(f"🔍 Analyzing project: {project_description[:100]}...")
            
            # ✅ INCREASE TIMEOUT to 150 seconds
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        # Increase Ollama's internal timeout too
                        "timeout": 120000  # 120 seconds in milliseconds
                    }
                },
                timeout=150  # Increased from 120 to 150 seconds
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Ollama API returned {response.status_code}: {response.text}")
                return {"error": f"AI service error: HTTP {response.status_code}"}
            
            result = response.json()
            ai_response = result.get('response', '').strip()
            
            logger.info(f"📄 Raw AI response received, length: {len(ai_response)}")
            
            # Parse the JSON response
            parsed_result = self._parse_json_response(ai_response)
            
            if isinstance(parsed_result, dict) and "tasks" in parsed_result:
                task_count = len(parsed_result.get('tasks', []))
                logger.info(f"✅ Project analysis completed: {task_count} tasks generated")
                return parsed_result
            else:
                logger.warning(f"⚠️ Unexpected AI response format")
                # Return fallback structure
                return {
                    "tasks": [
                        {
                            "name": "Initial Setup",
                            "description": "Set up the basic project structure",
                            "priority": "High", 
                            "estimated_hours": 8,
                            "type": "development"
                        }
                    ],
                    "tech_stack": ["Python", "Django", "React"],
                    "timeline_weeks": 2,
                    "project_title": f"{project_type.title()} Project",
                    "note": "AI response parsing failed, using fallback"
                }
            
        except requests.exceptions.Timeout:
            logger.error("❌ AI request timed out after 150 seconds")
            return {"error": "AI service timeout - the model is taking too long to respond"}
        except requests.exceptions.ConnectionError:
            logger.error("❌ Cannot connect to Ollama")
            return {"error": "Cannot connect to AI service. Please check if Ollama is running."}
        except Exception as e:
            logger.error(f"❌ AI analysis failed: {e}")
            return {"error": f"Analysis failed: {str(e)}"}
            
    def _parse_json_response(self, response_text: str) -> Any:
        """Parse JSON response from AI, handling common issues"""
        # Clean the response text
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
        except json.JSONDecodeError as e:
            logger.warning(f"First JSON parse attempt failed: {e}")
            
            # Try to extract JSON from text
            try:
                # Find the first { and last }
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = cleaned_text[start_idx:end_idx]
                    return json.loads(json_str)
            except json.JSONDecodeError as e2:
                logger.warning(f"Second JSON parse attempt failed: {e2}")
                
                # Last resort: try to fix common JSON issues
                try:
                    # Add quotes to unquoted keys
                    import re
                    fixed_json = re.sub(r'(\w+):', r'"\1":', cleaned_text)
                    return json.loads(fixed_json)
                except:
                    logger.error(f"All JSON parsing attempts failed for: {cleaned_text[:200]}...")
                    return {"error": "Failed to parse AI response as JSON"}
        
        return {"error": "JSON parsing failed"}
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get detailed health status"""
        is_healthy = self.is_healthy()
        
        status_info = {
            "service": "project_analyzer", 
            "status": "healthy" if is_healthy else "unhealthy",
            "model": self.model_name,
            "host": self.ollama_host,
            "connection_method": "http"
        }
        
        if is_healthy:
            try:
                response = requests.get(f"{self.ollama_host}/api/tags", timeout=5)
                if response.status_code == 200:
                    models = response.json().get('models', [])
                    status_info.update({
                        "available_models": [m['name'] for m in models],
                        "current_model_available": self.model_name in [m['name'] for m in models]
                    })
            except Exception as e:
                status_info["model_check_error"] = str(e)
        
        return status_info