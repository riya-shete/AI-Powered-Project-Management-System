import logging
from typing import Dict, List, Any
from ..models.project_analyzer import ProjectAnalyzer
from ..models.task_analyzer import TaskAnalyzer
from ..services.ollama_service import OllamaService

logger = logging.getLogger(__name__)

class ProjectService:
    """
    High-level service that coordinates between different AI analyzers
    """
    
    def __init__(self):
        self.project_analyzer = ProjectAnalyzer()
        self.task_analyzer = TaskAnalyzer()
        self.ollama_service = OllamaService()
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive health status of all AI services"""
        ollama_healthy = self.ollama_service.check_health()
        project_analyzer_healthy = self.project_analyzer.is_healthy()
        task_analyzer_healthy = self.task_analyzer.is_healthy()
        
        overall_healthy = ollama_healthy and project_analyzer_healthy and task_analyzer_healthy
        
        return {
            "overall_status": "healthy" if overall_healthy else "unhealthy",
            "services": {
                "ollama": {
                    "status": "healthy" if ollama_healthy else "unhealthy",
                    "models": self.ollama_service.get_available_models()
                },
                "project_analyzer": {
                    "status": "healthy" if project_analyzer_healthy else "unhealthy",
                    "model": getattr(self.project_analyzer, 'model_name', 'unknown')
                },
                "task_analyzer": {
                    "status": "healthy" if task_analyzer_healthy else "unhealthy",
                    "model": getattr(self.task_analyzer, 'model_name', 'unknown')
                }
            }
        }
    
    def comprehensive_project_analysis(self, project_description: str, project_type: str = "general") -> Dict[str, Any]:
        """
        Perform comprehensive project analysis with task breakdowns
        """
        # Step 1: Analyze the overall project
        project_analysis = self.project_analyzer.analyze_project(project_description, project_type)
        
        if "error" in project_analysis:
            return project_analysis
        
        # Step 2: Break down each main task into subtasks
        detailed_tasks = []
        for task in project_analysis.get('tasks', []):
            task_name = task.get('task_name', '')
            if task_name:
                subtasks = self.task_analyzer.break_down_task(task_name, project_description)
                task['subtasks'] = subtasks
            detailed_tasks.append(task)
        
        project_analysis['detailed_tasks'] = detailed_tasks
        
        return project_analysis
    
    def estimate_project_timeline(self, project_description: str) -> Dict[str, Any]:
        """
        Estimate complete project timeline with risk assessment
        """
        analysis = self.project_analyzer.analyze_project(project_description)
        
        if "error" in analysis:
            return analysis
        
        total_hours = analysis.get('total_estimated_hours', 0)
        tasks = analysis.get('tasks', [])
        
        # Calculate risk-adjusted timeline
        risk_adjusted_hours = self._calculate_risk_adjusted_hours(total_hours, analysis.get('complexity_level', 'Medium'))
        
        return {
            "original_estimate_hours": total_hours,
            "risk_adjusted_hours": risk_adjusted_hours,
            "estimated_timeline_weeks": round(risk_adjusted_hours / 40, 1),  # 40 hours per week
            "complexity": analysis.get('complexity_level', 'Unknown'),
            "task_count": len(tasks),
            "risks": analysis.get('potential_risks', 'No specific risks identified')
        }
    
    def _calculate_risk_adjusted_hours(self, base_hours: int, complexity: str) -> int:
        """Calculate risk-adjusted hours based on complexity"""
        multipliers = {
            "Low": 1.1,    # 10% buffer
            "Medium": 1.3,  # 30% buffer
            "High": 1.6     # 60% buffer
        }
        multiplier = multipliers.get(complexity, 1.3)
        return int(base_hours * multiplier)
    
    def validate_project_feasibility(self, project_description: str, available_skills: List[str]) -> Dict[str, Any]:
        """
        Validate if project is feasible with given skills
        """
        analysis = self.project_analyzer.analyze_project(project_description)
        
        if "error" in analysis:
            return analysis
        
        required_skills = analysis.get('required_skills', [])
        missing_skills = [skill for skill in required_skills if skill not in available_skills]
        
        feasibility_score = max(0, 1 - len(missing_skills) / max(1, len(required_skills)))
        
        return {
            "feasibility_score": round(feasibility_score, 2),
            "required_skills": required_skills,
            "available_skills": available_skills,
            "missing_skills": missing_skills,
            "recommendations": f"Consider learning: {', '.join(missing_skills)}" if missing_skills else "All required skills are available!",
            "complexity": analysis.get('complexity_level', 'Unknown')
        }