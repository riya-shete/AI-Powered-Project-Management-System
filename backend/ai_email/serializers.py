# serializers.py
from rest_framework import serializers
from .models import EmailTemplate, AIEmailLog, UserEmailAccount

class EmailGenerationRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=1000)
    recipient_email = serializers.CharField(help_text="Single email or comma-separated emails")
    tone = serializers.ChoiceField(choices=[
        ('formal', 'Formal'),
        ('casual', 'Casual'), 
        ('friendly', 'Friendly'),
        ('professional', 'Professional'),
        ('urgent', 'Urgent'),
    ], default='professional')
    custom_instructions = serializers.CharField(required=False, allow_blank=True)

class EmailCustomizationSerializer(serializers.Serializer):
    email_log_id = serializers.IntegerField()
    instructions = serializers.CharField()

class EmailSendSerializer(serializers.Serializer):
    email_log_id = serializers.IntegerField()
    use_pms_email = serializers.BooleanField(default=False)
    additional_recipients = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        default=list
    )

class UserEmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEmailAccount
        fields = ['id', 'email', 'provider', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserEmailSetupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    provider = serializers.ChoiceField(choices=[
        ('gmail', 'Gmail'),
        ('outlook', 'Outlook'),
        ('yahoo', 'Yahoo'),
        ('other', 'Other')
    ], default='gmail')

class UserGmailSetupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    smtp_username = serializers.EmailField(help_text="Your Gmail address")
    smtp_password = serializers.CharField(
        write_only=True, 
        help_text="Gmail App Password (not your regular Gmail password)"
    )
    
    def validate(self, data):
        if data['email'] != data['smtp_username']:
            raise serializers.ValidationError("Email and SMTP username must match")
        return data