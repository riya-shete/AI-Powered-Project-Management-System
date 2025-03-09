import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';


const IssuesPage = () => {
  // Sample data based on the image
  const [issues, setIssues] = useState([
    { id: 1, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
    { id: 2, key: 'Acc-2', summary: 'files invalid', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'feature' },
    { id: 3, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
    { id: 4, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'task' },
    { id: 5, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
  ]);

  // Filtered issues state
  const [filteredIssues, setFilteredIssues] = useState(issues);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('ronin fintech');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Dropdown states
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  
  // Dropdown refs for click outside handling
  const typeDropdownRef = useRef(null);

  // View mode state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detailed'

  // Type options
  const typeOptions = ['bug', 'feature', 'task', 'improvement'];

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search and filter
  useEffect(() => {
    let result = issues;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(issue => 
        issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reporter.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType) {
      result = result.filter(issue => issue.type === selectedType);
    }
    
    setFilteredIssues(result);
  }, [searchQuery, selectedType, issues]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setTypeDropdownOpen(false);
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-center mt-4 space-x-2">
        <button className="p-1 border rounded">
          <ChevronLeft size={16} />
        </button>
        <button className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : ''}`}>1</button>
        <button className={`px-2 py-1 rounded ${currentPage === 2 ? 'bg-gray-200' : ''}`}>2</button>
        <button className={`px-2 py-1 rounded ${currentPage === 3 ? 'bg-gray-200' : ''}`}>3</button>
        <button className={`px-2 py-1 rounded ${currentPage === 4 ? 'bg-gray-200' : ''}`}>4</button>
        <span>...</span>
        <button className={`px-2 py-1 rounded ${currentPage === 8 ? 'bg-gray-200' : ''}`}>8</button>
        <button className={`px-2 py-1 rounded ${currentPage === 9 ? 'bg-gray-200' : ''}`}>9</button>
        <button className={`px-2 py-1 rounded ${currentPage === 10 ? 'bg-gray-200' : ''}`}>10</button>
        <button className="p-1 border rounded">
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
          <h1 className="text-2xl font-bold">Bugs Queue</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1">
              <span>Export issues</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="relative">
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1">
              <span>show all issues</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex border border-gray-300 rounded bg-white">
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setViewMode('list')}
            >
              List view
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'detailed' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed view
            </button>
          </div>
          <button className="p-1 border border-gray-300 rounded bg-white">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex space-x-2 mb-4">
        <div className="bg-pink-200 rounded px-2 py-1 text-sm flex items-center space-x-1">
          <span>AI</span>
        </div>
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search issues"
            className="w-full border border-gray-300 rounded px-3 py-1 pl-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-400" />
        </div>
        <div className="relative">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1">
            <span>Project : {selectedProject}</span>
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="relative" ref={typeDropdownRef}>
          <button 
            className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
          >
            <span>Type{selectedType ? `: ${selectedType}` : ''}</span>
            <ChevronDown size={14} />
          </button>
          {typeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
              <div className="p-2 border-b border-gray-200">
                <div 
                  className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                  onClick={() => handleTypeSelect('')}
                >
                  All Types
                </div>
              </div>
              <div className="p-2">
                {typeOptions.map(type => (
                  <div 
                    key={type} 
                    className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1">
            <span>Status</span>
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="relative">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1">
            <span>Assignee</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white border border-gray-300 rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Key</th>
              <th className="p-3 font-medium">Summary</th>
              <th className="p-3 font-medium">Assignee</th>
              <th className="p-3 font-medium">Reporter</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Resolution</th>
              <th className="p-3 font-medium">Created Date</th>
              <th className="p-3 font-medium">Updated Date</th>
              <th className="p-3 font-medium">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-3">
                  <Lock size={16} className="text-gray-700" />
                </td>
                <td className="p-3 text-sm">{issue.key}</td>
                <td className="p-3 text-sm">{issue.summary}</td>
                <td className="p-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">R</div>
                    <span>{issue.assignee}</span>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">A</div>
                    <span>{issue.reporter}</span>
                  </div>
                </td>
                <td className="p-3 text-sm">{issue.status}</td>
                <td className="p-3 text-sm">{issue.resolution}</td>
                <td className="p-3 text-sm">{issue.createdDate}</td>
                <td className="p-3 text-sm">{issue.updatedDate}</td>
                <td className="p-3 text-sm">{issue.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default IssuesPage;