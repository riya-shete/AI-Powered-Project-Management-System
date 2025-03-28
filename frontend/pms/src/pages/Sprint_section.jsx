import React, { useState, useMemo } from 'react';
import { Search, User, Filter, ArrowDownUp, EyeOff, MoreVertical, Plus, Edit, Check, X } from 'lucide-react';

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
    { id: '13455134', name: 'Sprint 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024', active: true },
    { id: '12451545', name: 'Sprint 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024', active: false },
    { id: '3246151', name: 'Sprint 3', responsible: 'Anand S.', role: 'Product', status: 'Stuck', priority: 'Medium', added: '12 Dec 2024', active: true },
    { id: '64135315', name: 'Sprint 4', responsible: 'Riya S.', role: 'Dev', status: 'Done', priority: 'Low', added: '21 Oct 2024', active: false },
    { id: '1464135', name: 'Sprint 5', responsible: 'Kalyani B.', role: 'Product', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024', active: true },
  ]);

  const [newTask, setNewTask] = useState({
    name: '',
    responsible: '',
    role: '',
    status: '',
    priority: 'Low',
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      name: task.name,
      responsible: task.responsible,
      role: task.role,
      status: task.status,
      priority: task.priority,
    });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id ? { ...task, ...newTask } : task
    ));
    setNewTask({
      name: '',
      responsible: '',
      role: '',
      status: '',
      priority: 'Low',
    });
    setEditingTask(null);
    setShowAddForm(false);
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleTaskSelect = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setSelectedTasks(prev => [...prev, taskId]);
    }
  };

  // Get unique persons and roles for dropdowns
  const uniquePersons = [...new Set(tasks.map(task => task.responsible))];
  const uniqueRoles = [...new Set(tasks.map(task => task.role))];

  // Filtered tasks based on search query and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery 
        ? task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.responsible.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesPerson = personFilter 
        ? task.responsible === personFilter 
        : true;

      const matchesRole = roleFilter 
        ? task.role === roleFilter 
        : true;

      return matchesSearch && matchesPerson && matchesRole;
    });
  }, [tasks, searchQuery, personFilter, roleFilter]);
  
  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
            <h1 className="text-2xl text-gray-700 font-bold">Sprints</h1>
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
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingTask(null);
              setNewTask({
                name: '',
                responsible: '',
                role: '',
                status: '',
                priority: 'Low',
              });
              setShowAddForm(true);
            }}
          >
            New Sprint <Plus size={14} className="ml-1" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search sprints"
              className="px-3 py-1.5 text-sm border rounded bg-white pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
          </div>
          <div className="relative">
            <button 
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => {
                setIsPersonDropdownOpen(!isPersonDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
            >
              <User size={14} className="mr-1" /> 
              {personFilter || 'Person'}
            </button>
            {isPersonDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPersonFilter('');
                    setIsPersonDropdownOpen(false);
                  }}
                >
                  All Persons
                </div>
                {uniquePersons.map(person => (
                  <div 
                    key={person}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPersonFilter(person);
                      setIsPersonDropdownOpen(false);
                    }}
                  >
                    {person}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsPersonDropdownOpen(false);
              }}
            >
              <Filter size={14} className="mr-1" /> 
              {roleFilter || 'Role'}
            </button>
            {isRoleDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setRoleFilter('');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  All Roles
                </div>
                {uniqueRoles.map(role => (
                  <div 
                    key={role}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRoleFilter(role);
                      setIsRoleDropdownOpen(false);
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <ArrowDownUp size={14} className="mr-1" /> Sort
          </button>
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <EyeOff size={14} className="mr-1" /> Hide
          </button>
          <button className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded flex items-center">
            AI
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="w-8 p-3">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={selectAll}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="p-3 text-sm font-medium text-gray-600">Tasks</th>
                <th className="p-3 text-sm font-medium text-gray-600">Responsible</th>
                <th className="p-3 text-sm font-medium text-gray-600">Role</th>
                <th className="p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-sm font-medium text-gray-600">Priority</th>
                <th className="p-3 text-sm font-medium text-gray-600">Added</th>
                <th className="p-3 text-sm font-medium text-gray-600">Active?</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleTaskSelect(task.id)}
                    />
                  </td>
                  <td className="p-3 flex items-center">
                    {task.name}
                    <button 
                      className="ml-2 text-gray-500"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                  <td className="p-3">
                    <a href="#" className="text-blue-600">{task.responsible}</a>
                  </td>
                  <td className="p-3">{task.role}</td>
                  <td className="p-3">{task.status}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3">{task.added}</td>
                  <td className="p-3">
                    {task.active ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal popup for adding/editing tasks */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-3">
              {editingTask ? 'Edit Sprint' : 'Add New Sprint'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sprint Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Sprint name"
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
                onClick={editingTask ? handleSaveEdit : handleAddTask}
                disabled={!newTask.name || !newTask.responsible || !newTask.role || !newTask.status}
              >
                {editingTask ? 'Save Changes' : 'Add Sprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintsPage;