import React, { useState, useMemo, useEffect} from 'react';
import { ChevronLeft, User, ChevronRight, Lock, Search, ChevronDown, MoreHorizontal,MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import { FileText, Wallet, Bug, CheckSquare, PlusCircle, AlertTriangle } from "lucide-react";
import axios from 'axios';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { useParams } from 'react-router-dom'



const Bugs_queue_section = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <IssuesPage />
      </div>
    </div>
  )
}

const IssuesPage = () => {
  const [issues, setIssues] = useState([{ results: [] }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { projectId } = useParams()

  
  // Fetch bugs from the backend
  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token used for fetching projects:", token);
        console.log("Project ID from URL:", projectId); // Debug log
        setLoading(true);
        const response = await axios.get("http://localhost:8000/api/bugs/", {
          headers: {
            Authorization: `Token ${token}`,
            'X-Project-ID': projectId || '1'
          },
          
        });

        // Log the raw response data
        console.log("Raw API response:", response.data);
        if (response.data.results.length > 0) {
          console.log("First Issue Type:", response.data.results[0]?.type);
        }

        
        // Ensure the response contains JSON data
        if (response.data && response.data.results) {
          const transformedIssues = response.data.results.map((bug) => ({
          id: bug.id,
          key: bug.key || bug.summary, // Use `key` if available; fallback to `summary`
          summary: bug.summary,
          assignee: bug.assignee ? bug.assignee.username : "Unassigned", // Extract username or default to "Unassigned"
          reporter: bug.reporter ? bug.reporter.username : "Unknown", // Extract username or default to "Unknown"
          status: bug.status.charAt(0).toUpperCase() + bug.status.slice(1), // Format status (e.g., "resolved" → "Resolved")
          createdDate: formatDate(bug.created_at), // Format date
          updatedDate: formatDate(bug.updated_at), // Format date
          dueDate: bug.due_date || "N/A", // Handle missing due date
          type: bug.type, // Use `project` as `type`
        }));
        setIssues({ results: transformedIssues });
        } else {
          console.error("Unexpected response format:", response);
          setError("Failed to fetch bugs. Please try again.");
        }
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching bugs:", error);
        console.error("Error details:", error.response ? error.response.data : error.message);
        setError(error.message || "Failed to fetch bugs.");
      }
    };
    fetchBugs();
  }, [projectId]);

    // Helper function to format dates
    function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString(undefined, options); // Format as "2 Mar 2025"
    }
    // writing this useEffect to extract unique assignees from the fetched data
    useEffect(() => {
      if (issues && issues.results) {
        const uniqueAssignees = [...new Set(
          issues.results
            .map(issue => issue.assignee)
            .filter(assignee => assignee && assignee !== "Unassigned")
        )];
        setUniqueAssignees(uniqueAssignees);
      }
    }, [issues]);

    //useState to store unique assignees
    const [uniqueAssignees, setUniqueAssignees] = useState([]);

    //writing this useEffect to extract unique projects and statuses from backend data
    useEffect(() => {
      if (issues && issues.results) {
        // Extract unique projects
        const projects = [...new Set(
          issues.results
            .map(issue => issue.project)
            .filter(project => project)
        )];
        setUniqueProjects(projects);

        // Extract unique statuses
        const statuses = [...new Set(
          issues.results
            .map(issue => issue.status)
            .filter(status => status)
        )];
        setUniqueStatuses(statuses);
      }
    }, [issues]);
    //Two new useState variables for storing unique projects and statuses
    const [uniqueProjects, setUniqueProjects] = useState([]);
    const [uniqueStatuses, setUniqueStatuses] = useState([]);




    //colored buttons funtion 
    const getStatusColor = (status) => {
      switch (status) {
        case 'Not_resolved': return 'bg-orange-100 text-orange-700';
        case 'In_progress': return 'bg-blue-100 text-blue-700';
        case 'Resolved': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
    
// // Pagination state
// const [currentPage, setCurrentPage] = useState(1);
// const [totalPages, setTotalPages] = useState(1);

// useEffect(() => {
//   if (issues.count) {
//     const totalPages = Math.ceil(issues.count / 10); // Assuming 10 items per page
//     setTotalPages(totalPages);
//   }
// }, [issues.count]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")

  //creating dropdowns
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false)
  
  // Column management state
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [newColumnData, setNewColumnData] = useState({ label: "", type: "text" })
  const [isResizing, setIsResizing] = useState(false)
  const [columnBeingModified, setColumnBeingModified] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const issueTypeIcons = {
    bug: <Bug size={16} className="text-red-500" />, // Bug icon
    task: <CheckSquare size={16} className="text-blue-500" />, // Task icon
    feature: <PlusCircle size={16} className="text-green-500" />, // Feature icon
    document: <FileText size={16} className="text-gray-500" />, // Document icon
    wallet: <Wallet size={16} className="text-purple-500" />, // Wallet-related issue
    warning: <AlertTriangle size={16} className="text-yellow-500" />, // General warning
  }

  //react useEffect hook to close dropdowns
  //  this useEffect hook to close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !document.getElementById("project-dropdown")?.contains(event.target) &&
        !document.getElementById("type-dropdown")?.contains(event.target) &&
        !document.getElementById("status-dropdown")?.contains(event.target) &&
        !document.getElementById("assignee-dropdown")?.contains(event.target)
      ) {
        // Close all dropdowns when clicking outside
        setProjectDropdownOpen(false)
        setTypeDropdownOpen(false)
        setStatusDropdownOpen(false)
        setAssigneeDropdownOpen(false)
      }
    }

    // Add event listener only if any dropdown is open
    if (projectDropdownOpen || typeDropdownOpen || statusDropdownOpen || assigneeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [projectDropdownOpen, typeDropdownOpen, statusDropdownOpen, assigneeDropdownOpen])
   

  // Add a click handler to close the selected column when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the table headers
      if (selectedColumn && !event.target.closest("th")) {
        setSelectedColumn(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectedColumn])

  // Column resizing
  const handleResizeStart = (e, columnId) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setColumnBeingModified(columnId)
    setStartX(e.clientX)

    const column = columns.find((col) => col.id === columnId)
    setStartWidth(Number.parseInt(column.width))

    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  const handleResizeMove = (e) => {
    if (!isResizing) return

    const diff = e.clientX - startX
    const newWidth = Math.max(50, startWidth + diff)

    setColumns((prev) => prev.map((col) => (col.id === columnBeingModified ? { ...col, width: `${newWidth}px` } : col)))
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    setColumnBeingModified(null)
    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("mouseup", handleResizeEnd)
  }

  // Column reordering
  const handleColumnDragStart = (columnId) => {
    setDraggedColumn(columnId)
  }

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault()
    if (draggedColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleColumnDrop = (e) => {
    e.preventDefault()
    if (draggedColumn && dragOverColumn) {
      const draggedIndex = columns.findIndex((col) => col.id === draggedColumn)
      const dropIndex = columns.findIndex((col) => col.id === dragOverColumn)

      if (draggedIndex !== -1 && dropIndex !== -1) {
        const newColumns = [...columns]
        const [removed] = newColumns.splice(draggedIndex, 1)
        newColumns.splice(dropIndex, 0, removed)

        // Update order property
        const reorderedColumns = newColumns.map((col, index) => ({
          ...col,
          order: index,
        }))

        setColumns(reorderedColumns)
      }
    }

    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  // Column management functions
  const handleAddColumn = () => {
    setEditingColumn(null)
    setNewColumnData({ label: "", type: "text" })
    setShowColumnModal(true)
  }

  const handleEditColumn = (column) => {
    setEditingColumn(column)
    setNewColumnData({
      label: column.label,
      type: column.type,
      visible: column.visible,
    })
    setShowColumnModal(true)
  }

  const handleColumnInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewColumnData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSaveColumn = () => {
    if (editingColumn) {
      // Update existing column
      setColumns((prev) =>
        prev.map((col) =>
          col.id === editingColumn.id
            ? { ...col, label: newColumnData.label, type: newColumnData.type, visible: newColumnData.visible !== false }
            : col,
        ),
      )
    } else {
      // Add new column
      const newId = `custom_${Date.now()}`
      setColumns((prev) => [
        ...prev,
        {
          id: newId,
          label: newColumnData.label,
          type: newColumnData.type,
          visible: true,
          width: "150px",
          order: prev.length,
        },
      ])

      // Add this field to all existing issues
      setIssues((prev) => prev.map((issue) => ({ ...issue, [newId]: "" })))
    }

    setShowColumnModal(false)
  }

  const handleDeleteColumn = (columnId) => {
    // Don't allow deleting essential columns
    if (["type", "key", "summary", "actions"].includes(columnId)) return

    setColumns((prev) => prev.filter((col) => col.id !== columnId))

    // Remove this field from all issues
    setIssues((prev) =>
      prev.map((issue) => {
        const newIssue = { ...issue }
        delete newIssue[columnId]
        return newIssue
      }),
    )
  }

  const handleToggleColumnVisibility = (columnId) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)))
  }

  // Filter states
  const filteredIssues = useMemo(() => {
    const results = Array.isArray(issues.results) ? issues.results : []; 
    return results.filter((issue) => {
      // Ensure no mutation
      // Search filter (key and summary)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const keyMatch = issue.key.toLowerCase().includes(query)
        const summaryMatch = issue.summary.toLowerCase().includes(query)
        if (!keyMatch && !summaryMatch) return false;
      }

      // Other filters (project, type, status, assignee)
      if (selectedProject && issue.project && issue.project !== selectedProject) return false
      if (selectedType && issue.type !== selectedType) return false
      if (selectedStatus && issue.status !== selectedStatus) return false
      if (selectedAssignee && issue.assignee !== selectedAssignee) return false

      return true;
    });
  }, [issues, searchQuery, selectedProject, selectedType, selectedStatus, selectedAssignee])

  // View mode state
  const [viewMode, setViewMode] = useState("list") // 'list' or 'detailed'

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    console.log("View Mode Changed:", mode) // Debugging output
  }

       // Modal state declarations
    const [isModalOpen, setIsModalOpen] = useState(false);
