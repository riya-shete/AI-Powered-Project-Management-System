# admin.py
from django.contrib import admin
from .models import UserEmailAccount, EmailTemplate, AIEmailLog

@admin.register(UserEmailAccount)
class UserEmailAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'provider', 'is_active', 'created_at']
    list_filter = ['is_active', 'provider']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'tone', 'created_by', 'created_at']
    list_filter = ['tone']

@admin.register(AIEmailLog)
class AIEmailLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipient_email', 'status', 'tone', 'created_at', 'sent_from_email', 'sent_from_pms']
    list_filter = ['status', 'tone', 'sent_from_pms']
    readonly_fields = ['created_at', 'sent_at']
    search_fields = ['recipient_email', 'subject']
    
    def get_recipient_list(self, obj):
        return ", ".join(obj.get_recipient_list())
    get_recipient_list.short_description = 'Recipients'