//frontend\pms\src\components\AIProjectAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { Bot, X, Plus, MessageCircle, ChevronDown } from 'lucide-react';
import aiService from '../services/aiService';

const AIAssistantWidget = ({ projectId, onTasksGenerated, sprints }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [showSprintDropdown, setShowSprintDropdown] = useState(false);

  // Set default sprint when sprints prop changes
  useEffect(() => {
    if (sprints && sprints.length > 0) {
      const activeSprint = sprints.find(sprint => sprint.active) || sprints[0];
      if (activeSprint) {
        setSelectedSprint(activeSprint.id.toString());
      }
    }
  }, [sprints]);

  // In your AIProjectAnalyzer.jsx - update the handleAnalyze function
const handleAnalyze = async () => {
  if (!prompt.trim()) {
    setError('Please describe what tasks you want to create');
    return;
  }

  if (!selectedSprint) {
    setError('Please select a sprint first');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    // Add user message to conversation with loading indicator
    const userMessage = { 
      type: 'user', 
      content: prompt,
      sprint: getSprintName(selectedSprint)
    };
    setConversation(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage = {
      type: 'system',
      content: ' AI is analyzing your request. This may take 1-2 minutes for complex requests...',
      loading: true
    };
    setConversation(prev => [...prev, loadingMessage]);

    // Call AI service
    const result = await aiService.analyzeProject(prompt);
    
    // Remove loading message
    setConversation(prev => prev.filter(msg => !msg.loading));
    
    // Handle AI service errors
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Extract tasks from the AI response
    const tasks = result.tasks || [];
    const timeline = result.timeline_weeks || 'unknown';
    const techStack = result.tech_stack || [];
    const projectTitle = result.project_title || 'Your Project';
    
    // Add AI response to conversation
    const aiMessage = { 
      type: 'ai', 
      content: `I've analyzed "${projectTitle}" and generated ${tasks.length} tasks. Estimated timeline: ${timeline} weeks. Technology stack: ${techStack.join(', ')}`,
      tasks: tasks,
      sprintId: selectedSprint,
      sprintName: getSprintName(selectedSprint)
    };
    setConversation(prev => [...prev, aiMessage]);

    // If tasks were generated, show option to add them
    if (tasks.length > 0) {
      setConversation(prev => [...prev, {
        type: 'system',
        content: `Would you like to add ${tasks.length} tasks to "${getSprintName(selectedSprint)}"?`,
        tasks: tasks,
        sprintId: selectedSprint
      }]);
    }

    setPrompt(''); // Clear input after sending

  } catch (err) {
    console.error('AI analysis failed:', err);
    
    // Remove loading message if it exists
    setConversation(prev => prev.filter(msg => !msg.loading));
    
    setError(err.message || 'Failed to analyze project');
    setConversation(prev => [...prev, {
      type: 'error',
      content: `Error: ${err.message || 'Failed to analyze project'}`
    }]);
  } finally {
    setLoading(false);
  }
};

  const handleAddTasks = async (tasks, sprintId) => {
  if (!projectId || !sprintId) {
    setError('No project or sprint selected');
    return;
  }

  try {
    setLoading(true);
    
    // Convert AI tasks to your task format and send to backend
    const taskPromises = tasks.map(async (aiTask) => {
      const taskData = {
        name: aiTask.name,
        description: aiTask.description,
        project: Number(projectId),
        sprint: Number(sprintId), // Use the selected sprint
        status: 'ready', // Or 'ready' depending on your workflow
        priority: mapPriority(aiTask.priority),
        role: mapTaskType(aiTask.type || aiTask.role),
        estimated_hours: aiTask.estimated_hours,
        due_date: calculateDueDate(aiTask.estimated_hours),
        created_at: new Date().toISOString().split('T')[0],
        item_id: `T${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`,
        assigned_to: null,
        assigned_by: Number(localStorage.getItem('user_id'))
      };

      console.log('Creating task:', taskData);

      // Send to your backend API
      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create task');
      }
      return response.json();
    });

    const createdTasks = await Promise.all(taskPromises);
    
    // Notify parent component
    if (onTasksGenerated) {
      onTasksGenerated(createdTasks);
    }

    // Add success message to conversation - this appends to existing conversation
    setConversation(prev => [...prev, {
      type: 'system',
      content: ` Successfully added ${createdTasks.length} tasks to "${getSprintName(sprintId)}"!`
    }]);

  } catch (err) {
    console.error('Failed to add tasks:', err);
    setError('Failed to add tasks to project: ' + err.message);
    // Add error message to conversation - this also appends to existing conversation
    setConversation(prev => [...prev, {
      type: 'error',
      content: `Error: Failed to add tasks to project - ${err.message}`
    }]);
  } finally {
    setLoading(false);
  }
};

  // Helper functions
  const getSprintName = (sprintId) => {
    const sprint = sprints?.find(s => s.id.toString() === sprintId.toString());
    return sprint ? sprint.name : 'Unknown Sprint';
  };

  const mapPriority = (aiPriority) => {
    const priorityMap = {
      'high': 'high',
      'medium': 'medium', 
      'low': 'low'
    };
    return priorityMap[aiPriority?.toLowerCase()] || 'medium';
  };

  const mapTaskType = (taskType) => {
    const typeMap = {
      'development': 'dev',
      'design': 'design',
      'testing': 'test',
      'documentation': 'dev',
      'deployment': 'dev',
      'backend': 'dev',
      'frontend': 'dev',
      'database': 'dev',
      'ui/ux': 'design',
      'api': 'dev',
      'mobile': 'dev'
    };
    return typeMap[taskType?.toLowerCase()] || 'dev';
  };

  const calculateDueDate = (estimatedHours) => {
    const days = Math.ceil(estimatedHours / 8); // Convert hours to working days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString().split('T')[0];
  };

  const clearConversation = () => {
    setConversation([]);
    setError('');
  };

  const handleSprintSelect = (sprintId) => {
    setSelectedSprint(sprintId);
    setShowSprintDropdown(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="AI Assistant"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <h3 className="font-semibold">AI Project Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                className="p-1 hover:bg-blue-500 rounded transition-colors"
                title="Clear conversation"
              >
                <MessageCircle size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-500 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Sprint Selection */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Add to Sprint:
            </label>
            <div className="relative">
              <button
                onClick={() => setShowSprintDropdown(!showSprintDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">
                  {selectedSprint ? getSprintName(selectedSprint) : 'Select a sprint...'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {showSprintDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {sprints?.map((sprint) => (
                    <button
                      key={sprint.id}
                      onClick={() => handleSprintSelect(sprint.id.toString())}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedSprint === sprint.id.toString() ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{sprint.name}</span>
                        {sprint.active && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {(!sprints || sprints.length === 0) && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No sprints available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {conversation.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Describe tasks you want to create</p>
                <p className="text-xs mt-2">They will be added to: <strong>{getSprintName(selectedSprint)}</strong></p>
                <p className="text-xs mt-1">Example: "Create user authentication with login and registration"</p>
              </div>
            )}
            
            {conversation.map((message, index) => (
              <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  {message.sprintName && (
                    <div className="text-xs opacity-75 mb-1">
                      Sprint: {message.sprintName}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Show generated tasks */}
                  {message.tasks && message.tasks.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border">
                      <p className="text-xs font-medium mb-2">Generated Tasks:</p>
                      {message.tasks.slice(0, 3).map((task, taskIndex) => (
                        <div key={taskIndex} className="text-xs p-1 border-b last:border-b-0">
                          <div className="font-medium">{task.name}</div>
                          <div className="text-gray-600">
                            {task.estimated_hours}h • {task.priority} • {task.type || 'development'}
                          </div>
                        </div>
                      ))}
                      {message.tasks.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">+{message.tasks.length - 3} more tasks</p>
                      )}
                    </div>
                  )}
                  
                  {/* Add tasks button */}
                  {message.type === 'system' && message.tasks && (
                    <button
                      onClick={() => handleAddTasks(message.tasks, message.sprintId)}
                      disabled={loading}
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium disabled:bg-green-300 transition-colors flex items-center justify-center"
                    >
                      <Plus size={14} className="mr-1" />
                      Add {message.tasks.length} Tasks to {getSprintName(message.sprintId)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe tasks for ${getSprintName(selectedSprint)}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={loading || !selectedSprint}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !prompt.trim() || !selectedSprint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tasks will be added to: <strong>{getSprintName(selectedSprint)}</strong>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;