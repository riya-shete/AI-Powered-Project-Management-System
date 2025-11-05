// frontend\pms\src\services\aiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001'; // FastAPI bridge

const aiApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000,
});

export const aiService = {
  // Analyze project
  analyzeProject: async (description, projectType = 'general') => {
    try {
      const response = await aiApi.post('/api/ai/analyze-project', {
        description,
        project_type: projectType
      });
      return response.data;
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw new Error(error.response?.data?.detail || 'Analysis failed');
    }
  },

  // Break down task
  breakdownTask: async (task, context = '') => {
    try {
      const response = await aiApi.post('/api/ai/breakdown-task', {
        task,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Task breakdown failed:', error);
      throw new Error(error.response?.data?.detail || 'Breakdown failed');
    }
  },

  // Estimate duration
  estimateDuration: async (task, developerLevel = 'intermediate') => {
    try {
      const response = await aiApi.post('/api/ai/estimate-duration', {
        task,
        developer_level: developerLevel
      });
      return response.data;
    } catch (error) {
      console.error('Duration estimation failed:', error);
      throw new Error(error.response?.data?.detail || 'Estimation failed');
    }
  },

  // Health check
  checkHealth: async () => {
    try {
      const response = await aiApi.get('/api/ai/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy' };
    }
  }, // ← MISSING COMMA HERE - This was the main error

  // Generate tasks specifically for sprint integration
  generateTasks: async (description, projectId, sprintId = null) => {
    try {
      const response = await aiApi.post('/api/ai/generate-tasks', {
        description,
        project_id: projectId,
        sprint_id: sprintId,
        context: 'task_generation' // Specific context for task creation
      });
      return response.data;
    } catch (error) {
      console.error('Task generation failed:', error);
      throw new Error(error.response?.data?.detail || 'Task generation failed');
    }
  }
};

export default aiService;