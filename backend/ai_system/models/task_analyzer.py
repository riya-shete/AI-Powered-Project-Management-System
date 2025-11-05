#backend\ai_system\models\task_analyzer.py
import ollama
import logging
from typing import Dict, List, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class TaskAnalyzer:
    def __init__(self):
        self.model_name = getattr(settings, 'OLLAMA_MODEL', 'llama3.1:8b')
        self.ollama_host = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Ollama client for task analysis"""
        try:
            self.client = ollama.Client(host=self.ollama_host)
            self.client.list()
            logger.info(f"✅ TaskAnalyzer connected to Ollama")
            return True
        except Exception as e:
            logger.error(f"❌ TaskAnalyzer connection failed: {e}")
            self.client = None
            return False
    
    def is_healthy(self) -> bool:
        """Check if task analyzer is available"""
        try:
            return self.client is not None
        except:
            return False
    
    def break_down_task(self, main_task: str, context: str = "") -> List[Dict]:
        """Break down a main task into detailed subtasks"""
        if not self.is_healthy():
            return [{"error": "AI service unavailable"}]
        
        if not main_task.strip():
            return [{"error": "Task description is required"}]
        
        prompt = f"""
        Break down this main task into detailed, executable subtasks:
        
        MAIN TASK: {main_task}
        CONTEXT: {context if context else "No specific context provided"}
        
        Provide a detailed breakdown in this EXACT JSON array format:
        [
            {{
                "subtask_name": "Specific, actionable step",
                "description": "Detailed step-by-step instructions",
                "estimated_hours": 4,
                "dependencies": ["previous_subtask"],
                "required_resources": ["VS Code", "Django", "React", "Specific libraries"],
                "acceptance_criteria": "Clear, testable completion criteria",
                "skill_level": "Beginner/Intermediate/Advanced",
                "output_deliverable": "What will be produced (e.g., API endpoint, UI component)"
            }}
        ]
        
        Guidelines:
        - Each subtask should be 2-8 hours of work
        - Include setup, implementation, testing, and review steps
        - Make subtasks actionable and specific
        """
        
        try:
            logger.info(f"🔍 Breaking down task: {main_task}")
            
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={'temperature': 0.2}
            )
            
            # Parse the response
            from ..utils.json_parser import robust_json_parse
            result = robust_json_parse(response['response'])
            
            # Ensure we return a list
            if isinstance(result, dict) and "error" in result:
                return [result]
            elif not isinstance(result, list):
                return [{"error": "Unexpected response format", "raw": str(result)[:200]}]
            
            logger.info(f"✅ Task breakdown completed: {len(result)} subtasks")
            return result
            
        except Exception as e:
            logger.error(f"❌ Task breakdown failed: {e}")
            return [{"error": f"Breakdown failed: {str(e)}"}]
    
    def estimate_task_duration(self, task_description: str, developer_level: str = "intermediate") -> Dict[str, Any]:
        """Estimate time required for a specific task"""
        if not self.is_healthy():
            return {"error": "AI service unavailable"}
        
        prompt = f"""
        Estimate the time required for this task for a {developer_level} developer:
        
        TASK: {task_description}
        
        Provide a detailed time estimation in this EXACT JSON format:
        {{
            "task_description": "{task_description}",
            "developer_level": "{developer_level}",
            "time_breakdown": {{
                "analysis_design": 2,
                "implementation": 8,
                "testing": 3,
                "debugging": 2,
                "documentation": 1,
                "code_review": 1
            }},
            "total_hours": 17,
            "confidence_level": "High/Medium/Low",
            "complexity_factors": ["Database complexity", "API integration", "UI complexity"],
            "recommendations": "Implementation suggestions",
            "risks": "Potential challenges"
        }}
        """
        
        try:
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={'temperature': 0.1}
            )
            
            from ..utils.json_parser import robust_json_parse
            return robust_json_parse(response['response'])
            
        except Exception as e:
            logger.error(f"❌ Duration estimation failed: {e}")
            return {"error": f"Estimation failed: {str(e)}"}
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of task analyzer"""
        return {
            "service": "task_analyzer",
            "status": "healthy" if self.is_healthy() else "unhealthy",
            "model": self.model_name
        }