const [currentUser, setCurrentUser] = useState({
  id: null,
  username: '',
  email: ''
});
const [newIssue, setNewIssue] = useState({
  summary: '',
  assignee: '', // This should be user ID, not username
  reporter: '', // This should be user ID, not username  
  status: 'to_do', // Using underscore format as shown in your fetch
  type: 'bug',
  project: '1', // Project ID
  priority: 'medium',
  due_date: '', // Using underscore format
  key: '' // If your backend expects this field
});

  // Fetch current user data from localStorage or API
useEffect(() => {
  const fetchCurrentUser = () => {
    // Get user data from localStorage (stored during login)
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username"); 
    const userEmail = localStorage.getItem("user-email");
    
    if (userId && username) {
      setCurrentUser({
        id: parseInt(userId),
        username: username,
        email: userEmail || ''
      });
      
      console.log("Current user loaded:", { id: userId, username, email: userEmail });
    } else {
      console.error("User data not found in localStorage");
    }
  };
  
  fetchCurrentUser();
}, []);

// Function to open modal and set default values
const openCreateIssueModal = () => {
  // Set the logged-in user as both assignee and reporter by default
  setNewIssue({
    summary: '',
    assignee: currentUser.id || '', // Set current user as assignee
    reporter: currentUser.id || '', // Set current user as reporter
    status: 'to_do',
    type: 'bug',
    project: '1',
    priority: 'medium',
    due_date: '',
    key: ''
  });
  setIsModalOpen(true);
};

