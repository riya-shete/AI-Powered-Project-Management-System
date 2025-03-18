import React, { useState } from 'react';
import { Search, ChevronDown, List, LayoutGrid, Square, Plus, X } from 'lucide-react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';


const Task_dashboard = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <PMSDashboardSprints/>
        </div>
      </div>
    );
  };
const PMSDashboardSprints = () => {
  // Initial sprint data
  const initialSprintData = {
    'Main Sprint': [
      { id: '13455134', name: 'Feature 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024' },
      { id: '12451545', name: 'Feature 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024' },
    ],
    // 'Sprint 2': [
    //   { id: '3246151', name: 'Feature 3', responsible: 'Anand S.', role: 'Product', status: 'Stuck', priority: 'Medium', added: '12 Dec 2024' },
    // ],
    'Backlog': [
      { id: '64135315', name: 'Feature 4', responsible: 'Riya S.', role: 'Dev', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024' },
    ]
  };

  // State for sprint data
  const [sprintData, setSprintData] = useState(initialSprintData);
  
  // State for new sprint name
  const [newSprintName, setNewSprintName] = useState('');
  
  // State to track which sprint is currently being edited with a new task
  const [addingToSprint, setAddingToSprint] = useState(null);
  
  // State for new task form
  const [newTask, setNewTask] = useState({
    name: '',
    responsible: '',
    role: '',
    status: '',
    priority: 'Medium',
    added: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  // Function to generate a random ID
  const generateId = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  };

  // Function to add a new sprint
  const addNewSprint = () => {
    if (newSprintName.trim() === '') return;
    
    setSprintData(prevData => ({
      ...prevData,
      [newSprintName]: []
    }));
    
    setNewSprintName('');
  };

  // Function to start adding a task to a specific sprint
  const startAddingTask = (sprintName) => {
    setAddingToSprint(sprintName);
  };

  // Function to cancel adding a task
  const cancelAddingTask = () => {
    setAddingToSprint(null);
    setNewTask({
      name: '',
      responsible: '',
      role: '',
      status: '',
      priority: 'Medium',
      added: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  };

  // Function to add a new task to a sprint
  const addTaskToSprint = () => {
    if (!addingToSprint || !newTask.name) return;
    
    const taskToAdd = {
      ...newTask,
      id: generateId()
    };
    
    setSprintData(prevData => ({
      ...prevData,
      [addingToSprint]: [...prevData[addingToSprint], taskToAdd]
    }));
    
    cancelAddingTask();
  };

  // Function to handle change in new task form
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-gray-100 text-gray-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Function to get sprint color
  const getSprintColor = (sprintName) => {
    if (sprintName.includes('Sprint')) {
      return 'text-pink-500';
    }
    return 'text-blue-500';
  };

  return(
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-6 bg-white">
        {/* Breadcrumb and Header */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Projects / Ronin's Project</div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">PMS</h1>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
                Export Issues <ChevronDown size={14} className="ml-1" />
              </button>
              <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
                Show all issues <ChevronDown size={14} className="ml-1" />
              </button>
              <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
                List view <List size={14} className="ml-1" />
              </button>
              <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
                Detailed View <LayoutGrid size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center mb-6 space-x-2">
          <button className="px-4 py-1 text-sm text-white bg-pink-400 rounded">
            AI
          </button>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search issues"
              className="pl-2 pr-8 py-1 border rounded text-sm w-64"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Search size={14} />
            </div>
          </div>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            Project : ronin fintsec <ChevronDown size={14} className="ml-1" />
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            Type <ChevronDown size={14} className="ml-1" />
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            Status <ChevronDown size={14} className="ml-1" />
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            Assignee <ChevronDown size={14} className="ml-1" />
          </button>
        </div>
        
        {/* Add New Sprint Section */}
        <div className="mb-6 flex">
          <input
            type="text"
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
            placeholder="New Sprint Name"
            className="px-3 py-1 border rounded-l text-sm"
          />
          <button 
            onClick={addNewSprint}
            className="px-3 py-1 bg-blue-500 text-white rounded-r text-sm flex items-center"
          >
            Add Sprint <Plus size={14} className="ml-1" />
          </button>
        </div>

        {/* Sprints Sections */}
        <div className="space-y-6">
          {Object.entries(sprintData).map(([sprintName, tasks]) => (
            <div key={sprintName} className="sprint-section">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center ${getSprintColor(sprintName)} font-medium`}>
                  {sprintName} <ChevronDown size={16} className="ml-1" />
                </div>
                <button 
                  onClick={() => startAddingTask(sprintName)}
                  className="text-blue-500 flex items-center text-sm"
                >
                  Add Task <Plus size={14} className="ml-1" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded">
                <div className="grid grid-cols-7 text-sm font-medium text-gray-600 p-3 border-b">
                  <div>Tasks</div>
                  <div>Responsible</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Priority</div>
                  <div>Added</div>
                  <div>Item ID</div>
                </div>
                
                {/* Form for adding new task */}
                {addingToSprint === sprintName && (
                  <div className="grid grid-cols-7 p-3 text-sm border-b bg-blue-50">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={newTask.name}
                        onChange={handleTaskInputChange}
                        placeholder="Task name"
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="responsible"
                        value={newTask.responsible}
                        onChange={handleTaskInputChange}
                        placeholder="Responsible"
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <select
                        name="role"
                        value={newTask.role}
                        onChange={handleTaskInputChange}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Select role</option>
                        <option value="Dev">Dev</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                      </select>
                    </div>
                    <div>
                      <select
                        name="status"
                        value={newTask.status}
                        onChange={handleTaskInputChange}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Select status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Waiting for review">Waiting for review</option>
                        <option value="Stuck">Stuck</option>
                        <option value="Done">Done</option>
                        <option value="Ready to start">Ready to start</option>
                      </select>
                    </div>
                    <div>
                      <select
                        name="priority"
                        value={newTask.priority}
                        onChange={handleTaskInputChange}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        disabled
                        value={newTask.added}
                        className="w-full px-2 py-1 border rounded bg-gray-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={addTaskToSprint}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Add
                      </button>
                      <button 
                        onClick={cancelAddingTask}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Tasks list */}
                {tasks.map((task) => (
                  <div key={task.id} className="grid grid-cols-7 p-3 text-sm border-b hover:bg-gray-100">
                    <div className="flex items-center">
                      <Square size={16} className="mr-2 text-gray-400" />
                      {task.name}
                    </div>
                    <div className="text-blue-600">{task.responsible}</div>
                    <div>{task.role}</div>
                    <div>{task.status}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div>{task.added}</div>
                    <div>{task.id}</div>
                  </div>
                ))}
                
                {/* Empty state if no tasks */}
                {tasks.length === 0 && (
                  <div className="p-6 text-center text-gray-500 italic">
                    No tasks yet. Click "Add Task" to create one.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Task_dashboard;