from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Project Management Bridge",
    description="Bridge between frontend and Django AI services",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use 127.0.0.1 for better reliability
DJANGO_BACKEND = "http://127.0.0.1:8000"

class ProjectAnalysisRequest(BaseModel):
    description: str
    project_type: str = "general"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fastapi_bridge"}
@app.post("/api/ai/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    """Analyze project with AI"""
    try:
        logger.info(f"Received analysis request: {request.description[:100]}...")
        
        start_time = time.time()
        
        # ✅ INCREASE TIMEOUT to 180 seconds (3 minutes)
        response = requests.post(
            f"{DJANGO_BACKEND}/api/ai/analyze-project/",
            json={
                "description": request.description,
                "project_type": request.project_type
            },
            timeout=180,  # Increased from 30 to 180 seconds
            headers={"Content-Type": "application/json"}
        )
        
        response_time = time.time() - start_time
        logger.info(f"Django response: {response.status_code} in {response_time:.2f}s")
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Django error {response.status_code}: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Backend error: {response.status_code}")
            
    except requests.exceptions.Timeout:
        logger.error("Django backend timeout after 180 seconds")
        raise HTTPException(status_code=504, detail="AI analysis is taking too long. The model is processing your request.")
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Django backend")
        raise HTTPException(status_code=503, detail="Backend service unavailable. Please ensure Django is running.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
# In your fastapi_bridge/server.py - fix the mock endpoint
@app.post("/api/ai/mock-analyze")
async def mock_analyze_project(request: ProjectAnalysisRequest):
    """Mock analysis for testing without Django"""
    return {
        "tasks": [
            {
                "name": "Backend Setup",
                "description": f"Set up Django backend for {request.description}",
                "priority": "High",
                "estimated_hours": 8,
                "type": "development"
            },
            {
                "name": "Frontend Development", 
                "description": f"Build React frontend for {request.description}",
                "priority": "High",
                "estimated_hours": 12,
                "type": "development"
            }
        ],
        "tech_stack": ["Python", "Django", "React", "PostgreSQL"],
        "timeline_weeks": 3,
        "project_title": f"{request.project_type.title()} Project",
        "note": "Mock response for testing"
    }

@app.get("/backend-health")
async def backend_health():
    """Check if Django backend is healthy"""
    try:
        response = requests.get(f"{DJANGO_BACKEND}/api/ai/health/", timeout=10)
        return {
            "fastapi_bridge": "healthy",
            "django_backend": "healthy" if response.status_code == 200 else "unhealthy",
            "django_status": response.json() if response.status_code == 200 else f"HTTP {response.status_code}",
            "django_response": response.text[:200] if response.status_code != 200 else None
        }
    except Exception as e:
        return {
            "fastapi_bridge": "healthy", 
            "django_backend": "unhealthy",
            "error": str(e)
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)