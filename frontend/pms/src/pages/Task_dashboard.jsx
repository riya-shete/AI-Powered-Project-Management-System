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
const initialSprintData = {
  'Sprint 1': [
    { id: '13455134', name: 'Task 1', responsible: 'Vivek S.', role: 'Bug', status: 'In Progress', priority: 'High', added: '29 Dec 2024', storyPoints: 5 },
    { id: '12451545', name: 'Task 2', responsible: 'Shriraj P.', role: 'Test', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024', storyPoints: 3 },
  ],
  'sprint 2': [
    { id: '19793110', name: 'task 1', responsible: 'Anand S.', role: 'Security', status: 'Done', priority: 'Medium', added: '1 Mar 2025', storyPoints: 2 },
  ],
  'Backlog': [
    { id: '64135315', name: 'Task 4', responsible: 'Riya S.', role: 'Bug', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024', storyPoints: 8 },
  ]
};
    const SprintTable = ({ title, tasks, isExpanded, toggleExpand, addTask, sprintName ,index}) => {
      const [isSelected, setIsSelected] = useState(false);
      const getBgColor = () => {
        //if (isSelected) return 'bg-blue-50';
        return 'bg-gray-100 bg-opacity-90';
      };
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'Critical': return 'bg-red-300 text-red-700';
        case 'High': return 'bg-orange-300 text-orange-700';
        case 'Medium': return 'bg-blue-400 text-gray-700';
        case 'Low': return 'bg-green-300 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
    
    return (
      <div 
  className={`mb-8 mx-8 w-auto ${getBgColor()} p-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200/90 transition-all duration-500 ease-in-out ${!isExpanded ? 'bg-gray-100' : ''}  overflow-hidden`}  onMouseLeave={() => setIsSelected(false)}
>
<div className="flex items-center justify-between mb-2 p-2 bg-gray-300 rounded-t">
  <div 
    className="flex items-center cursor-pointer" 
    onClick={toggleExpand}
  >
    <span className="font-medium text-blue-600">{title}</span>
    <ChevronDown size={16} className={`ml-1 transition-transform duration-300 ease-in-out ${isExpanded ? '' : 'transform rotate-180'}`} />  </div>
  <div className="flex items-center">
    <span className="text-xs text-gray-600 mr-3">
      {sprintName === 'Sprint 1' && 'Feb 17 - Mar 2'}
      {sprintName === 'sprint 2' && 'Mar 1 - April15'}
    </span>
    <button 
      onClick={() => addTask(sprintName)}
      className="text-blue-600 flex items-center text-sm hover:text-blue-800"
    >
      <Plus size={16} className="mr-1" />
      Add Task
    </button>
  </div>
</div>
        
<div className={`overflow-hidden transition-all duration-500 ease-in-out transform-origin-top ${isExpanded ? 'max-h-screen opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>  <div className="p-4 transform transition-transform duration-500" style={{transformOrigin: 'top'}}>
    <table className="w-full border-collapse">
    <thead>
  <tr className="bg-zinc-200 bg-opacity-50 text-sm text-gray-600">
    <th className="p-2 border-b text-left w-2/12">
      <input type="checkbox" className="mr-2" />
      Tasks
    </th>
    <th className="p-2 border-b text-left w-2/12">Owner</th>
    <th className="p-2 border-b text-left w-2/12">Status</th>
    <th className="p-2 border-b text-left w-2/12">Priority</th>
    <th className="p-2 border-b text-left w-2/12">Type</th>
    <th className="p-2 border-b text-left w-1/12">Task ID</th>
    <th className="p-2 border-b text-left w-1/12 pr-6">SP</th>
  </tr>
</thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="hover:bg-gray-100 bg-opacity-70 text-sm">
          <td className="p-2 border-b w-3/12">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <div className="truncate max-w-full">{task.name}</div>
            </div>
          </td>
          <td className="p-2 border-b w-1/12 text-blue-600 truncate">{task.responsible}</td>
          <td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
    {task.status}
  </span>
</td>
<td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
    {task.priority}
  </span>
</td>
<td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(task.role)}`}>
    {task.role || "Missing"}
  </span>
</td>
          <td className="p-2 border-b w-1/12 truncate">{task.id}</td>
          <td className="p-2 border-b w-1/12">{task.storyPoints || "-"}</td>
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
     {/* Summary Bar Charts */}
     {tasks.length > 0 && (
  <div className="grid grid-cols-12 gap-16 mt-3">
    <div className="col-span-2 col-start-5">
      <SummaryBarChart 
        data={calculateStatusSummary(tasks)} 
        getColorFunc={getStatusColor} 
        total={tasks.length}
        label="Status"
      />
    </div>
    <div className="col-span-2 col-start-7">
      <SummaryBarChart 
        data={calculatePrioritySummary(tasks)} 
        getColorFunc={getPriorityColor} 
        total={tasks.length}
        label="Priority"
      />
    </div>
    <div className="col-span-2 col-start-9">
      <SummaryBarChart 
        data={calculateTypeSummary(tasks)} 
        getColorFunc={getTypeColor} 
        total={tasks.length}
        label="Type"
      />
    </div>
  </div>
)}
  </div>
</div>
{/* Summary charts when collapsed - ADD HERE */}
{!isExpanded && tasks.length > 0 && (
  <div className="p-2 grid grid-cols-12 gap-16">
    <div className="col-span-2 col-start-5">
      <SummaryBarChart 
        data={calculateStatusSummary(tasks)} 
        getColorFunc={getStatusColor} 
        total={tasks.length}
        label="Status"
      />
    </div>
    <div className="col-span-2 col-start-7">
      <SummaryBarChart 
        data={calculatePrioritySummary(tasks)} 
        getColorFunc={getPriorityColor} 
        total={tasks.length}
        label="Priority"
      />
    </div>
    <div className="col-span-2 col-start-9">
      <SummaryBarChart 
        data={calculateTypeSummary(tasks)} 
        getColorFunc={getTypeColor} 
        total={tasks.length}
        label="Type"
      />
    </div>
  </div>
)}
</div>
    );
  };
  const TaskTable = ({ name, startDate, endDate, description, index, tasks = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isSelected, setIsSelected] = useState(false);
    const getBgColor = () => {
      //if (isSelected) return 'bg-blue-50';
      return 'bg-gray-100 bg-opacity-90';
    };
    
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High': return 'bg-orange-100 text-orange-700';
        case 'Medium': return 'bg-gray-100 text-gray-700';
        case 'Low': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Done': return 'bg-green-500 text-white';
        case 'In Progress': return 'bg-orange-400 text-white';
        case 'Waiting for review': return 'bg-cyan-300 text-gray-800';
        case 'Ready to start': return 'bg-blue-600 text-white';
        case 'Stuck': return 'bg-red-500 text-white';
        default: return 'bg-gray-400 text-white';
      }
    };
  
    const getTypeColor = (type) => {
      switch (type) {
        case 'Bug': return 'bg-red-400 text-white';
        case 'Feature': return 'bg-green-400 text-white';
        case 'Quality': return 'bg-purple-400 text-white';
        case 'Security': return 'bg-yellow-400 text-white';
        case 'Test': return 'bg-blue-400 text-white';
        default: return 'bg-gray-400 text-white';
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
      <div 
  className={`mb-8 mx-8 w-auto ${getBgColor()} p-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200/90 transition-all duration-500 ease-in-out ${!isExpanded ? 'bg-gray-100' : ''}  overflow-hidden`}
  onMouseEnter={() => setIsSelected(true)}
  onMouseLeave={() => setIsSelected(false)}
>
      
<div className="flex items-center justify-between mb-2 p-2 bg-gray-300 rounded-t">
  <div 
    className="flex items-center cursor-pointer" 
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <span className="font-medium text-blue-600">{name}</span>
    <ChevronDown size={16} className={`ml-1 transition-transform duration-300 ease-in-out ${isExpanded ? '' : 'transform rotate-180'}`} />  </div>
  <div className="flex items-center">
    <span className="text-xs text-gray-600 mr-3">{dateRange}</span>
    <button 
      onClick={() => startAddingTask(name)}
      className="text-blue-600 flex items-center text-sm hover:text-blue-800"
    >
      <Plus size={16} className="mr-1" />
      Add Task
    </button>
  </div>
</div>
        
<div className={`overflow-hidden transition-all duration-500 ease-in-out transform-origin-top ${isExpanded ? 'max-h-screen opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>
    <div className="p-4 transform transition-transform duration-500" style={{transformOrigin: 'top'}}>
    <table className="w-full border-collapse">
    <thead>
  <tr className="bg-zinc-200 bg-opacity-50 text-sm text-gray-600">
    <th className="p-2 border-b text-left w-2/12">
      <input type="checkbox" className="mr-2" />
      Tasks
    </th>
    <th className="p-2 border-b text-left w-2/12">Owner</th>
    <th className="p-2 border-b text-left w-2/12">Status</th>
    <th className="p-2 border-b text-left w-2/12">Priority</th>
    <th className="p-2 border-b text-left w-2/12">Type</th>
    <th className="p-2 border-b text-left w-1/12">Task ID</th>
    <th className="p-2 border-b text-left w-1/12 pr-6">SP</th>
  </tr>
</thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="hover:bg-gray-100 bg-opacity-70 text-sm">
          <td className="p-2 border-b w-3/12">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <div className="truncate max-w-full">{task.name}</div>
            </div>
          </td>
          <td className="p-2 border-b w-1/12 text-blue-600 truncate">{task.responsible}</td>
          <td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
    {task.status}
  </span>
</td>
<td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
    {task.priority}
  </span>
</td>
<td className="p-2 border-b w-2/12">
  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(task.role)}`}>
    {task.role || "Missing"}
  </span>
</td>
          <td className="p-2 border-b w-1/12 truncate">{task.id}</td>
          <td className="p-2 border-b w-1/12">{task.storyPoints || "-"}</td>
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
     {/* Summary Bar Charts */}
     {tasks.length > 0 && (
  <div className="grid grid-cols-12 gap-16 mt-3">
    <div className="col-span-2 col-start-5">
      <SummaryBarChart 
        data={calculateStatusSummary(tasks)} 
        getColorFunc={getStatusColor} 
        total={tasks.length}
        label="Status"
      />
    </div>
    <div className="col-span-2 col-start-7">
      <SummaryBarChart 
        data={calculatePrioritySummary(tasks)} 
        getColorFunc={getPriorityColor} 
        total={tasks.length}
        label="Priority"
      />
    </div>
    <div className="col-span-2 col-start-9">
      <SummaryBarChart 
        data={calculateTypeSummary(tasks)} 
        getColorFunc={getTypeColor} 
        total={tasks.length}
        label="Type"
      />
    </div>
  </div>
)}
  </div>
</div>
{/* Summary charts when collapsed - ADD HERE */}
{!isExpanded && tasks.length > 0 && (
  <div className="p-2 grid grid-cols-12 gap-16">
    <div className="col-span-2 col-start-5">
      <SummaryBarChart 
        data={calculateStatusSummary(tasks)} 
        getColorFunc={getStatusColor} 
        total={tasks.length}
        label="Status"
      />
    </div>
    <div className="col-span-2 col-start-7">
      <SummaryBarChart 
        data={calculatePrioritySummary(tasks)} 
        getColorFunc={getPriorityColor} 
        total={tasks.length}
        label="Priority"
      />
    </div>
    <div className="col-span-2 col-start-9">
      <SummaryBarChart 
        data={calculateTypeSummary(tasks)} 
        getColorFunc={getTypeColor} 
        total={tasks.length}
        label="Type"
      />
    </div>
  </div>
)}
</div>
    );
  };


  const [sprintData, setSprintData] = useState(initialSprintData);
  const [taskTables, setTaskTables] = useState([]);
  const [customTableTasks, setCustomTableTasks] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState('All Sprints');
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
  // Function to get all unique owners from all tasks
const getAllOwners = () => {
  const owners = new Set();
  
  // Get owners from sprint data
  Object.values(sprintData).forEach(tasks => {
    tasks.forEach(task => {
      if (task.responsible) owners.add(task.responsible);
    });
  });
  
  // Get owners from custom tables
  Object.values(customTableTasks).forEach(tasks => {
    tasks.forEach(task => {
      if (task.responsible) owners.add(task.responsible);
    });
  });
  
  return Array.from(owners);
};

// Function to get all unique statuses
const getAllStatuses = () => {
  const statuses = new Set();
  
  // Get statuses from sprint data
  Object.values(sprintData).forEach(tasks => {
    tasks.forEach(task => {
      if (task.status) statuses.add(task.status);
    });
  });
  
  // Get statuses from custom tables
  Object.values(customTableTasks).forEach(tasks => {
    tasks.forEach(task => {
      if (task.status) statuses.add(task.status);
    });
  });
  
  return Array.from(statuses);
};

// Function to filter tasks based on search and filters
const filterTasks = (tasks) => {
  return tasks.filter(task => {
    // Search term filter - search across all attributes
    const matchesSearch = searchTerm === '' || 
      (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.id && task.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.responsible && task.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.status && task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.priority && task.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.role && task.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.storyPoints && task.storyPoints.toString().includes(searchTerm));
    
    // Person filter
    const matchesPerson = selectedPerson === '' || 
      task.responsible === selectedPerson;
    
    // Status filter
    const matchesStatus = selectedStatus === '' || 
      task.status === selectedStatus;
    
    return matchesSearch && matchesPerson && matchesStatus;
  });
};

// Function to calculate status summary
const calculateStatusSummary = (tasks) => {
  const summary = {};
  tasks.forEach(task => {
    if (task.status) {
      summary[task.status] = (summary[task.status] || 0) + 1;
    }
  });
  return summary;
};

// Function to calculate priority summary
const calculatePrioritySummary = (tasks) => {
  const summary = {};
  tasks.forEach(task => {
    if (task.priority) {
      summary[task.priority] = (summary[task.priority] || 0) + 1;
    }
  });
  return summary;
};

// Function to calculate type summary
const calculateTypeSummary = (tasks) => {
  const summary = {};
  tasks.forEach(task => {
    const type = task.role || "Missing";
    summary[type] = (summary[type] || 0) + 1;
  });
  return summary;
};

const SummaryBarChart = ({ data, getColorFunc, total, label }) => {
  if (total === 0) return <div className="text-xs text-gray-400 px-2">{label}: No data</div>;
  
  return (
    <div className="px-2 py-1 w-full overflow-hidden">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="flex h-5 rounded-sm overflow-hidden w-full">
        {Object.entries(data).map(([key, value], index) => {
          const percentage = (value / total) * 100;
          return (
            <div 
              key={index} 
              className={`${getColorFunc(key)}`} 
              style={{ width: `${percentage}%` }}
              title={`${key}: ${value} (${Math.round(percentage)}%)`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

// Function to check if a sprint has any matching tasks
const sprintHasMatchingTasks = (sprintName) => {
  const tasks = sprintData[sprintName] || [];
  return filterTasks(tasks).length > 0;
};

// Function to check if a custom table has any matching tasks
const tableHasMatchingTasks = (tableName) => {
  const tasks = customTableTasks[tableName] || [];
  return filterTasks(tasks).length > 0;
};

 // Function to get priority color - bright contrasting colors
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Critical': return 'bg-[#FF3B30] text-white';     // Bright red
    case 'High': return 'bg-[#FF9500] text-white';         // Bright orange
    case 'Medium': return 'bg-indigo-400 text-white';       // Bright blue
    case 'Low': return 'bg-[#34C759] text-white';          // Bright green
    default: return 'bg-[#8E8E93] text-white';             // Gray
  }
};

// Function to get status color - bright contrasting colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Done': return 'bg-[#34C759] text-white';         // Bright green
    case 'In Progress': return 'bg-[#FFA725] text-white';  // Bright orange
    case 'Waiting for review': return 'bg-[#5AC8FA] text-gray-800'; // Light blue
    case 'Ready to start': return 'bg-[#AF52DE] text-white'; // Purple
    case 'Stuck': return 'bg-[#FF3B30] text-white';        // Bright red
    default: return 'bg-[#8E8E93] text-white';             // Gray
  }
};

// Function to get type color - bright contrasting colors
const getTypeColor = (type) => {
  switch (type) {
    case 'Bug': return 'bg-[#FF3B30] text-white';          // Bright red
    case 'Feature': return 'bg-[#007AFF] text-white';      // Bright blue
    case 'Quality': return 'bg-[#5856D6] text-white';      // Indigo
    case 'Security': return 'bg-[#FFCC00] text-gray-800';  // Bright yellow
    case 'Test': return 'bg-[#34C759] text-white';         // Bright green
    default: return 'bg-[#8E8E93] text-white';             // Gray
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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
    </div>
    
    {/* Person dropdown */}
    <div className="relative">
      <button 
        className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
        onClick={() => setIsPersonDropdownOpen(!isPersonDropdownOpen)}
      >
        {selectedPerson || "Person"} <ChevronDown size={16} className="ml-1" />
      </button>
      
      {isPersonDropdownOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white border rounded-md shadow-lg">
          <div 
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedPerson('');
              setIsPersonDropdownOpen(false);
            }}
          >
            All Persons
          </div>
          {getAllOwners().map(owner => (
            <div 
              key={owner}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSelectedPerson(owner);
                setIsPersonDropdownOpen(false);
              }}
            >
              {owner}
            </div>
          ))}
        </div>
      )}
    </div>
  
  {/* Filter (Status) dropdown */}
  <div className="relative">
    <button 
      className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
    >
      {selectedStatus || "Filter"} <ChevronDown size={16} className="ml-1" />
    </button>
    
    {isFilterDropdownOpen && (
      <div className="absolute z-10 mt-1 w-48 bg-white border rounded-md shadow-lg">
        <div 
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setSelectedStatus('');
            setIsFilterDropdownOpen(false);
          }}
        >
          All Statuses
        </div>
        {getAllStatuses().map(status => (
          <div 
            key={status}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedStatus(status);
              setIsFilterDropdownOpen(false);
            }}
          >
            {status}
          </div>
        ))}
      </div>
    )}
  </div>
  
  <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
    Sort <ChevronDown size={16} className="ml-1" />
  </button>
  
  <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
    Hide <ChevronDown size={16} className="ml-1" />
  </button>
  
  {/* Clear filters button - only show when filters are active */}
  {(searchTerm || selectedPerson || selectedStatus) && (
    <button 
      className="px-3 py-1.5 text-sm border rounded bg-red-50 text-red-600 flex items-center"
      onClick={() => {
        setSearchTerm('');
        setSelectedPerson('');
        setSelectedStatus('');
      }}
    >
      Clear Filters <X size={14} className="ml-1" />
    </button>
  )}
