import React, { useState, useMemo, useEffect} from 'react';
import { ChevronLeft, User, ChevronRight, Lock, Search, ChevronDown, MoreHorizontal,MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import { FileText, Wallet, Bug, CheckSquare, PlusCircle, AlertTriangle } from "lucide-react";
import axios from 'axios';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

// Define your API base URL (replace this with your actual base URL)
const BASE_URL = "http://localhost:8000"; // Replace with your actual backend URL

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

  // const IssuesPage = () => {
  //   // Sample data based on the image
  //   const [issues, setIssues] = useState([
  //     { id: 1, key: 'wal12', summary: 'Wallet not responding', assignee: 'rachna', reporter: 'Anand', status: 'In Progress', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'wallet' },
  //     { id: 2, key: 'Acc-2', summary: 'files invalid', assignee: 'puspak', reporter: 'vivek', status: 'To DO', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'warning' },
  //     { id: 3, key: 'task', summary: 'new task list', assignee: 'diya', reporter: 'ranalk', status: 'Done', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'task' },
  //     { id: 4, key: 'file', summary: 'recheck the invoice', assignee: 'liya', reporter: 'thor', status: 'To DO', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'document' },
  //     { id: 5, key: 'feat', summary: 'need to update this feature ', assignee: 'liya', reporter: 'thor', status: 'Done', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'feature' },
  //     { id: 6, key: 'bugg', summary: 'Wallet not responding', assignee: 'kiya', reporter: 'loki', status: 'To DO', createdDate: '2 Mar 2025', updatedDate: '4 Mar 2025', dueDate: '10 Mar 2025', type: 'bug' },
  //   ]);
const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // Fetch bugs from the backend
  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token used for fetching projects:", token);
        setLoading(true);
        
        // Log the request details
        console.log("Making API request to:", `${BASE_URL}/api/bugs/`);
        console.log("Headers for Bugs Request:", {
          Authorization: `Bearer ${token}`,
          
        });
 
    
        const response = await axios.get("{{base_url}}/api/bugs/", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          
        });


