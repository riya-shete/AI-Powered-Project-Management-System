# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from ai_system.services.project_service import ProjectService
from ai_system.services.ollama_service import OllamaService
import logging

logger = logging.getLogger(__name__)

# Initialize services
project_service = ProjectService()
ollama_service = OllamaService()

@api_view(['GET'])
@permission_classes([AllowAny])
def ai_health(request):
    """Comprehensive AI health check"""
    health_status = project_service.get_system_health()
    return Response(health_status)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check"""
    return JsonResponse({"status": "AI system healthy"})
@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def analyze_project(request):
    """Project analysis endpoint that uses AI only"""
    try:
        logger.info(f"📥 Django analyze_project called with data: {request.data}")
        
        data = request.data
        description = data.get('description', '').strip()
        project_type = data.get('project_type', 'web')  # ✅ Fixed parameter name
        
        logger.info(f"📝 Processing: '{description[:50]}...' (type: {project_type})")
        
        if not description:
            logger.warning("❌ No description provided")
            return Response({"error": "Project description is required"}, status=400)
        
        # Check if AI service is healthy first
        if not project_service.project_analyzer.is_healthy():
            logger.error("❌ AI service unhealthy")
            return Response({
                "error": "AI service is currently unavailable",
                "details": "Please ensure Ollama is running with 'ollama serve' command"
            }, status=503)
        
        logger.info("🤖 Calling AI service...")
        # Use the actual AI service
        analysis_result = project_service.project_analyzer.analyze_project(description, project_type)
        logger.info(f"✅ AI service returned: {str(analysis_result)[:200]}...")
        
        # Return whatever the AI returns
        return Response(analysis_result)
        
    except Exception as e:
        logger.error(f"💥 Project analysis failed: {e}", exc_info=True)
        return Response({"error": f"Analysis failed: {str(e)}"}, status=500)
@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def breakdown_task(request):
    """Task breakdown endpoint using AI only"""
    try:
        data = request.data
        task_description = data.get('task', '').strip()
        
        if not task_description:
            return Response({"error": "Task description is required"}, status=400)
        
        # Use AI for task breakdown
        subtasks = project_service.task_analyzer.break_down_task(task_description)
        
        # Return pure AI response
        return Response({
            "subtasks": subtasks,
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"Task breakdown failed: {e}")
        return Response({"error": f"Task breakdown failed: {str(e)}"}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def estimate_duration(request):
    """Duration estimation using AI only"""
    try:
        data = request.data
        task = data.get('task', '').strip()
        developer_level = data.get('developer_level', 'intermediate')
        
        if not task:
            return Response({"error": "Task description is required"}, status=400)
        
        # Use AI for duration estimation
        estimation = project_service.task_analyzer.estimate_task_duration(task, developer_level)
        
        # Return pure AI response
        return Response(estimation)
        
    except Exception as e:
        logger.error(f"Duration estimation failed: {e}")
        return Response({"error": f"Duration estimation failed: {str(e)}"}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def comprehensive_analysis(request):
    """Comprehensive analysis using AI only"""
    try:
        data = request.data
        description = data.get('description', '').strip()
        project_type = data.get('type', 'general')
        
        if not description:
            return Response({"error": "Project description is required"}, status=400)
        
        # Use comprehensive AI analysis
        analysis = project_service.comprehensive_project_analysis(description, project_type)
        
        # Return pure AI response
        return Response(analysis)
        
    except Exception as e:
        logger.error(f"Comprehensive analysis failed: {e}")
        return Response({"error": f"Comprehensive analysis failed: {str(e)}"}, status=500)

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def validate_feasibility(request):
    """Feasibility validation using AI only"""
    try:
        data = request.data
        description = data.get('description', '').strip()
        available_skills = data.get('available_skills', [])
        
        if not description:
            return Response({"error": "Project description is required"}, status=400)
        
        # Use AI for feasibility validation
        feasibility = project_service.validate_project_feasibility(description, available_skills)
        
        # Return pure AI response
        return Response(feasibility)
        
    except Exception as e:
        logger.error(f"Feasibility validation failed: {e}")
        return Response({"error": f"Feasibility validation failed: {str(e)}"}, status=500)