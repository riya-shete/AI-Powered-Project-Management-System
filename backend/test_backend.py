import requests
import json
import time

def test_backend():
    print("🧪 Testing Backend Integration...")
    
    # Test 1: Django Health
    try:
        response = requests.get("http://localhost:8000/api/ai/health/", timeout=5)
        print(f"✅ Django Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Django Health Failed: {e}")
        return
    
    # Test 2: FastAPI Health
    try:
        response = requests.get("http://localhost:8001/api/ai/health", timeout=5)
        print(f"✅ FastAPI Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ FastAPI Health Failed: {e}")
    
    # Test 3: Ollama Health
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        print(f"✅ Ollama Health: {response.status_code}")
        models = response.json().get('models', [])
        if models:
            print(f"   Available models: {[m['name'] for m in models]}")
    except Exception as e:
        print(f"❌ Ollama Health Failed: {e}")
    
    # Test 4: Project Analysis through FastAPI (FIXED)
    try:
        response = requests.post(
            "http://localhost:8001/api/ai/analyze-project",
            json={
                "description": "Build a simple task management app with user authentication and project boards",
                "project_type": "web"
            },
            timeout=30
        )
        result = response.json()
        print(f"✅ Project Analysis: {response.status_code}")
        if 'project_title' in result:
            print(f"   Project: {result['project_title']}")
            print(f"   Tasks: {len(result.get('tasks', []))}")
        else:
            print(f"   Response: {result}")
    except Exception as e:
        print(f"❌ Project Analysis Failed: {e}")
    
    # Test 5: Direct Django call (bypass FastAPI)
    try:
        response = requests.post(
            "http://localhost:8000/api/ai/analyze-project/",
            json={
                "description": "Simple test project",
                "type": "web"
            },
            timeout=30
        )
        result = response.json()
        print(f"✅ Direct Django Analysis: {response.status_code}")
        if 'project_title' in result:
            print(f"   Direct Result: {result['project_title']}")
        else:
            print(f"   Direct Response: {result}")
    except Exception as e:
        print(f"❌ Direct Django Analysis Failed: {e}")
    
    print("🎯 Backend Testing Complete!")

if __name__ == "__main__":
    test_backend()