import requests
import json
import logging
from typing import Dict, List, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class TaskAnalyzer:
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
    
    def break_down_task(self, task_description: str, context: str = "") -> List[Dict[str, Any]]:
        """Break down a task into subtasks using HTTP requests"""
        if not self.is_healthy():
            return [{"name": "Setup", "description": "AI service unavailable", "estimated_minutes": 0}]
        
        prompt = f"""
        Break down this task into 3-5 subtasks: {task_description}
        Context: {context}
        
        Return ONLY JSON array in this format:
        [
            {{
                "name": "Subt task name",
                "description": "What to do",
                "estimated_minutes": 60
            }}
        ]
        """
        
        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3}
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                
                try:
                    subtasks = json.loads(ai_response)
                    if isinstance(subtasks, list):
                        return subtasks
                except:
                    pass
            
            # Fallback subtasks
            return [
                {"name": "Research", "description": f"Research {task_description}", "estimated_minutes": 60},
                {"name": "Implementation", "description": f"Implement {task_description}", "estimated_minutes": 120},
                {"name": "Testing", "description": f"Test {task_description}", "estimated_minutes": 30}
            ]
            
        except Exception as e:
            logger.error(f"Task breakdown failed: {e}")
            return [{"name": "Error", "description": f"Failed to break down task: {str(e)}", "estimated_minutes": 0}]
    
    def estimate_task_duration(self, task: str, developer_level: str = "intermediate") -> Dict[str, Any]:
        """Estimate task duration using HTTP requests"""
        if not self.is_healthy():
            return {"estimated_hours": 8, "confidence": "low", "reason": "AI service unavailable"}
        
        prompt = f"""
        Estimate time for this task: {task}
        Developer level: {developer_level}
        
        Return ONLY JSON: {{"estimated_hours": 8, "confidence": "High/Medium/Low", "breakdown": "Explanation"}}
        """
        
        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3}
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                
                try:
                    estimation = json.loads(ai_response)
                    if isinstance(estimation, dict):
                        return estimation
                except:
                    pass
            
            # Fallback estimation
            return {
                "estimated_hours": 8,
                "confidence": "medium", 
                "breakdown": "Fallback estimation",
                "developer_level": developer_level
            }
            
        except Exception as e:
            logger.error(f"Duration estimation failed: {e}")
            return {"estimated_hours": 8, "confidence": "low", "reason": f"Estimation failed: {str(e)}"}