// POST API to add new issue
const handleAddIssue = async (e) => {
  e.preventDefault();

  // Validate required fields
  if (!newIssue.summary || !newIssue.project) {
    alert("Please fill in all required fields (Summary and Project)");
    return;
  }

  // Log the data being sent to the backend
  console.log("New Issue Data Being Sent to Backend:", newIssue);

  // Retrieve the token from localStorage
  const token = localStorage.getItem("token");
  
  if (!token) {
    alert("Authentication token not found. Please log in again.");
    return;
  }

  try {
    // Prepare the payload - match your backend expected format
    const payload = {
      summary: newIssue.summary,
      type: newIssue.type,
      status: newIssue.status,
      priority: newIssue.priority,
      due_date: newIssue.due_date || null,
      assignee: parseInt(newIssue.assignee) || currentUser.id, // Use current user if not specified
      reporter: parseInt(newIssue.reporter) || currentUser.id, // Use current user if not specified
    };

    // Add key if provided
    if (newIssue.key) {
      payload.key = newIssue.key;
    }

    console.log("Final payload being sent:", payload);

    // Send the POST request - use the URL you provided
    const response = await axios.post(
      "http://127.0.0.1:8000/admin/api/bug/add/",
      payload,
      {
        headers: {
          Authorization: `Token ${token}`, // Use Token format as shown in your fetch
          "Content-Type": "application/json",
          "X-Project-ID": newIssue.project // Use the selected project ID
        }
      }
    );

    // Log the response from the backend
    console.log("Bug created successfully:", response.data);

    // Transform the response to match your local state format
    const transformedBug = {
      id: response.data.id,
      key: response.data.key || response.data.summary,
      summary: response.data.summary,
      assignee: response.data.assignee ? response.data.assignee.username : "Unassigned",
      reporter: response.data.reporter ? response.data.reporter.username : "Unknown",
      status: response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1),
      createdDate: formatDate(response.data.created_at),
      updatedDate: formatDate(response.data.updated_at),
      dueDate: response.data.due_date || "N/A",
      type: response.data.type,
    };

    // Add the new bug to the local state
    if (issues && issues.results) {
      setIssues({
        ...issues,
        results: [...issues.results, transformedBug]
      });
    } else {
      setIssues({ results: [transformedBug] });
    }

    // Reset the form and close the modal
    setNewIssue({
      summary: '',
      assignee: currentUser.id || '',
      reporter: currentUser.id || '',
      status: 'to_do',
      type: 'bug',
      project: '',
      priority: 'medium',
      due_date: '',
      key: ''
    });
    
    setIsModalOpen(false);
    alert("Issue created successfully!");

  } catch (error) {
    // Log and display any errors
    console.error("Error creating issue:", error);
    console.error("Error details:", error.response ? error.response.data : error.message);
    
    // More specific error handling
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 401) {
        alert("Authentication failed. Please log in again.");
      } else if (statusCode === 400) {
        alert(`Validation error: ${JSON.stringify(errorData)}`);
      } else if (statusCode === 403) {
        alert("Permission denied. You don't have access to create issues.");
      } else {
        alert(`Server error (${statusCode}): ${errorData.detail || 'Failed to create issue'}`);
      }
    } else if (error.request) {
      // Network error
      alert("Network error. Please check your connection and try again.");
    } else {
      // Other error
      alert("Failed to create issue. Please try again.");
    }
  }
};
 
  // Show fallback UI when loading
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">Loading issues...</p>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
    return (
      <div className="flex-1 overflow-auto w-full h-full">
        <div className="p-4 bg-white">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <div>
              <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
              <h1 className="text-2xl text-gray-700 font-bold">Bugs Queue</h1>
            </div>

          <div className="flex items-center space-x-2 ">
            <div className="flex border border-gray-300 rounded bg-white">
              <button
                className={`px-3 py-1 text-sm ${viewMode === "list" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => handleViewModeChange("list")}
              >
                List view
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewMode === "detailed" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => handleViewModeChange("detailed")}
              >
                Detailed view
              </button>
            </div>
          </div>
        </header>

        {/* Main Table Section */}
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="font-medium ">Main Table</div>
            <div className="relative">
              <button className="ml-2" onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}>
                <MoreVertical size={16} />
              </button>

              {isColumnMenuOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleAddColumn}
                  >
                    <Plus size={14} className="mr-2" />
                    Add Column
                  </div>
                  <div className="px-3 py-2 border-t">Column Visibility</div>
                  {columns.map((column) => (
                    <div key={column.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => handleToggleColumnVisibility(column.id)}
                        className="mr-2"
                      />
                      {column.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="ml-2" onClick={handleAddColumn}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <div>
              <button
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
                onClick={openCreateIssueModal} 
              >
                New Issue <Plus size={14} className="ml-1" />
              </button>
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
            <div className="relative" id="project-dropdown">
              <button
                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              >
                <span>Project{selectedProject ? `: ${selectedProject}` : ""}</span>
                <ChevronDown size={14} />
              </button>
              {projectDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedProject("ronin fintech")
                        setProjectDropdownOpen(false)
                      }}
                    >
                      All Projects
                    </li>
                    {uniqueProjects.map((project, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedProject(project)
                        setProjectDropdownOpen(false)
                      }}
                    >
                      {project}
                    </li>
                  ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Type Dropdown */}
            <div className="relative" id="type-dropdown">
              <button
                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              >
                <span>Type {selectedType ? `: ${selectedType}` : ""}</span>
                <ChevronDown size={14} />
              </button>
              {typeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedType("")
                        setTypeDropdownOpen(false)
                      }}
                    >
                      All Types
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedType("bug")
                        setTypeDropdownOpen(false)
                      }}
                    >
                      Bug
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedType("task")
                        setTypeDropdownOpen(false)
                      }}
                    >
                      Task
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedType("feature")
                        setTypeDropdownOpen(false)
                      }}
                    >
                      Feature
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative" id="status-dropdown">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                <span>
                  Status{" "}
                  {selectedStatus ? (
                    <span
                      className={`ml-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(selectedStatus)}`}
                    >
                      {selectedStatus}
                    </span>
                  ) : (
                    ""
                  )}
                </span>
                <ChevronDown size={14} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStatus("")
                        setStatusDropdownOpen(false)
                      }}
                    >
                      All Statuses
                    </li>
                    {uniqueStatuses.map((status, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStatus(status)
                        setStatusDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </li>
                  ))}
                  </ul>
                </div>
              )}
            </div>
            {/*Assignee Drodown */}
            <div className="relative" id="assignee-dropdown">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm flex items-center space-x-1"
                onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
              >
                <User size={14} />
                <span>Assignee {selectedAssignee ? `: ${selectedAssignee}` : ""}</span>
                <ChevronDown size={14} />
              </button>
              {assigneeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
                  <ul>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee("")
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      All Assignees
                    </li>
                    {uniqueAssignees.map((assignee, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee(assignee)
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      {assignee}
                    </li>
                  ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-pink-500  px-3 py-1.5  text-white rounded flex items-center">
              <span>AI</span>
            </div>
          </div>
        </div>
          
          {/* Issues main Table */}
          <div className="bg-white border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm">
                    <th className="p-3  text-sm font-medium text-gray-600 text-center align-middle">Type</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Key</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Summary</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Assignee</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Reporter</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Created Date</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Updated Date</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Due Date</th>
                    <th className="p-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="border-t border-gray-200 hover:bg-blue-50">
                      
                      <td className="p-2 text-center align-middle">
                        <div className="flex items-center justify-center h-full">
                          {issueTypeIcons[issue.type] || <FileText size={16} className="text-gray-500" />}
                          {/* {issue.type} this displays the type of file in string*/}
                        </div>
                      </td>

                      {/*Key Column*/}
                      <td className="p-3">
                        <span className="text-sm font-semibold text-gray-800 tracking-wide">
                          {issue.key}
                        </span>
                      </td>

                      {/*Summary Column*/}
                      <td className="p-3">
                        <span className="text-sm font-medium text-gray-800 leading-relaxed">
                          {issue.summary}
                        </span>
                        
                      </td>

                      {/*Assignee Column*/}
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                            {/*w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"--for gradiaent colored avatar*/}
                            {issue.assignee ? issue.assignee.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className='text-sm font-medium text-gray-700'>
                            {issue.assignee || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/*Reporter Column*/}
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                        {/* Avatar */}
                        {/*w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"--for gradiaent colored avatar*/}
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                            {issue.reporter && issue.reporter !== 'Unknown' ? issue.reporter.charAt(0).toUpperCase() : 'U'}
                          </div>
                          {/* Full Username */}
                          <span className="text-sm font-medium text-gray-700">
                            {issue.reporter || 'Unknown'}
                          </span>
                        </div>
                      </td>

                      {/*Status Column*/}
                      <td className="p-3 text-sm">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      
                      {/* Date Columns - Consistent styling */}
                      <td className="p-3">
                        <span className="text-sm text-gray-600 font-medium">
                          {issue.createdDate || 'N/A'}
                        </span>
                      </td>
                      
                      <td className="p-3">
                        <span className="text-sm text-gray-600 font-medium">
                          {issue.updatedDate || 'N/A'}
                        </span>
                      </td>
                      
                      <td className="p-3">
                        <span className={`text-sm font-medium ${issue.dueDate !== 'N/A' ? 'text-orange-600' : 'text-gray-400'}`}>
                          {issue.dueDate || 'N/A'}
                        </span>
                      </td>
                      {/* Actions Column */}
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200"
                            onClick={() => {
                              // You could implement edit functionality here
                              alert(`Edit issue ${issue.id}`);
                            }}
                          >
                            <Edit2 size={16} />  
                          </button>
                          
                          <button 
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                            onClick={() => {
                              // Filter out the deleted issue
                              setIssues(issues.filter(item => item.id !== issue.id));
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  
         

        {/* Issue Creation Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Issue</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
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
                    onChange={(e) => setNewIssue({ ...newIssue, key: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Issue Type</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.type}
                    onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                  >
                    <option value="bug">Bug</option>
                    <option value="task">Task</option>
                    <option value="feature">Feature</option>
                    <option value="document">Document</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Summary *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.summary}
                    onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })}
                    required
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assignee</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded p-2 text-sm bg-gray-50"
                      value={currentUser.username}
                      readOnly
                    />
                    <span className="text-xs text-gray-500">(You)</span>
                  </div>
                  <input type="hidden" value={newIssue.assignee} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reporter</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded p-2 text-sm bg-gray-50"
                      value={currentUser.username}
                      readOnly
                    />
                    <span className="text-xs text-gray-500">(You)</span>
                  </div>
                  <input type="hidden" value={newIssue.reporter} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.status}
                    onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
                    required
                  >
                    <option value="to_do">To DO</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="not_resolved">Not Resolved</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.due_date}
                    onChange={(e) => setNewIssue({ ...newIssue, due_date: e.target.value })}
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Column Management Modal */}
        {showColumnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-3">{editingColumn ? "Edit Column" : "Add New Column"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Column Name</label>
                  <input
                    type="text"
                    name="label"
                    value={newColumnData.label}
                    onChange={handleColumnInputChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Column name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Column Type</label>
                  <select
                    name="type"
                    value={newColumnData.type}
                    onChange={handleColumnInputChange}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="user">User</option>
                    <option value="status">Status</option>
                    <option value="icon">Icon</option>
                  </select>
                </div>
                {editingColumn && (
                  <div className="flex items-center">
                    <label className="text-sm font-medium mr-2">Visible</label>
                    <input
                      type="checkbox"
                      name="visible"
                      checked={newColumnData.visible !== false}
                      onChange={handleColumnInputChange}
                      className="rounded"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                {editingColumn && !["type", "key", "summary", "actions"].includes(editingColumn.id) && (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      handleDeleteColumn(editingColumn.id)
                      setShowColumnModal(false)
                    }}
                  >
                    Delete Column
                  </button>
                )}
                <div
                  className={
                    editingColumn && !["type", "key", "summary", "actions"].includes(editingColumn.id) ? "" : "ml-auto"
                  }
                >
                  <button
                    className="px-4 py-2 border rounded hover:bg-gray-100 mr-2"
                    onClick={() => setShowColumnModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleSaveColumn}
                    disabled={!newColumnData.label}
                  >
                    {editingColumn ? "Save Changes" : "Add Column"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bugs_queue_section