</div>  

        
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
  Object.keys(sprintData)
    .filter(sprintName => sprintName !== 'Backlog')
    .filter(sprintName => {
      // Only show sprints with matching tasks when filtering
      if (searchTerm || selectedPerson || selectedStatus) {
        return sprintHasMatchingTasks(sprintName);
      }
      return true;
    })
    .map((sprintName, index) => (
      <SprintTable 
        key={sprintName}
        title={sprintName} 
        tasks={filterTasks(sprintData[sprintName])} 
        isExpanded={sprintVisibility[sprintName] !== false}
        toggleExpand={() => toggleSprintVisibility(sprintName)}
        addTask={startAddingTask}
        sprintName={sprintName}
        index={index}
      />
    ))
)}

{/* Custom Task Tables - render above Backlog */}
{taskTables
  .filter(table => {
    // Only show tables with matching tasks when filtering
    if (searchTerm || selectedPerson || selectedStatus) {
      return tableHasMatchingTasks(table.name);
    }
    return true;
  })
  .map((table, tableIndex) => (
    <TaskTable
      key={table.id}
      name={table.name}
      startDate={table.startDate}
      endDate={table.endDate}
      description={table.description}
      index={tableIndex + Object.keys(sprintData).filter(name => name !== 'Backlog').length}
      tasks={filterTasks(customTableTasks[table.name] || [])}
    />
  ))
}

{/* Backlog Table - Always at the end */}
{(currentView === 'All Sprints' || currentView === 'Backlog') && 
  (!searchTerm && !selectedPerson && !selectedStatus || sprintHasMatchingTasks('Backlog')) && (
  <SprintTable 
    title="Backlog" 
    tasks={filterTasks(sprintData['Backlog'])} 
    isExpanded={sprintVisibility['Backlog'] !== false}
    toggleExpand={() => toggleSprintVisibility('Backlog')}
    addTask={startAddingTask}
    sprintName="Backlog"
    index={Object.keys(sprintData).length + taskTables.length - 1}
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
                    <option value="Quality">Quality</option>
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Security">Security</option>
                    <option value="Test">Test</option>
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
                    <option value="Critical">Critical</option>
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

    </div>
  
);

};

export default Task_dashboard;