#backend\ai_system\ai_api\urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Basic AI endpoints
    path('analyze-project/', views.analyze_project, name='analyze_project'),
    path('breakdown-task/', views.breakdown_task, name='breakdown_task'),
    path('estimate-duration/', views.estimate_duration, name='estimate_duration'),
    
    # Advanced endpoints (TEMPORARILY COMMENTED OUT)
    path('comprehensive-analysis/', views.comprehensive_analysis, name='comprehensive_analysis'),
    path('validate-feasibility/', views.validate_feasibility, name='validate_feasibility'),
    
    # Health check
    
    path('health/', views.ai_health, name='ai_health'),
]