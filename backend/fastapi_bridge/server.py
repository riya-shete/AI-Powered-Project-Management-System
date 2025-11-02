from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import logging
from pydantic import BaseModel
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Project Management Bridge",
    description="Bridge between frontend and Django AI services",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Django backend URL
DJANGO_BACKEND = "http://localhost:8000"

# Pydantic models for request validation
class ProjectAnalysisRequest(BaseModel):
    description: str
    project_type: Optional[str] = "general"

class TaskBreakdownRequest(BaseModel):
    task: str
    context: Optional[str] = ""

@app.get("/")
async def root():
    return {"message": "AI Project Management Bridge API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fastapi-bridge"}

@app.get("/api/ai/health")
async def ai_health():
    """Check AI health via Django backend"""
    try:
        response = requests.get(f"{DJANGO_BACKEND}/api/ai/health/", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"status": "unhealthy", "service": "django-backend", "error": response.text}
    except requests.exceptions.ConnectionError:
        return {"status": "unhealthy", "service": "connection-failed", "message": "Cannot connect to Django"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/ai/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    """Analyze project via Django backend - FIXED VERSION"""
    try:
        response = requests.post(
            f"{DJANGO_BACKEND}/api/ai/analyze-project/",
            json={
                "description": request.description,
                "type": request.project_type
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_detail = response.json().get('error', 'Unknown error') if response.content else 'Empty response'
            logger.error(f"Django returned error: {response.status_code} - {error_detail}")
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Django backend unavailable")
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/breakdown-task")
async def breakdown_task(request: TaskBreakdownRequest):
    """Break down task via Django backend"""
    try:
        response = requests.post(
            f"{DJANGO_BACKEND}/api/ai/breakdown-task/",
            json={
                "task": request.task,
                "context": request.context
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_detail = response.json().get('error', 'Unknown error') if response.content else 'Empty response'
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Django backend unavailable")
    except Exception as e:
        logger.error(f"Breakdown failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "fastapi_bridge.server:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )