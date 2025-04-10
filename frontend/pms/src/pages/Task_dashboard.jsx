import React, { useState } from 'react';
import { Search, ChevronDown, List, LayoutGrid, Square, Plus, X, MoreVertical } from 'lucide-react';
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
  // Initial sprint data
const initialSprintData = {
  'Sprint 1': [
    { id: '13455134', name: 'Task 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024', storyPoints: 5 },
    { id: '12451545', name: 'Task 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024', storyPoints: 3 },
  ],
  'sprint 2': [
    { id: '19793110', name: 'task 1', responsible: 'Anand S.', role: 'Design', status: 'Done', priority: 'Medium', added: '1 Mar 2025', storyPoints: 2 },
  ],
  'Backlog': [
    { id: '64135315', name: 'Task 4', responsible: 'Riya S.', role: 'Dev', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024', storyPoints: 8 },
  ]
};
    const SprintTable = ({ title, tasks, isExpanded, toggleExpand, addTask, sprintName }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High': return 'bg-orange-100 text-orange-700';
        case 'Medium': return 'bg-gray-100 text-gray-700';
        case 'Low': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={toggleExpand}
          >
            <span className="font-medium text-blue-500">{title}</span>
            <ChevronDown size={16} className={`ml-1 transition-transform ${isExpanded ? '' : 'transform rotate-180'}`} />
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">
              {sprintName === 'Sprint 1' && 'Feb 17 - Mar 2'}
              {sprintName === 'sprint 2' && 'Mar 1 - 15'}
            </span>
            <button 
              onClick={() => addTask(sprintName)}
              className="text-blue-500 flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-600">
                <th className="p-2 border-b text-left">
                  <input type="checkbox" className="mr-2" />
                  Tasks
                </th>
                <th className="p-2 border-b text-left">Owner</th>
                <th className="p-2 border-b text-left">Status</th>
                <th className="p-2 border-b text-left">Priority</th>
                <th className="p-2 border-b text-left">Type</th>
                <th className="p-2 border-b text-left">Task ID</th>
                <th className="p-2 border-b text-left">Estimated SP</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border-b">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {task.name}
                    </div>
                  </td>
                  <td className="p-2 border-b text-blue-600">{task.responsible}</td>
                  <td className="p-2 border-b">{task.status}</td>
                  <td className="p-2 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-2 border-b">{task.role || "Missing"}</td>
                  <td className="p-2 border-b">{task.id}</td>
                  <td className="p-2 border-b">{task.storyPoints || "-"}</td>
                </tr>
              ))}
              {/* Add task row */}
              <tr className="text-sm">
                <td colSpan="7" className="p-2 border-b">
                  <button 
                    onClick={() => addTask(sprintName)}
                    className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
                  >
                    + Add task
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };
  const TaskTable = ({ name, startDate, endDate, description, index, tasks = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High': return 'bg-orange-100 text-orange-700';
        case 'Medium': return 'bg-gray-100 text-gray-700';
        case 'Low': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
    
    // Format dates to display in a nice format
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };
    
    const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="font-medium text-blue-500">{name}</span>
            <ChevronDown size={16} className={`ml-1 transition-transform ${isExpanded ? '' : 'transform rotate-180'}`} />
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">{dateRange}</span>
            <button 
              onClick={() => startAddingTask(name)}
              className="text-blue-500 flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-600">
                <th className="p-2 border-b text-left">
                  <input type="checkbox" className="mr-2" />
                  Tasks
                </th>
                <th className="p-2 border-b text-left">Owner</th>
                <th className="p-2 border-b text-left">Status</th>
                <th className="p-2 border-b text-left">Priority</th>
                <th className="p-2 border-b text-left">Type</th>
                <th className="p-2 border-b text-left">Task ID</th>
                <th className="p-2 border-b text-left">Estimated SP</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-2 border-b">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        {task.name}
                      </div>
                    </td>
                    <td className="p-2 border-b text-blue-600">{task.responsible}</td>
                    <td className="p-2 border-b">{task.status}</td>
                    <td className="p-2 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-2 border-b">{task.role || "Missing"}</td>
                    <td className="p-2 border-b">{task.id}</td>
                    <td className="p-2 border-b">{task.storyPoints || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr className="text-sm">
                  <td colSpan="7" className="p-2 border-b text-center text-gray-500">
                    No tasks added yet
                  </td>
                </tr>
              )}
              {/* Add task row */}
              <tr className="text-sm">
                <td colSpan="7" className="p-2 border-b">
                  <button 
                    onClick={() => startAddingTask(name)}
                    className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
                  >
                    + Add task
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };


  const [sprintData, setSprintData] = useState(initialSprintData);
  const [taskTables, setTaskTables] = useState([]);
  const [customTableTasks, setCustomTableTasks] = useState({});
  const [currentView, setCurrentView] = useState('Main Sprint');
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableInfo, setNewTableInfo] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [sprintVisibility, setSprintVisibility] = useState({
    'Sprint 1': true,
    'sprint 2': true,
    'Backlog': true
  });
  const toggleSprintVisibility = (sprintName) => {
    setSprintVisibility(prev => ({
      ...prev,
      [sprintName]: !prev[sprintName]
    }));
  };
  
  
  const [newSprintName, setNewSprintName] = useState('');

  const [addingToSprint, setAddingToSprint] = useState(null);
  
  
  const [newTask, setNewTask] = useState({
    name: '',
    responsible: '',
    role: '',
    status: '',
    priority: 'Medium',
    storyPoints: '',
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
  const startAddingTask = (tableName) => {
    setAddingToSprint(tableName);
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
    
    // Check if we're adding to a predefined sprint or custom table
    if (Object.keys(sprintData).includes(addingToSprint)) {
      // Adding to sprint
      setSprintData(prevData => ({
        ...prevData,
        [addingToSprint]: [...prevData[addingToSprint], taskToAdd]
      }));
    } else {
      // Adding to custom table
      setCustomTableTasks(prevData => ({
        ...prevData,
        [addingToSprint]: [...(prevData[addingToSprint] || []), taskToAdd]
      }));
    }
    
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
  const openAddTableModal = () => {
    setIsAddTableModalOpen(true);
  };
  
  const closeAddTableModal = () => {
    setIsAddTableModalOpen(false);
    setNewTableInfo({
      name: '',
      date: '',
      description: ''
    });
  };
  
  const handleTableInfoChange = (e) => {
    const { name, value } = e.target;
    setNewTableInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addNewTable = () => {
    if (!newTableInfo.name) return;
    
    setTaskTables(prev => [...prev, { ...newTableInfo, id: generateId() }]);
    closeAddTableModal();
  };

  return(
    <div className="flex-1 overflow-auto w-full h-full">
    <div className="p-4 bg-white">
      {/* Header section */}
      <header className="flex justify-between items-center mb-6"> 
        <div>
          <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
          <h1 className="text-2xl text-gray-700 font-bold">PMS</h1>
        </div>
      </header>

      {/* Filter/Action Buttons Row */}
      <div className="flex mb-4 space-x-2 flex-wrap">
        <button 
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
          onClick={openAddTableModal}
        >
          New task <Plus size={14} className="ml-1" />
        </button>

        
        <div className="relative">
          <input
            type="text"
            placeholder="Search issues"
            className="px-3 py-1.5 text-sm border rounded bg-white pl-8 w-64"
          />
          <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
        </div>
        
        {/* More filter buttons */}
        <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
          Person <ChevronDown size={16} className="ml-1" />
        </button>
        
        <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
          Filter <ChevronDown size={16} className="ml-1" />
        </button>
        
        <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
          Sort <ChevronDown size={16} className="ml-1" />
        </button>
        
        <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
          Hide <ChevronDown size={16} className="ml-1" />
        </button>
      </div>
      
      {/* Navigation tabs for views */}
      <div className="flex mb-4 space-x-2 border-b">
        <button 
          className={`px-3 py-2 text-sm font-medium ${currentView === 'All Sprints' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentView('All Sprints')}
        >
          All Sprints
        </button>
        <button 
          className={`px-3 py-2 text-sm font-medium ${currentView === 'Active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentView('Active')}
        >
          Active Sprints
        </button>
        <button 
          className={`px-3 py-2 text-sm font-medium ${currentView === 'Backlog' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentView('Backlog')}
        >
          Backlog
        </button>
        <button 
          className={`px-3 py-2 text-sm font-medium ${currentView === 'Kanban' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setCurrentView('Kanban')}
        >
          Kanban
        </button>
      </div>
      
      {/* Sprint Tables */}
      {(currentView === 'All Sprints' || currentView === 'Active') && (
        <SprintTable 
          title="Sprint 1" 
          tasks={sprintData['Sprint 1']} 
          isExpanded={sprintVisibility['Sprint 1']}
          toggleExpand={() => toggleSprintVisibility('Sprint 1')}
          addTask={startAddingTask}
          sprintName="Sprint 1"
        />
      )}
      
      {(currentView === 'All Sprints' || currentView === 'Active') && (
        <SprintTable 
          title="sprint 2" 
          tasks={sprintData['sprint 2']} 
          isExpanded={sprintVisibility['sprint 2']}
          toggleExpand={() => toggleSprintVisibility('sprint 2')}
          addTask={startAddingTask}
          sprintName="sprint 2"
        />
      )}
      
      {(currentView === 'All Sprints' || currentView === 'Backlog') && (
        <SprintTable 
          title="Backlog" 
          tasks={sprintData['Backlog']} 
          isExpanded={sprintVisibility['Backlog']}
          toggleExpand={() => toggleSprintVisibility('Backlog')}
          addTask={startAddingTask}
          sprintName="Backlog"
        />
      )}

      {/* Add task form overlay - this appears when adding a task */}
      {addingToSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Task to {addingToSprint}</h3>
              <button onClick={cancelAddingTask} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input
                    type="text"
                    name="responsible"
                    value={newTask.responsible}
                    onChange={handleTaskInputChange}
                    placeholder="Assign owner"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="role"
                    value={newTask.role}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="Dev">Dev</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                  <input
                    type="number"
                    name="storyPoints"
                    value={newTask.storyPoints || ""}
                    onChange={handleTaskInputChange}
                    placeholder="SP"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  onClick={cancelAddingTask}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={addTaskToSprint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Table Modal */}
{isAddTableModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Create New Task Table</h3>
        <button onClick={closeAddTableModal} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
          <input
            type="text"
            name="name"
            value={newTableInfo.name}
            onChange={handleTableInfoChange}
            placeholder="Enter table name"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={newTableInfo.startDate}
            onChange={handleTableInfoChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
    <input
      type="date"
      name="endDate"
      value={newTableInfo.endDate}
      onChange={handleTableInfoChange}
      className="w-full px-3 py-2 border rounded-md"
    />
  </div>
</div>
        
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={newTableInfo.description}
            onChange={handleTableInfoChange}
            placeholder="Enter table description"
            className="w-full px-3 py-2 border rounded-md"
            rows="3"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button 
            onClick={closeAddTableModal}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={addNewTable}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Render all task tables */}
<div className="mt-8">
  {taskTables.map((table, index) => (
    <TaskTable
      key={table.id}
      name={table.name}
      startDate={table.startDate}
      endDate={table.endDate}
      description={table.description}
      index={index}
      tasks={customTableTasks[table.name] || []}
    />
  ))}
</div>
    </div>
  </div>
);

};

export default Task_dashboard;