# models.py
from django.db import models
from django.contrib.auth.models import User

class UserEmailAccount(models.Model):
    """Store user's personal email credentials"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField()
    
    # SMTP Configuration
    smtp_server = models.CharField(max_length=255, default='smtp.gmail.com')
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.EmailField(blank=True, null=True)
    smtp_password = models.TextField(blank=True, default='')
    use_tls = models.BooleanField(default=True)
    
    provider = models.CharField(max_length=20, default='gmail')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email} ({self.user.username})"

class EmailTemplate(models.Model):
    TONE_CHOICES = [
        ('formal', 'Formal'),
        ('casual', 'Casual'),
        ('friendly', 'Friendly'),
        ('professional', 'Professional'),
        ('urgent', 'Urgent'),
    ]
    
    name = models.CharField(max_length=255)
    subject_template = models.TextField()
    body_template = models.TextField()
    tone = models.CharField(max_length=20, choices=TONE_CHOICES, default='professional')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class AIEmailLog(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipient_email = models.TextField()  # Changed to TextField to support multiple emails
    subject = models.TextField()
    body = models.TextField()
    original_prompt = models.TextField()
    tone = models.CharField(max_length=20, choices=EmailTemplate.TONE_CHOICES)
    customizations = models.JSONField(default=list)  # Store list of customization requests
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    ai_model_used = models.CharField(max_length=100)
    sent_from_email = models.EmailField(null=True, blank=True)
    sent_from_pms = models.BooleanField(default=False)  # Track if sent from PMS email
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Email to {self.recipient_email} - {self.status}"
    
    def get_recipient_list(self):
        """Parse recipient_email field to return list of emails"""
        if not self.recipient_email:
            return []
        return [email.strip() for email in self.recipient_email.split(',')]