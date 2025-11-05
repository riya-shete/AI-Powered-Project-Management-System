#backend\ai_system\services\ollama_service.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
    
    def check_health(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False
    
    def get_available_models(self) -> list:
        """Get list of available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                return response.json().get('models', [])
            return []
        except Exception as e:
            logger.error(f"Failed to get models: {e}")
            return []
    
    def get_model_info(self, model_name: str) -> dict:
        """Get information about a specific model"""
        try:
            response = requests.post(
                f"{self.base_url}/api/show",
                json={"name": model_name},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            logger.error(f"Failed to get model info: {e}")
            return {}
    
    def get_system_info(self) -> dict:
        """Get Ollama system information"""
        try:
            response = requests.get(f"{self.base_url}/api/version", timeout=5)
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            logger.error(f"Failed to get system info: {e}")
            return {}