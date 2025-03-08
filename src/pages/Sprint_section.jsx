import React, { useState } from 'react';
import { Search, User, Filter, ArrowDownUp, EyeOff, MoreVertical, Plus } from 'lucide-react';

const SprintsPage = () => {
  const [tasks, setTasks] = useState([
    { id: '13455134', name: 'Feature 1', responsible: 'Vivek S.', role: 'Dev', status: 'In Progress', priority: 'High', added: '29 Dec 2024' },
    { id: '12451545', name: 'Feature 2', responsible: 'Shriraj P.', role: 'Design', status: 'Waiting for review', priority: 'Low', added: '24 Dec 2024' },
    { id: '3246151', name: 'Feature 3', responsible: 'Anand S.', role: 'Product', status: 'Stuck', priority: 'Medium', added: '12 Dec 2024' },
    { id: '64135315', name: 'Feature 4', responsible: 'Riya S.', role: 'Dev', status: 'Done', priority: 'Low', added: '21 Oct 2024' },
    { id: '1464135', name: 'Feature 5', responsible: 'Kalyani B.', role: 'Product', status: 'Ready to start', priority: 'Low', added: '21 Oct 2024' },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-gray-100 text-gray-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-white max-w-full h-screen">
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

      <div className="flex mb-4 space-x-2">
        <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded flex items-center">
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
      
      <div className="fixed bottom-4 right-4">
        <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
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
