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

  return(
    <div className="flex-1 overflow-auto w-full h-full bg-white">
      <div className="p-6">
        {/* Breadcrumb and Header */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Projects / Ronin's Project</div>
          <h1 className="text-2xl font-semibold">PMS</h1>
        </div>

        {/* Toolbar - Fixed to stay on one line */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded flex items-center">
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
            
            <div className="relative ml-2">
              <input 
                type="text"
                placeholder="Search issues"
                className="pl-3 pr-8 py-1.5 border rounded text-sm w-48"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
              Export Issues
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
              Show all issues
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center mb-6 space-x-2 overflow-x-auto">
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            Project : ronin fintsec
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            Type
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            Status
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            Assignee
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          <button className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded">
            AI
          </button>
        </div>
        
        {/* Main Sprint Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-pink-500">
              <span className="font-medium">Main Sprint</span>
              <ChevronDown size={16} className="ml-1" />
            </div>
            <button 
              onClick={() => startAddingTask('Main Sprint')}
              className="text-blue-500 flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-600">
                <th className="p-2 border-b text-left">Tasks</th>
                <th className="p-2 border-b text-left">Responsible</th>
                <th className="p-2 border-b text-left">Role</th>
                <th className="p-2 border-b text-left">Status</th>
                <th className="p-2 border-b text-left">Priority</th>
                <th className="p-2 border-b text-left">Added</th>
                <th className="p-2 border-b text-left">Item ID</th>
              </tr>
            </thead>
            <tbody>
              {/* Form for adding new task */}
              {addingToSprint === 'Main Sprint' && (
                <tr className="text-sm bg-blue-50">
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      name="name"
                      value={newTask.name}
                      onChange={handleTaskInputChange}
                      placeholder="Task name"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      name="responsible"
                      value={newTask.responsible}
                      onChange={handleTaskInputChange}
                      placeholder="Responsible"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      disabled
                      value={newTask.added}
                      className="w-full px-2 py-1 border rounded bg-gray-50"
                    />
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                </tr>
              )}
              
              {/* Tasks list */}
              {sprintData['Main Sprint'].map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border-b">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {task.name}
                    </div>
                  </td>
                  <td className="p-2 border-b text-blue-600">{task.responsible}</td>
                  <td className="p-2 border-b">{task.role}</td>
                  <td className="p-2 border-b">{task.status}</td>
                  <td className="p-2 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-2 border-b">{task.added}</td>
                  <td className="p-2 border-b">{task.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Backlog Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-blue-500">
              <span className="font-medium">Backlog</span>
              <ChevronDown size={16} className="ml-1" />
            </div>
            <button 
              onClick={() => startAddingTask('Backlog')}
              className="text-blue-500 flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-600">
                <th className="p-2 border-b text-left">Tasks</th>
                <th className="p-2 border-b text-left">Responsible</th>
                <th className="p-2 border-b text-left">Role</th>
                <th className="p-2 border-b text-left">Status</th>
                <th className="p-2 border-b text-left">Priority</th>
                <th className="p-2 border-b text-left">Added</th>
                <th className="p-2 border-b text-left">Item ID</th>
              </tr>
            </thead>
            <tbody>
              {/* Form for adding new task */}
              {addingToSprint === 'Backlog' && (
                <tr className="text-sm bg-blue-50">
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      name="name"
                      value={newTask.name}
                      onChange={handleTaskInputChange}
                      placeholder="Task name"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      name="responsible"
                      value={newTask.responsible}
                      onChange={handleTaskInputChange}
                      placeholder="Responsible"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      disabled
                      value={newTask.added}
                      className="w-full px-2 py-1 border rounded bg-gray-50"
                    />
                  </td>
                  <td className="p-2 border-b">
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
                  </td>
                </tr>
              )}
              
              {/* Tasks list */}
              {sprintData['Backlog'].map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border-b">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {task.name}
                    </div>
                  </td>
                  <td className="p-2 border-b text-blue-600">{task.responsible}</td>
                  <td className="p-2 border-b">{task.role}</td>
                  <td className="p-2 border-b">{task.status}</td>
                  <td className="p-2 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-2 border-b">{task.added}</td>
                  <td className="p-2 border-b">{task.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Task_dashboard;