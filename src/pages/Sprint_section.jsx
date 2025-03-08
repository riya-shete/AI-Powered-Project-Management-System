import React, { useState } from 'react';
import { Search, User, Filter, ArrowDownUp, EyeOff, MoreVertical, Plus } from 'lucide-react';

import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

const SprintsPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Sprintmain />
      </div>
    </div>
  );
};

const Sprintmain = () => {
  const [tasks, setTasks] = useState([
    { id: '13455134', name: 'Feature 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024' },
    { id: '12451545', name: 'Feature 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024' },
    { id: '3246151', name: 'Feature 3', responsible: 'Anand S.', role: 'Product', status: 'Stuck', priority: 'Medium', added: '12 Dec 2024' },
    { id: '64135315', name: 'Feature 4', responsible: 'Riya S.', role: 'Dev', status: 'Done', priority: 'Low', added: '21 Oct 2024' },
    { id: '1464135', name: 'Feature 5', responsible: 'Kalyani B.', role: 'Product', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024' },
  ]);

  const [newTask, setNewTask] = useState({
    name: '',
    responsible: '',
    role: '',
    status: '',
    priority: 'Low',
  });
  
  const [showAddForm, setShowAddForm] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-gray-100 text-gray-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    // Generate a random ID for the new task
    const newId = Math.floor(Math.random() * 10000000).toString();
    
    // Get current date in DD MMM YYYY format
    const today = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
    
    const taskToAdd = {
      ...newTask,
      id: newId,
      added: formattedDate
    };
    
    setTasks(prev => [taskToAdd, ...prev]);
    setNewTask({
      name: '',
      responsible: '',
      role: '',
      status: '',
      priority: 'Low',
    });
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Sprints</h1>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1 text-sm bg-white">
              <Integrate size={16} className="mr-1" /> Integrate
            </button>
            <button className="flex items-center px-3 py-1 text-sm bg-white">
              <Automate size={16} className="mr-1" /> Automate
            </button>
            <button className="px-3 py-1 text-sm text-white bg-gray-500 rounded">Invite</button>
            <button className="ml-2">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        <div className="flex items-center mb-4">
          <div className="font-medium">Main Table</div>
          <button className="ml-2">
            <MoreVertical size={16} />
          </button>
          <button className="ml-4">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex mb-4 space-x-2 flex-wrap">
          <button 
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            New Item <Plus size={14} className="ml-1" />
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            <Search size={14} className="mr-1" /> Search
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            <User size={14} className="mr-1" /> Person
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            <Filter size={14} className="mr-1" /> Filter
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            <ArrowDownUp size={14} className="mr-1" /> Sort
          </button>
          <button className="px-3 py-1 text-sm border rounded bg-white flex items-center">
            <EyeOff size={14} className="mr-1" /> Hide
          </button>
        </div>

        {showAddForm && (
          <div className="mb-4 bg-gray-50 p-4 rounded border">
            <h3 className="text-lg font-medium mb-3">Add New Task</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Feature name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsible</label>
                <input
                  type="text"
                  name="responsible"
                  value={newTask.responsible}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={newTask.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Role</option>
                  <option value="Dev">Dev</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for review">Waiting for review</option>
                  <option value="Stuck">Stuck</option>
                  <option value="Done">Done</option>
                  <option value="Ready to start">Ready to start</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddTask}
                disabled={!newTask.name || !newTask.responsible || !newTask.role || !newTask.status}
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="w-8 p-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3 text-sm font-medium text-gray-600">Tasks</th>
                <th className="p-3 text-sm font-medium text-gray-600">Responsible</th>
                <th className="p-3 text-sm font-medium text-gray-600">Role</th>
                <th className="p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-sm font-medium text-gray-600">Priority</th>
                <th className="p-3 text-sm font-medium text-gray-600">Added</th>
                <th className="p-3 text-sm font-medium text-gray-600">Item ID</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3 flex items-center">
                    {task.name}
                    <button className="ml-2 rounded-full bg-gray-200 w-6 h-6 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </td>
                  <td className="p-3 text-blue-600">{task.responsible}</td>
                  <td className="p-3">{task.role}</td>
                  <td className="p-3">{task.status}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3">{task.added}</td>
                  <td className="p-3">{task.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <button 
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

// Custom icons for Integrate and Automate
const Integrate = ({ className, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 20l4-16m2 16l4-16" />
    <path d="M3 8h18M3 16h18" />
  </svg>
);

const Automate = ({ className, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);

export default SprintsPage;