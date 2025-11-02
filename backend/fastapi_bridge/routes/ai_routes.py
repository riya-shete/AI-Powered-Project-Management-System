from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import requests
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Request models
class ProjectAnalysisRequest(BaseModel):
    description: str
    project_type: str = "general"

class TaskBreakdownRequest(BaseModel):
    task: str
    context: str = ""

class DurationEstimationRequest(BaseModel):
    task: str
    developer_level: str = "intermediate"

@router.post("/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    """
    Analyze a project description and generate task breakdown
    """
    try:
        # Call Django backend AI service
        django_url = "http://localhost:8000/api/ai/analyze-project/"
        
        response = requests.post(
            django_url,
            json={
                "description": request.description,
                "type": request.project_type
            },
            timeout=30  # 30 second timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check if there's an error in the AI response
            if "error" in result:
                raise HTTPException(
                    status_code=422,  # Unprocessable Entity
                    detail=f"AI analysis error: {result['error']}"
                )
                
            return result
        else:
            error_detail = response.json().get('error', 'Unknown error')
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Django backend error: {error_detail}"
            )
            
    except requests.exceptions.Timeout:
        logger.error("Request to Django backend timed out")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Django backend")
        raise HTTPException(status_code=503, detail="Django backend unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/breakdown-task")
async def breakdown_task(request: TaskBreakdownRequest):
    """
    Break down a main task into detailed subtasks
    """
    try:
        django_url = "http://localhost:8000/api/ai/breakdown-task/"
        
        response = requests.post(
            django_url,
            json={
                "task": request.task,
                "context": request.context
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_detail = response.json().get('error', 'Unknown error')
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Task breakdown failed: {error_detail}"
            )
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    except Exception as e:
        logger.error(f"Breakdown failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/estimate-duration")
async def estimate_duration(request: DurationEstimationRequest):
    """
    Estimate time required for a specific task
    """
    try:
        django_url = "http://localhost:8000/api/ai/estimate-duration/"
        
        response = requests.post(
            django_url,
            json={
                "task": request.task,
                "developer_level": request.developer_level
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_detail = response.json().get('error', 'Unknown error')
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Duration estimation failed: {error_detail}"
            )
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    except Exception as e:
        logger.error(f"Estimation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def ai_health():
    """
    Check health of AI services
    """
    try:
        django_url = "http://localhost:8000/api/ai/health/"
        response = requests.get(django_url, timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            return {
                "status": "healthy",
                "services": {
                    "django_backend": "healthy",
                    "ollama": health_data.get('status', 'unknown')
                },
                "models": health_data.get('models', [])
            }
        else:
            return {
                "status": "degraded", 
                "services": {
                    "django_backend": "unhealthy",
                    "ollama": "unknown"
                }
            }
            
    except requests.exceptions.ConnectionError:
        return {
            "status": "unhealthy",
            "services": {
                "django_backend": "unreachable",
                "ollama": "unknown"
            },
            "message": "Cannot connect to Django backend"
        }