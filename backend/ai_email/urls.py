# ai_email/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Email Generation & Management
    path('generate/', views.generate_email, name='generate-email'),
    path('customize/', views.customize_email, name='customize-email'),
    path('send/', views.send_email, name='send-email'),
    path('drafts/', views.get_email_drafts, name='email-drafts'),
    path('drafts/<int:draft_id>/', views.get_email_draft_detail, name='email-draft-detail'),
    
    # Test endpoints
    path('test-auth/', views.test_auth, name='test-auth'),
    path('test/', views.test_endpoint, name='test-endpoint'),
]