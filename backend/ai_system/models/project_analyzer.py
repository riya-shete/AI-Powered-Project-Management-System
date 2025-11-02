import ollama
import json
import logging
from typing import Dict, List, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class ProjectAnalyzer:
    def __init__(self):
        self.model_name = getattr(settings, 'OLLAMA_MODEL', 'llama3.1:8b')
        self.ollama_host = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Ollama client"""
        try:
            self.client = ollama.Client(host=self.ollama_host)
            self.client.list()  # Test connection
            logger.info(f"✅ Connected to Ollama at {self.ollama_host}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to Ollama: {e}")
            self.client = None
            return False
    
    def is_healthy(self) -> bool:
        """Check if AI service is available"""
        try:
            if not self.client:
                return False
            self.client.list()
            return True
        except:
            return False
    
    def analyze_project(self, project_description: str, project_type: str = "general") -> Dict[str, Any]:
        """Analyze project and break down into tasks"""
        if not self.is_healthy():
            return {"error": "AI service unavailable", "solution": "Run 'ollama serve'"}
        
        if not project_description.strip():
            return {"error": "Project description is required"}
        
        prompt = f"""
        Analyze this {project_type} project and provide a detailed task breakdown:
        
        PROJECT: {project_description}
        
        Provide a comprehensive analysis in this EXACT JSON format:
        {{
            "project_title": "Descriptive project name",
            "estimated_timeline": "Realistic timeline (e.g., 2-4 weeks)",
            "complexity_level": "Low/Medium/High",
            "total_estimated_hours": 150,
            "tasks": [
                {{
                    "task_name": "Specific, actionable task name",
                    "description": "Detailed description of what needs to be done",
                    "estimated_hours": 8,
                    "dependencies": ["previous_task_name"],
                    "priority": "High/Medium/Low",
                    "skill_requirements": ["Python", "Django", "React"],
                    "category": "Backend/Frontend/DevOps/Planning"
                }}
            ],
            "required_skills": ["Python", "React", "Database Design"],
            "potential_risks": "Identify 2-3 key challenges and mitigation strategies",
            "success_criteria": "Clear, measurable success metrics"
        }}
        """
        
        try:
            logger.info(f"🤖 Analyzing project: {project_description[:100]}...")
            
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={'temperature': 0.3}
            )
            
            # Parse the response
            from ..utils.json_parser import robust_json_parse
            result = robust_json_parse(response['response'])
            
            # Validate result
            if isinstance(result, dict) and "error" not in result:
                logger.info(f"✅ Project analysis completed: {result.get('project_title', 'Unknown')}")
            else:
                logger.warning(f"⚠️ Project analysis issues: {result.get('error', 'Unknown error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ AI analysis failed: {e}")
            return {"error": f"Analysis failed: {str(e)}"}
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get detailed health status"""
        return {
            "service": "project_analyzer",
            "status": "healthy" if self.is_healthy() else "unhealthy",
            "model": self.model_name,
            "host": self.ollama_host
        }