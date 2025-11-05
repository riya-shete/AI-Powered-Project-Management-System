#backend\fastapi_bridge\server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Project Management Bridge",
    description="Bridge between frontend and Django AI services",
    version="1.0.0"
)

# ✅ CORS CONFIGURATION - MAKE SURE THIS IS EXACTLY LIKE THIS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],   # temporarily allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DJANGO_BACKEND = "http://localhost:8000"

class ProjectAnalysisRequest(BaseModel):
    description: str
    project_type: str = "general"

@app.post("/api/ai/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    """Analyze project with AI"""
    try:
        logger.info(f"Received analysis request: {request.description[:100]}...")
        
        response = requests.post(
            f"{DJANGO_BACKEND}/api/ai/analyze-project/",
            json={
                "description": request.description, 
                "type": request.project_type
            },
            timeout=30
        )
        
        logger.info(f"Django backend response status: {response.status_code}")
        return response.json()
        
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Django backend")
        raise HTTPException(status_code=503, detail="Django backend unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add other endpoints as needed...

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)