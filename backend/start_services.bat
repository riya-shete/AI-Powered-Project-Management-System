@echo off
echo 🚀 Starting AI Project Management System...
echo.

:: Check if Ollama is installed
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama is not installed. Please install from https://ollama.ai/
    pause
    exit /b 1
)

echo 📦 Starting Ollama...
start "Ollama" /B ollama serve
timeout /t 5 /nobreak >nul

echo 🔧 Setting up AI model...
ollama pull llama3.1:8b

echo 🐍 Starting Django backend...
start "Django" /B python manage.py runserver
timeout /t 3 /nobreak >nul

echo ⚡ Starting FastAPI bridge...
start "FastAPI Bridge" /B uvicorn fastapi_bridge.server:app --host 0.0.0.0 --port 8001 --reload

echo.
echo ✅ All services started!
echo.
echo 📊 Django API: http://localhost:8000
echo 🔗 FastAPI Bridge: http://localhost:8001
echo 🤖 Ollama: http://localhost:11434

echo.
echo ⚠️  Press any key to stop all services...
pause >nul

echo.
echo 🛑 Stopping all services...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im ollama.exe >nul 2>&1
echo ✅ All services stopped.