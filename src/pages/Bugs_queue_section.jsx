import React, { useState, useMemo, useEffect} from 'react';
import { ChevronLeft, ChevronRight, Lock, Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';



const Bugs_queue_section = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <IssuesPage/>
        </div>
      </div>
    );
  };

  const IssuesPage = () => {
    // Sample data based on the image
    const [issues, setIssues] = useState([
      { id: 1, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
      { id: 2, key: 'Acc-2', summary: 'files invalid', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
      { id: 3, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
      { id: 4, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
      { id: 5, key: 'Key', summary: 'Wallet not responding', assignee: 'Ronin', reporter: 'Anand', status: 'To DO', resolution: 'Not Resolved', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
    ]);
    // Modal state declarations
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newIssue, setNewIssue] = useState({
      key: '',
      summary: '',
      assignee: '',
      reporter: '',
      status: 'To DO',
      resolution: 'Not Resolved',
      type: 'bug',
      dueDate: ''
    });

  
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
  
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState('ronin fintech');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');

    //creating dropdowns
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);

    // Filter states
    const filteredIssues = useMemo(() => {
      return issues.filter(issue => {
        // Search filter (key and summary)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const keyMatch = issue.key.toLowerCase().includes(query);
          const summaryMatch = issue.summary.toLowerCase().includes(query);
          if (!keyMatch && !summaryMatch) return false;
        }
        
        // // Other filters (project, type, status, assignee)
        // if (selectedProject && issue.project && issue.project !== selectedProject) return false;
        // if (selectedType && issue.type !== selectedType) return false;
        // if (selectedStatus && issue.status !== selectedStatus) return false;
        // if (selectedAssignee && issue.assignee !== selectedAssignee) return false;
        
        return true;
      });
    }, [issues, searchQuery]); //[issues, searchQuery, selectedProject, selectedType, selectedStatus, selectedAssignee]
    
    // View mode state
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detailed'
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };
  
    const renderPagination = () => {
      return (
        <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-3">
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
          </footer>
      );
    };
    
    // Handle form submission for adding new issue
    const handleAddIssue = (e) => {
      e.preventDefault();
      
      // Create a new issue with current date info
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      const issueToAdd = {
        id: issues.length + 1,
        ...newIssue,
        createdDate: currentDate,
        updatedDate: currentDate
      };
      
      // Add the new issue to the list
      setIssues([...issues, issueToAdd]);
      
      // Reset form and close modal
      setNewIssue({
        key: '',
        summary: '',
        assignee: '',
        reporter: '',
        status: 'To DO',
        resolution: 'Not Resolved',
        type: 'bug',
        dueDate: ''
      });
      setIsModalOpen(false);
    };

    return (
      <div className="flex-1 overflow-auto w-full h-full">
        <div className="p-4 bg-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
              <h1 className="text-2xl font-bold">Bugs Queue</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => setIsModalOpen(true)}
              >
                New Issue
              </button>
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

          {/* dropdowns */}
            <div className="relative">
              <button 
                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              >
                <span>Project : {selectedProject}</span>
                <ChevronDown size={14} />
              </button>
              {projectDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedProject('ronin fintech');
                        setProjectDropdownOpen(false);
                      }}
                    >
                      ronin fintech
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedProject('other project');
                        setProjectDropdownOpen(false);
                      }}
                    >
                      other project
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              >
                <span>Type {selectedType ? `: ${selectedType}` : ''}</span>
                <ChevronDown size={14} />
              </button>
              {typeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                      <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedType(''); setTypeDropdownOpen(false); }}>All Types</li>
                      <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedType('bug'); setTypeDropdownOpen(false); }}>Bug</li>
                      <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedType('task'); setTypeDropdownOpen(false); }}>Task</li>
                      <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedType('feature'); setTypeDropdownOpen(false); }}>Feature</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button 
                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                <span>Status {selectedStatus ? `: ${selectedStatus}` : ''}</span>
                <ChevronDown size={14} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedStatus(''); setStatusDropdownOpen(false); }}>All Statuses</li>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedStatus('To DO'); setStatusDropdownOpen(false); }}>To DO</li>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedStatus('In Progress'); setStatusDropdownOpen(false); }}>In Progress</li>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedStatus('Done'); setStatusDropdownOpen(false); }}>Done</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
              onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
            >
                <span>Assignee {selectedAssignee ? `: ${selectedAssignee}` : ''}</span>
                <ChevronDown size={14} />
              </button>
              {assigneeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedAssignee(''); setAssigneeDropdownOpen(false); }}>All Assignees</li>
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setSelectedAssignee('Ronin'); setAssigneeDropdownOpen(false); }}>Ronin</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
  
          {/* Issues Table */}
          <div className="bg-white border border-gray-300 rounded overflow-hidden">
            <div className="overflow-x-auto">
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
                    <th className="p-3 font-medium">Actions</th>
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
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:underline text-xs"
                            onClick={() => {
                              // You could implement edit functionality here
                              alert(`Edit issue ${issue.id}`);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:underline text-xs"
                            onClick={() => {
                              // Filter out the deleted issue
                              setIssues(issues.filter(item => item.id !== issue.id));
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  
          {/* Pagination */}
          {renderPagination()}

          {/* Issue Creation Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create New Issue</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleAddIssue}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Issue Key</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.key}
                        onChange={(e) => setNewIssue({...newIssue, key: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Issue Type</label>
                      <select 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.type}
                        onChange={(e) => setNewIssue({...newIssue, type: e.target.value})}
                      >
                        <option value="bug">Bug</option>
                        <option value="task">Task</option>
                        <option value="feature">Feature</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Summary</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.summary}
                        onChange={(e) => setNewIssue({...newIssue, summary: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Assignee</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.assignee}
                        onChange={(e) => setNewIssue({...newIssue, assignee: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Reporter</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.reporter}
                        onChange={(e) => setNewIssue({...newIssue, reporter: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.status}
                        onChange={(e) => setNewIssue({...newIssue, status: e.target.value})}
                      >
                        <option value="To DO">To DO</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Due Date</label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={newIssue.dueDate}
                        onChange={(e) => setNewIssue({...newIssue, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button 
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                    >
                      Create Issue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

export default Bugs_queue_section;