import React from 'react';
import { Search, ChevronDown, List, LayoutGrid, Square } from 'lucide-react';

const PMSDashboardSprints = () => {
  const sprintData = {
    'Sprint 1': [
      { id: '13455134', name: 'Feature 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024' },
      { id: '12451545', name: 'Feature 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024' },
    ],
    'Sprint 2': [
      { id: '3246151', name: 'Feature 3', responsible: 'Anand S.', role: 'Product', status: 'Stuck', priority: 'Medium', added: '12 Dec 2024' },
    ],
    'Backlog': [
      { id: '64135315', name: 'Feature 4', responsible: 'Riya S.', role: 'Dev', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024' },
    ]
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-gray-100 text-gray-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSprintColor = (sprintName) => {
    if (sprintName.includes('Sprint')) {
      return 'text-pink-500';
    }
    return 'text-blue-500';
  };

  return (
    <div className="p-6 bg-white max-w-full h-screen">
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

      {/* Sprints Sections */}
      <div className="space-y-6">
        {Object.entries(sprintData).map(([sprintName, tasks]) => (
          <div key={sprintName} className="sprint-section">
            <div className={`flex items-center mb-2 ${getSprintColor(sprintName)} font-medium`}>
              {sprintName} <ChevronDown size={16} className="ml-1" />
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PMSDashboardSprints;
