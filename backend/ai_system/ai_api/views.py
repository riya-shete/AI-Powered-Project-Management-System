from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
@permission_classes([AllowAny])
def ai_health(request):
    """Simple health check - publicly accessible"""
    return Response({
        "status": "healthy", 
        "service": "ai_system",
        "message": "AI system is running"
    })

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def analyze_project(request):
    """Project analysis endpoint - publicly accessible for testing"""
    try:
        data = request.data
        description = data.get('description', '').strip()
        
        if not description:
            return Response({"error": "Project description is required"}, status=400)
        
        # For now, return a mock response
        return Response({
            "project_title": "Test Project",
            "estimated_timeline": "2-4 weeks",
            "complexity_level": "Medium",
            "total_estimated_hours": 120,
            "tasks": [
                {
                    "task_name": "Setup project structure",
                    "description": "Initialize Django project and apps",
                    "estimated_hours": 8,
                    "dependencies": [],
                    "priority": "High",
                    "skill_requirements": ["Python", "Django"]
                }
            ],
            "required_skills": ["Python", "Django", "React"],
            "potential_risks": "Basic setup risks",
            "success_criteria": "Project setup completed"
        })
        
    except Exception as e:
        return Response({"error": f"Analysis failed: {str(e)}"}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def breakdown_task(request):
    """Task breakdown endpoint - publicly accessible for testing"""
    return Response({
        "message": "Task breakdown would happen here",
        "status": "working"
    })

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def estimate_duration(request):
    """Duration estimation endpoint - publicly accessible for testing"""
    try:
        data = request.data
        task = data.get('task', '').strip()
        developer_level = data.get('developer_level', 'intermediate')
        
        if not task:
            return Response({"error": "Task description is required"}, status=400)
        
        # Mock response for testing
        return Response({
            "task_description": task,
            "developer_level": developer_level,
            "time_breakdown": {
                "analysis_design": 2,
                "implementation": 8,
                "testing": 3,
                "debugging": 2,
                "documentation": 1
            },
            "total_hours": 16,
            "confidence_level": "Medium",
            "complexity_factors": ["Basic implementation"],
            "recommendations": "Standard development approach"
        })
        
    except Exception as e:
        return Response({"error": f"Duration estimation failed: {str(e)}"}, status=500)

# ADD THESE TWO MISSING FUNCTIONS:

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def comprehensive_analysis(request):
    """Comprehensive analysis endpoint - publicly accessible for testing"""
    try:
        data = request.data
        description = data.get('description', '').strip()
        project_type = data.get('type', 'general')
        
        if not description:
            return Response({"error": "Project description is required"}, status=400)
        
        # Mock response for comprehensive analysis
        return Response({
            "project_title": f"Comprehensive Analysis: {description[:20]}...",
            "estimated_timeline": "3-5 weeks",
            "complexity_level": "Medium",
            "total_estimated_hours": 180,
            "detailed_tasks": [
                {
                    "main_task": "Project Setup",
                    "subtasks": [
                        {"name": "Environment setup", "hours": 4},
                        {"name": "Database design", "hours": 6}
                    ]
                }
            ],
            "risk_assessment": "Medium risk project",
            "resource_requirements": ["Backend developer", "Frontend developer"],
            "success_metrics": ["User authentication working", "Basic CRUD operations"]
        })
        
    except Exception as e:
        return Response({"error": f"Comprehensive analysis failed: {str(e)}"}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def validate_feasibility(request):
    """Feasibility validation endpoint - publicly accessible for testing"""
    try:
        data = request.data
        description = data.get('description', '').strip()
        available_skills = data.get('available_skills', [])
        
        if not description:
            return Response({"error": "Project description is required"}, status=400)
        
        # Mock response for feasibility check
        return Response({
            "feasibility_score": 0.8,
            "required_skills": ["Python", "Django", "React", "Database"],
            "available_skills": available_skills,
            "missing_skills": ["React"] if "React" not in available_skills else [],
            "complexity_assessment": "Moderate",
            "recommendations": "Consider adding frontend developer to team",
            "timeline_confidence": "High"
        })
        
    except Exception as e:
        return Response({"error": f"Feasibility validation failed: {str(e)}"}, status=500)