// Log the raw response data
        console.log("Raw API response:", response.data);
        
        // Ensure the response contains JSON data
        if (response.data) {
          console.log("Bugs data received:", response.data);
          setIssues(response.data);
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
  }, []);

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


    //Adding a state variable to store the list of projects.
    const [projects, setProjects] = useState([]);
    //useEffect to fetch projects List when the component mounts
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("{{base_url}}/api/projects/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "project": 1
            }
          });

          console.log("Projects data received:", response.data);
          setProjects(response.data);
        } catch (error) {
          console.error("Error fetching projects:", error);
        console.error("Error details:", error.response ? error.response.data : error.message);
        setError("Failed to load projects. Please try again.");
      }
      };
    
      // Fetch projects when the component mounts
      fetchProjects();
    }, []);



    //colored buttons funtion 
    const getStatusColor = (status) => {
      switch (status) {
        case 'To DO': return 'bg-orange-100 text-orange-700';
        case 'In Progress': return 'bg-blue-100 text-blue-700';
        case 'Done': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState("ronin fintech")
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
    return [...issues].filter((issue) => {
      // Ensure no mutation
      // Search filter (key and summary)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const keyMatch = issue.key.toLowerCase().includes(query)
        const summaryMatch = issue.summary.toLowerCase().includes(query)
        if (!keyMatch && !summaryMatch) return false
      }

      // Other filters (project, type, status, assignee)
      if (selectedProject && issue.project && issue.project !== selectedProject) return false
      if (selectedType && issue.type !== selectedType) return false
      if (selectedStatus && issue.status !== selectedStatus) return false
      if (selectedAssignee && issue.assignee !== selectedAssignee) return false

      return true
    })
  }, [issues, searchQuery, selectedProject, selectedType, selectedStatus, selectedAssignee])

  // View mode state
  const [viewMode, setViewMode] = useState("list") // 'list' or 'detailed'

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    console.log("View Mode Changed:", mode) // Debugging output
  }

   
    //POST API to add new issue button
    const handleAddIssue = async (e) => {
      e.preventDefault();
    
      // Log the data being sent to the backend
      console.log("New Issue Data Being Sent to Backend:", newIssue);
    
      
      // Retrieve the token from localStorage
      const token = localStorage.getItem("token");
    
      try {
        // Send the POST request with the Authorization header
        const response = await axios.post(
        `${BASE_URL}/api/bugs/`,
        newIssue,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Project-ID": newIssue.project // Use the selected project ID
          }
        }
      );
    
        // Log the response from the backend
        console.log("Bug created successfully:", response.data);
    
        // Add the new bug to the local state
        setIssues([...issues, response.data]);
    
        // Reset the form and close the modal
        setNewIssue({
          key: "",
          summary: "",
          assignee: "",
          reporter: "",
          status: "To DO",
          project: "",
          priority: "medium",
          dueDate: ""
        });
        setIsModalOpen(false);
      } catch (error) {
        // Log and display any errors
        console.error("Error creating issue:", error);
      console.error("Error details:", error.response ? error.response.data : error.message);
      alert("Failed to create issue. Please try again.");
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
                onClick={() => setIsModalOpen(true)}
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
                <span>Project : {selectedProject}</span>
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
                      ronin fintech
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedProject("other project")
                        setProjectDropdownOpen(false)
                      }}
                    >
                      other project
                    </li>
                  </ul>
                </div>
              )}
            </div>

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
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStatus("To DO")
                        setStatusDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                          To DO
                        </span>
                      </div>
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStatus("In Progress")
                        setStatusDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                          In Progress
                        </span>
                      </div>
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStatus("Done")
                        setStatusDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          Done
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
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
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee("Ronin")
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      Ronin
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee("puspak")
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      puspak
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee("diya")
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      diya
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedAssignee("rachna")
                        setAssigneeDropdownOpen(false)
                      }}
                    >
                      rachna
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-pink-500  px-3 py-1.5  text-white rounded flex items-center">
              <span>AI</span>
            </div>
          </div>
        </div>
          
          {/* Issues Table */}
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
                      <td className="p-3 text-sm">{issue.key}</td>

                      {/*Summary Column*/}
                      <td className="p-3 text-sm">{issue.summary}</td>

                      {/*Assignee Column*/}
                      <td className="p-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">{issue.assignee ? issue.assignee.charAt(0).toUpperCase() : 'U'}</div>
                          <span>{issue.assignee || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/*Reporter Column*/}
                      <td className="p-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                          {issue.reporter}</div>
                          <span>{issue.reporter || 'Unknown'}</span>
                        </div>
                      </td>

                      {/*Status Column*/}
                      <td className="p-3 text-sm">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-normal ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        
                      </td>
                      <td className="p-3 text-sm">{issue.createdDate || 'N/A'}</td>
                      <td className="p-3 text-sm">{issue.updatedDate || 'N/A'}</td>
                      <td className="p-3 text-sm">{issue.dueDate || 'N/A'}</td>
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:underline text-xs"
                            onClick={() => {
                              // You could implement edit functionality here
                              alert(`Edit issue ${issue.id}`);
                            }}
                          >
                            <Edit2 size={16} />
                            
                          </button>
                          <button 
                            className="text-red-600 hover:underline text-xs"
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
                      required
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
                    <label className="block text-sm font-medium mb-1">Summary</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={newIssue.summary}
                      onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Assignee</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={newIssue.assignee}
                      onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Reporter</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={newIssue.reporter}
                      onChange={(e) => setNewIssue({ ...newIssue, reporter: e.target.value })}
                      required
                    />
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
                      <option value="Done">Done</option>
                    </select>
                    {/* Display colored status indicator based on selected value */}
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(newIssue.status)}`}
                      >
                        {newIssue.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={newIssue.dueDate}
                      onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={newIssue.project}
                    onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
                    required
                  >
                    {/* Default option */}
                    <option value="">Select Project</option>
                    {/* Map over projects to populate options */}
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">
                        Loading projects...
                      </option>
                    )}
                  </select>
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
