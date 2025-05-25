"use client"

import React, { useEffect, useState } from "react"
import { Search, ChevronDown, Plus, X, Settings, Trash2, Edit } from "lucide-react"
import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"
import axios from "axios"

const BASE_URL = "http://localhost:8000";

const Task_dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <PMSDashboardSprints />
      </div>
    </div>
  )
}

const PMSDashboardSprints = () => {
  // Initial sprint data
  const initialSprintData = {
    "Sprint 1": [
      {
        id: "13455134",
        name: "Task 1",
        assigned_to: "Vivek S.",
        role: "Bug",
        status: "In Progress",
        priority: "High",
        added: "29 Dec 2024",
        story_points: 5,
        description: "Fix critical bug in authentication",
        due_date: "2024-12-30",
      },
      {
        id: "12451545",
        name: "Task 2",
        assigned_to: "Shriraj P.",
        role: "Test",
        status: "Waiting for review",
        priority: "Low",
        added: "24 Dec 2024",
        story_points: 3,
        description: "Write unit tests for user module",
        due_date: "2024-12-25",
      },
    ],
    "sprint 2": [
      {
        id: "19793110",
        name: "task 1",
        assigned_to: "Anand S.",
        role: "Security",
        status: "Done",
        priority: "Medium",
        added: "1 Mar 2025",
        story_points: 2,
        description: "Security audit of API endpoints",
        due_date: "2025-03-05",
      },
    ],
    Backlog: [
      {
        id: "64135315",
        name: "Task 4",
        assigned_to: "Riya S.",
        role: "Bug",
        status: "Ready to start",
        priority: "Low",
        added: "21 Oct 2024",
        story_points: 8,
        description: "Fix UI rendering issues",
        due_date: "2024-10-25",
      },
    ],
  }

  // State hooks for component
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [sprintData, setSprintData] = useState(() => {
    const savedData = localStorage.getItem("sprintData")
    return savedData ? JSON.parse(savedData) : initialSprintData
  })
  const [taskTables, setTaskTables] = useState([])
  const [customTableTasks, setCustomTableTasks] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [currentView, setCurrentView] = useState("All Sprints")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false)
  const [newTableInfo, setNewTableInfo] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  })
  const [sprintVisibility, setSprintVisibility] = useState({
    "Sprint 1": true,
    "sprint 2": true,
    Backlog: true,
  })
  const [newSprintName, setNewSprintName] = useState("")
  const [addingToSprint, setAddingToSprint] = useState(null)

  // Updated newTask state with all required fields
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assigned_to: "",
    role: "",
    status: "",
    priority: "Medium",
    story_points: "",
    due_date: "",
    added: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  })

  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem("tableColumns")
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          { id: "checkbox", label: "", type: "checkbox", visible: true, width: "40px", order: 0 },
          { id: "name", label: "Tasks", type: "text", visible: true, width: "2/12", order: 1 },
          { id: "assigned_to", label: "Owner", type: "text", visible: true, width: "2/12", order: 2 },
          { id: "status", label: "Status", type: "status", visible: true, width: "2/12", order: 3 },
          { id: "priority", label: "Priority", type: "priority", visible: true, width: "2/12", order: 4 },
          { id: "role", label: "Type", type: "role", visible: true, width: "2/12", order: 5 },
          { id: "id", label: "Task ID", type: "text", visible: true, width: "1/12", order: 6 },
          { id: "story_points", label: "SP", type: "number", visible: true, width: "1/12", order: 7 },
          { id: "due_date", label: "Due Date", type: "date", visible: true, width: "1/12", order: 8 },
          { id: "actions", label: "Actions", type: "actions", visible: true, width: "1/12", order: 9 },
        ]
  })

  // Add column management modal state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [columnDragIndex, setColumnDragIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem("rowsPerPage")
    return saved ? Number.parseInt(saved) : 10
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem("sortConfig")
    return saved ? JSON.parse(saved) : { key: null, direction: "ascending" }
  })

  // Helper function to get sprint ID from sprint name
  const getSprintId = (sprintName) => {
    const sprintMapping = {
      "Sprint 1": 3, // Use actual IDs from your database
      "sprint 2": 3,
      "Backlog": 3,
      "4": 3
      // Add more sprint mappings as needed
    };

    const sprintId = sprintMapping[sprintName];
  if (!sprintId) {
    console.warn(`No sprint ID mapping found for "${sprintName}", using default: 3`);
    return 3; // Use a valid sprint ID that exists in your database
  }

  return sprintId;
};

  // Helper function to get project ID (you may need to adjust this based on your setup)
  const getProjectId = () => {
    // Try to get project ID from localStorage or context
    const projectId = localStorage.getItem("project_id") || localStorage.getItem("current_project_id")
    if (projectId) {
      return Number.parseInt(projectId)
    }

    // If no project ID is stored, you might need to fetch it or use a default
    console.warn("No project ID found in localStorage, using default project ID: 1")
    return 1
  }

  // Function to generate a random ID
  const generateId = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString()
  }

  // Function to add a new sprint
  const addNewSprint = () => {
    if (newSprintName.trim() === "") return

    setSprintData((prevData) => ({
      ...prevData,
      [newSprintName]: [],
    }))

    // Add to visibility state
    setSprintVisibility((prev) => ({
      ...prev,
      [newSprintName]: true,
    }))

    setNewSprintName("")
  }

  // Function to delete a sprint
  const deleteSprint = (sprintName) => {
    if (window.confirm(`Are you sure you want to delete ${sprintName} and all its tasks?`)) {
      setSprintData((prevData) => {
        const newData = { ...prevData }
        delete newData[sprintName]
        return newData
      })

      // Remove from visibility state
      setSprintVisibility((prev) => {
        const newVisibility = { ...prev }
        delete newVisibility[sprintName]
        return newVisibility
      })
    }
  }

  // Function to start adding a task to a specific sprint
  const startAddingTask = (tableName) => {
    setAddingToSprint(tableName)
  }

  // Function to cancel adding a task
  const cancelAddingTask = () => {
    setAddingToSprint(null)
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      role: "",
      status: "",
      priority: "Medium",
      story_points: "",
      due_date: "",
      added: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    })
  }

  // Add this function before addTaskToSprint
  const validateTaskData = (taskData) => {
    const requiredFields = ["name", "description", "project", "sprint"]
    const missingFields = requiredFields.filter((field) => !taskData[field])

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return false
    }

    // Check if numeric fields are valid
    if (taskData.project && isNaN(taskData.project)) {
      console.error("Project ID must be a number:", taskData.project)
      return false
    }

    if (taskData.sprint && isNaN(taskData.sprint)) {
      console.error("Sprint ID must be a number:", taskData.sprint)
      return false
    }

    return true
  }

  // Updated function to add a new task to a sprint with proper field mapping
  const addTaskToSprint = () => {
    if (!addingToSprint || !newTask.name) {
      console.error("Missing sprint name or task name");
      return;
    }

    // Generate a unique item_id for the task
    const itemId = `T${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
    
    // Use a valid sprint ID from your database
    const sprintId = getSprintId(addingToSprint);
    
    // Make sure these match the backend model fields exactly
    const taskToAdd = {
      name: newTask.name || "Task name",
      description: newTask.description || "Details",
      project: getProjectId(),  // Use a valid project ID
      sprint: sprintId, // Use a valid sprint ID (3 if that exists in your DB)
      assigned_to: Number.parseInt(localStorage.getItem("user_id")) || 1,
      reporter: Number.parseInt(localStorage.getItem("user_id")) || 1,
      status: "backlog", // Must match STATUS_CHOICES in Task model
      priority: "medium", // Must match PRIORITY_CHOICES in Task model
      due_date: newTask.due_date || new Date().toISOString().split("T")[0],
      story_points: Number.parseInt(newTask.story_points) || 0,
      item_id: itemId,
    };
    
    // Validate task data before sending
    if (!validateTaskData(taskToAdd)) {
      setError("Invalid task data. Please check all required fields.")
      return
    }

    // Debug logging
    console.log("=== TASK CREATION DEBUG ===")
    console.log("Sprint name:", addingToSprint)
    console.log("Sprint ID:", getSprintId(addingToSprint))
    console.log("Project ID:", getProjectId())
    console.log("Task data being sent:", taskToAdd)
    console.log("Token:", localStorage.getItem("token"))
    console.log("User ID:", localStorage.getItem("user_id"))

    // Send POST request to create task
    axios
      .post("http://localhost:8000/api/tasks/", taskToAdd, {
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Token ${localStorage.getItem("token")}`,
          }),
        },
      })
      .then((res) => {
        console.log("Task created successfully:", res.data)
        // Update local state with the new task from server response
        setSprintData((prevData) => ({
          ...prevData,
          [addingToSprint]: [...(prevData[addingToSprint] || []), res.data],
        }))

        // Update tasks array
        setTasks((prevTasks) => [...prevTasks, res.data])

        // Clear any previous errors
        setError(null)
      })
      .catch((err) => {
        console.error("=== TASK CREATION ERROR ===")
        console.error("Full error object:", err)
        console.error("Error response:", err.response)
        console.error("Error response data:", err.response?.data)

        // Log each validation error in detail
        if (err.response?.data && typeof err.response.data === "object") {
          console.error("=== DETAILED VALIDATION ERRORS ===")
          Object.entries(err.response.data).forEach(([field, errors]) => {
            console.error(`${field}:`, errors)
          })
        }

        console.error("Error response status:", err.response?.status)
        console.error("Error response headers:", err.response?.headers)
        console.error("Request config:", err.config)

        // Set detailed error message
        let errorMessage = `Failed to create task: ${err.response?.status} ${err.response?.statusText || err.message}`

        if (err.response?.data) {
          if (typeof err.response.data === "object") {
            // Handle validation errors
            const validationErrors = Object.entries(err.response.data)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
              .join("; ")
            errorMessage += ` - ${validationErrors}`
          } else {
            errorMessage += ` - ${err.response.data}`
          }
        }

        setError(errorMessage)
      })

    cancelAddingTask()
  }

  // Function to delete a task from a sprint
  const deleteTask = (sprintName, taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      // Send DELETE request to remove task
      axios
        .delete(`http://localhost:8000/api/tasks/${taskId}/`, {
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
              Authorization: `Token ${localStorage.getItem("token")}`,
            }),
          },
        })
        .then(() => {
          // Update local state after successful deletion
          setSprintData((prevData) => ({
            ...prevData,
            [sprintName]: prevData[sprintName].filter((task) => task.id !== taskId),
          }))

          // Update tasks array
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        })
        .catch((err) => {
          console.error("Failed to delete task:", err)
          setError(`Failed to delete task: ${err.response?.status} ${err.response?.statusText || err.message}`)
        })
    }
  }

  // Updated function to update a task with proper field mapping
  const updateTask = (taskId, updatedData, sprintName) => {
    // Ensure we're sending the correct field names to the backend
    const backendData = {
      ...updatedData,
      project: updatedData.project || getProjectId(),
      sprint: updatedData.sprint || getSprintId(sprintName),
      description: updatedData.description || "No description provided",
      due_date: updatedData.due_date || new Date().toISOString().split("T")[0],
    }

    axios
      .put(`http://localhost:8000/api/tasks/${taskId}/`, backendData, {
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Token ${localStorage.getItem("token")}`,
          }),
        },
      })
      .then((res) => {
        // Update local state with the updated task
        setSprintData((prevData) => ({
          ...prevData,
          [sprintName]: prevData[sprintName].map((task) => (task.id === taskId ? res.data : task)),
        }))

        // Update tasks array
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? res.data : task)))
      })
      .catch((err) => {
        console.error("Failed to update task:", err)
        setError(`Failed to update task: ${err.response?.status} ${err.response?.statusText || err.message}`)
      })
  }

  // Function to handle change in new task form
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to get all unique owners from all tasks
  const getAllOwners = () => {
    const owners = new Set()

    // Get owners from sprint data
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.assigned_to) owners.add(task.assigned_to)
      })
    })

    // Get owners from custom tables
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.assigned_to) owners.add(task.assigned_to)
      })
    })

    return Array.from(owners)
  }

  // Function to get all unique statuses
  const getAllStatuses = () => {
    const statuses = new Set()

    // Get statuses from sprint data
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.status) statuses.add(task.status)
      })
    })

    // Get statuses from custom tables
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.status) statuses.add(task.status)
      })
    })

    return Array.from(statuses)
  }

  // Function to filter tasks based on search and filters
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      // Search term filter - search across all attributes
      const matchesSearch =
        searchTerm === "" ||
        (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.id && task.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.assigned_to && task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.status && task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.priority && task.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.role && task.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.story_points && task.story_points.toString().includes(searchTerm))

      // Person filter
      const matchesPerson = selectedPerson === "" || task.assigned_to === selectedPerson

      // Status filter
      const matchesStatus = selectedStatus === "" || task.status === selectedStatus

      return matchesSearch && matchesPerson && matchesStatus
    })
  }

  // Function to get priority color - bright contrasting colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#FF3B30] text-white" // Bright red
      case "High":
        return "bg-[#FF9500] text-white" // Bright orange
      case "Medium":
        return "bg-indigo-400 text-white" // Bright blue
      case "Low":
        return "bg-[#34C759] text-white" // Bright green
      default:
        return "bg-[#8E8E93] text-white" // Gray
    }
  }

  // Function to get status color - bright contrasting colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-[#34C759] text-white" // Bright green
      case "In Progress":
        return "bg-[#FFA725] text-white" // Bright orange
      case "Waiting for review":
        return "bg-[#5AC8FA] text-gray-800" // Light blue
      case "Ready to start":
        return "bg-[#AF52DE] text-white" // Purple
      case "Stuck":
        return "bg-[#FF3B30] text-white" // Bright red
      default:
        return "bg-[#8E8E93] text-white" // Gray
    }
  }

  // Function to get type color - bright contrasting colors
  const getTypeColor = (type) => {
    switch (type) {
      case "Bug":
        return "bg-[#FF3B30] text-white" // Bright red
      case "Feature":
        return "bg-[#007AFF] text-white" // Bright blue
      case "Quality":
        return "bg-[#5856D6] text-white" // Indigo
      case "Security":
        return "bg-[#FFCC00] text-gray-800" // Bright yellow
      case "Test":
        return "bg-[#34C759] text-white" // Bright green
      default:
        return "bg-[#8E8E93] text-white" // Gray
    }
  }

  const openAddTableModal = () => {
    setIsAddTableModalOpen(true)
  }

  const closeAddTableModal = () => {
    setIsAddTableModalOpen(false)
    setNewTableInfo({
      name: "",
      date: "",
      description: "",
    })
  }

  const handleTableInfoChange = (e) => {
    const { name, value } = e.target
    setNewTableInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addNewTable = () => {
    if (!newTableInfo.name) return

    setTaskTables((prev) => [...prev, { ...newTableInfo, id: generateId() }])
    closeAddTableModal()
  }

  // Function to check if a sprint has any matching tasks
  const sprintHasMatchingTasks = (sprintName) => {
    const tasks = sprintData[sprintName] || []
    return filterTasks(tasks).length > 0
  }

  // Function to check if a custom table has any matching tasks
  const tableHasMatchingTasks = (tableName) => {
    const tasks = customTableTasks[tableName] || []
    return filterTasks(tasks).length > 0
  }

  const toggleSprintVisibility = (sprintName) => {
    setSprintVisibility((prev) => ({
      ...prev,
      [sprintName]: !prev[sprintName],
    }))
  }

  // Fetch sprints from backend API
  useEffect(() => {
    setLoading(true);
    
    // First fetch sprints to populate the dropdown
    axios.get(`${BASE_URL}/api/sprints/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      }
    })
    .then(res => {
      const sprintList = res.data.results || res.data;
      setSprints(sprintList);
      console.log("Available sprints:", sprintList);
      
      // Then fetch tasks
      return axios.get(`${BASE_URL}/api/tasks/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
    })
    .then((res) => {
      const taskArray = Array.isArray(res.data) ? res.data : res.data.results;
      if (!Array.isArray(taskArray)) {
        throw new Error("API did not return an array of tasks");
      }
      
      const newSprintData = { ...sprintData };
      taskArray.forEach((task) => {
        const sprintName = task.sprint || "Backlog";
        if (!newSprintData[sprintName]) {
          newSprintData[sprintName] = [];
          setSprintVisibility((prev) => ({
            ...prev,
            [sprintName]: true,
          }));
        }
        newSprintData[sprintName].push(task);
      });
      
      setSprintData(newSprintData);
      setTasks(taskArray);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch data:", err);
      setError(`Failed to fetch data: ${err.response?.status} ${err.response?.statusText || err.message}`);
      setLoading(false);
    });
  }, []);

  // Add this function to the PMSDashboardSprints component to persist data
  useEffect(() => {
    // Save sprint data to localStorage whenever it changes
    localStorage.setItem("sprintData", JSON.stringify(sprintData))
  }, [sprintData])

  // Add useEffect to save column configuration
  useEffect(() => {
    localStorage.setItem("tableColumns", JSON.stringify(columns))
  }, [columns])

  useEffect(() => {
    localStorage.setItem("rowsPerPage", rowsPerPage.toString())
  }, [rowsPerPage])

  useEffect(() => {
    localStorage.setItem("sortConfig", JSON.stringify(sortConfig))
  }, [sortConfig])

  // Add column management functions
  const toggleColumnVisibility = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)),
    )
  }

  const updateColumnWidth = (columnId, newWidth) => {
    setColumns((prevColumns) => prevColumns.map((col) => (col.id === columnId ? { ...col, width: newWidth } : col)))
  }

  const updateColumnOrder = (fromIndex, toIndex) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns]
      const [movedColumn] = newColumns.splice(fromIndex, 1)
      newColumns.splice(toIndex, 0, movedColumn)

      // Update order property
      return newColumns.map((col, idx) => ({
        ...col,
        order: idx,
      }))
    })
  }

  const startColumnDrag = (index) => {
    setColumnDragIndex(index)
  }

  const handleColumnDragOver = (index) => {
    if (columnDragIndex !== null && columnDragIndex !== index) {
      setDropTargetIndex(index)
    }
  }

  const handleColumnDrop = () => {
    if (columnDragIndex !== null && dropTargetIndex !== null) {
      updateColumnOrder(columnDragIndex, dropTargetIndex)
      setColumnDragIndex(null)
      setDropTargetIndex(null)
    }
  }

  const openColumnModal = (column = null) => {
    setEditingColumn(column)
    setIsColumnModalOpen(true)
  }

  const closeColumnModal = () => {
    setIsColumnModalOpen(false)
    setEditingColumn(null)
  }

  const saveColumnChanges = (updatedColumn) => {
    if (editingColumn) {
      // Edit existing column
      setColumns((prevColumns) =>
        prevColumns.map((col) => (col.id === editingColumn.id ? { ...col, ...updatedColumn } : col)),
      )
    } else {
      // Add new column
      setColumns((prevColumns) => [
        ...prevColumns,
        {
          ...updatedColumn,
          id: `custom_${Date.now()}`,
          order: prevColumns.length,
        },
      ])
    }
    closeColumnModal()
  }

  const deleteColumn = (columnId) => {
    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId))
  }

  // Add sorting function
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedItems = (items) => {
    if (!sortConfig.key) return items

    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Add pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const getPaginatedItems = (items) => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return items.slice(startIndex, startIndex + rowsPerPage)
  }

  // Enhanced SprintTable component with editable cells, rows and columns
  const SprintTable = ({ title, tasks, isExpanded, toggleExpand, addTask, sprintName, index }) => {
    const [isSelected, setIsSelected] = useState(false)
    const [columnWidths, setColumnWidths] = useState(() => {
      const saved = localStorage.getItem(`columnWidths-${sprintName}`)
      return saved
        ? JSON.parse(saved)
        : {
            name: "20%",
            assigned_to: "15%",
            status: "15%",
            priority: "10%",
            role: "10%",
            id: "8%",
            story_points: "7%",
            due_date: "10%",
            actions: "5%",
          }
    })
    const [visibleColumns, setVisibleColumns] = useState(() => {
      const saved = localStorage.getItem(`visibleColumns-${sprintName}`)
      return saved
        ? JSON.parse(saved)
        : {
            name: true,
            assigned_to: true,
            status: true,
            priority: true,
            role: true,
            id: true,
            story_points: true,
            due_date: true,
            actions: true,
          }
    })
    const [sortConfig, setSortConfig] = useState(() => {
      const saved = localStorage.getItem(`sortConfig-${sprintName}`)
      return saved ? JSON.parse(saved) : { key: null, direction: "asc" }
    })
    const [editingCell, setEditingCell] = useState(null)
    const [editValue, setEditValue] = useState("")
    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
    const [selectedColumnId, setSelectedColumnId] = useState(null)
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
    const [newColumnInfo, setNewColumnInfo] = useState({
      id: "",
      label: "",
      type: "text",
      visible: true,
      width: "15%",
    })

    const getBgColor = () => {
      return "bg-gray-100 bg-opacity-90"
    }

    // Save column settings to localStorage
    useEffect(() => {
      localStorage.setItem(`columnWidths-${sprintName}`, JSON.stringify(columnWidths))
    }, [columnWidths, sprintName])

    useEffect(() => {
      localStorage.setItem(`visibleColumns-${sprintName}`, JSON.stringify(visibleColumns))
    }, [visibleColumns, sprintName])

    useEffect(() => {
      localStorage.setItem(`sortConfig-${sprintName}`, JSON.stringify(sortConfig))
    }, [sortConfig, sprintName])

    // Sort tasks based on current sort configuration
    const sortedTasks = React.useMemo(() => {
      if (!sortConfig.key) return tasks

      return [...tasks].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }, [tasks, sortConfig])

    // Handle column sorting
    const requestSort = (key) => {
      let direction = "asc"
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc"
      }
      setSortConfig({ key, direction })
    }

    // Handle column visibility toggle
    const toggleColumnVisibility = (columnId) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [columnId]: !prev[columnId],
      }))
    }

    // Handle column resize
    const startColumnResize = (e, columnId) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startWidth = Number.parseFloat(columnWidths[columnId].replace("%", ""))

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX
        // Calculate new width as percentage of table width
        const tableWidth = document.querySelector("table")?.offsetWidth || 1000
        const newWidthPercent = Math.max(5, startWidth + (deltaX / tableWidth) * 100)

        setColumnWidths((prev) => ({
          ...prev,
          [columnId]: `${newWidthPercent}%`,
        }))
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    // Handle cell editing
    const startCellEdit = (taskId, columnId, value) => {
      setEditingCell({ taskId, columnId })
      setEditValue(value !== undefined ? value : "")
    }

    const saveCellEdit = () => {
      if (!editingCell) return

      const { taskId, columnId } = editingCell

      // Find the task to update
      const taskToUpdate = tasks.find((task) => task.id === taskId)
      if (!taskToUpdate) return

      // Create updated task data
      const updatedTaskData = {
        ...taskToUpdate,
        [columnId]: editValue,
      }

      // Call the updateTask function to send to API
      updateTask(taskId, updatedTaskData, sprintName)

      setEditingCell(null)
    }

    const cancelCellEdit = () => {
      setEditingCell(null)
    }

    // Add column functions
    const openAddColumnModal = () => {
      setIsAddColumnModalOpen(true)
    }

    const closeAddColumnModal = () => {
      setIsAddColumnModalOpen(false)
      setNewColumnInfo({
        id: "",
        label: "",
        type: "text",
        visible: true,
        width: "15%",
      })
    }

    const handleColumnInfoChange = (e) => {
      const { name, value, type, checked } = e.target
      setNewColumnInfo((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        id: name === "label" ? value.toLowerCase().replace(/\s+/g, "_") : prev.id,
      }))
    }

    const addNewColumn = () => {
      if (!newColumnInfo.label) return

      // Add to visible columns
      setVisibleColumns((prev) => ({
        ...prev,
        [newColumnInfo.id]: true,
      }))

      // Add to column widths
      setColumnWidths((prev) => ({
        ...prev,
        [newColumnInfo.id]: newColumnInfo.width,
      }))

      // Add default value to all tasks
      const updatedTasks = tasks.map((task) => ({
        ...task,
        [newColumnInfo.id]: "",
      }))

      // Update sprint data
      const updatedSprintData = { ...sprintData }
      updatedSprintData[sprintName] = updatedTasks
      setSprintData(updatedSprintData)

      closeAddColumnModal()
    }

    const deleteColumnFromTable = (columnId) => {
      if (window.confirm(`Are you sure you want to delete the ${columnId} column?`)) {
        // Remove from visible columns
        setVisibleColumns((prev) => {
          const newVisibility = { ...prev }
          delete newVisibility[columnId]
          return newVisibility
        })

        // Remove from column widths
        setColumnWidths((prev) => {
          const newWidths = { ...prev }
          delete newWidths[columnId]
          return newWidths
        })

        // Remove data from all tasks
        const updatedTasks = tasks.map((task) => {
          const newTask = { ...task }
          delete newTask[columnId]
          return newTask
        })

        // Update sprint data
        const updatedSprintData = { ...sprintData }
        updatedSprintData[sprintName] = updatedTasks
        setSprintData(updatedSprintData)
      }
    }

    // Get all available columns for this sprint
    const availableColumns = Object.keys(visibleColumns).filter((col) => col !== "checkbox" && col !== "actions")

    // Get status options
    const statusOptions = ["Done", "In Progress", "Waiting for review", "Ready to start", "Stuck"]

    // Get priority options
    const priorityOptions = ["Critical", "High", "Medium", "Low"]

    // Get role/type options
    const roleOptions = ["Bug", "Feature", "Quality", "Security", "Test"]

    return (
      <div
        className={`mb-8 mx-8 w-auto ${getBgColor()} p-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200/90 transition-all duration-500 ease-in-out ${!isExpanded ? "bg-gray-100" : ""}  overflow-hidden`}
        onMouseLeave={() => setIsSelected(false)}
      >
        <div className="flex items-center justify-between mb-2 p-2 bg-gray-300 rounded-t">
          <div className="flex items-center cursor-pointer" onClick={toggleExpand}>
            <span className="font-medium text-blue-600">{title}</span>
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform duration-300 ease-in-out ${isExpanded ? "" : "transform rotate-180"}`}
            />
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-3">
              {sprintName === "Sprint 1" && "Feb 17 - Mar 2"}
              {sprintName === "sprint 2" && "Mar 1 - April15"}
            </span>

            {/* Column management dropdown */}
            <div className="relative mr-2">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="text-gray-600 hover:text-gray-800 p-1 rounded"
              >
                <Settings size={16} />
              </button>

              {isColumnMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Table Options</div>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700">Show/Hide Columns</div>
                    {availableColumns.map((columnId) => (
                      <label key={columnId} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={visibleColumns[columnId] || false}
                          onChange={() => toggleColumnVisibility(columnId)}
                          className="mr-2"
                        />
                        {columnId === "name"
                          ? "Tasks"
                          : columnId === "assigned_to"
                            ? "Owner"
                            : columnId === "story_points"
                              ? "SP"
                              : columnId === "due_date"
                                ? "Due Date"
                                : columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                      </label>
                    ))}
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={openAddColumnModal}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      >
                        + Add New Column
                      </button>
                      <button
                        onClick={() => deleteSprint(sprintName)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete Sprint
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => addTask(sprintName)}
              className="text-blue-600 flex items-center text-sm hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Add Task
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out transform-origin-top ${isExpanded ? "max-h-screen opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0"}`}
        >
          <div className="p-4 transform transition-transform duration-500" style={{ transformOrigin: "top" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-200 bg-opacity-50 text-sm text-gray-600">
                    {/* Checkbox column */}
                    <th className="p-2 border-b text-left w-10">
                      <input type="checkbox" className="mr-2" />
                    </th>

                    {/* Dynamic columns based on visibleColumns */}
                    {availableColumns.map(
                      (columnId) =>
                        visibleColumns[columnId] && (
                          <th
                            key={columnId}
                            className={`p-2 border-b text-left relative cursor-pointer ${selectedColumnId === columnId ? "bg-blue-50" : ""}`}
                            style={{ width: columnWidths[columnId] || "auto" }}
                            onClick={() => setSelectedColumnId(columnId === selectedColumnId ? null : columnId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {columnId === "name"
                                  ? "Tasks"
                                  : columnId === "assigned_to"
                                    ? "Owner"
                                    : columnId === "story_points"
                                      ? "SP"
                                      : columnId === "due_date"
                                        ? "Due Date"
                                        : columnId.charAt(0).toUpperCase() + columnId.slice(1)}

                                {sortConfig.key === columnId && (
                                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                )}
                              </div>

                              {selectedColumnId === columnId && (
                                <div className="flex items-center">
                                  <button
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      requestSort(columnId)
                                    }}
                                  >
                                    {sortConfig.key === columnId && sortConfig.direction === "asc" ? "↓" : "↑"}
                                  </button>

                                  <button
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleColumnVisibility(columnId)
                                    }}
                                  >
                                    <X size={14} />
                                  </button>

                                  {!["name", "id"].includes(columnId) && (
                                    <button
                                      className="text-gray-500 hover:text-red-500 p-1"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteColumnFromTable(columnId)
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div
                              className="absolute top-0 right-0 h-full w-1 cursor-col-resize"
                              onMouseDown={(e) => startColumnResize(e, columnId)}
                            ></div>
                          </th>
                        ),
                    )}

                    {/* Actions column */}
                    {visibleColumns.actions && (
                      <th className="p-2 border-b text-left relative" style={{ width: columnWidths.actions || "10%" }}>
                        <div className="flex items-center">Actions</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-100 bg-opacity-70 text-sm">
                      {/* Checkbox cell */}
                      <td className="p-2 border-b w-10">
                        <input type="checkbox" className="mr-2" />
                      </td>

                      {/* Dynamic cells based on visibleColumns */}
                      {availableColumns.map(
                        (columnId) =>
                          visibleColumns[columnId] && (
                            <td key={columnId} className="p-2 border-b">
                              {editingCell && editingCell.taskId === task.id && editingCell.columnId === columnId ? (
                                columnId === "status" ? (
                                  <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                  >
                                    {statusOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : columnId === "priority" ? (
                                  <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                  >
                                    {priorityOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : columnId === "role" ? (
                                  <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                  >
                                    {roleOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : columnId === "story_points" ? (
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCellEdit()
                                      if (e.key === "Escape") cancelCellEdit()
                                    }}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                  />
                                ) : columnId === "due_date" ? (
                                  <input
                                    type="date"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCellEdit()
                                      if (e.key === "Escape") cancelCellEdit()
                                    }}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCellEdit()
                                      if (e.key === "Escape") cancelCellEdit()
                                    }}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                    readOnly={columnId === "id"}
                                  />
                                )
                              ) : (
                                <div
                                  className={`truncate max-w-full cursor-pointer hover:bg-gray-200 p-1 rounded ${columnId === "assigned_to" ? "text-blue-600" : ""}`}
                                  onClick={() => {
                                    if (columnId !== "id") {
                                      startCellEdit(task.id, columnId, task[columnId])
                                    }
                                  }}
                                >
                                  {columnId === "status" ? (
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                      {task.status}
                                    </span>
                                  ) : columnId === "priority" ? (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                  ) : columnId === "role" ? (
                                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(task.role)}`}>
                                      {task.role || "Missing"}
                                    </span>
                                  ) : columnId === "due_date" ? (
                                    task.due_date ? (
                                      new Date(task.due_date).toLocaleDateString()
                                    ) : (
                                      "-"
                                    )
                                  ) : (
                                    task[columnId] || "-"
                                  )}
                                </div>
                              )}
                            </td>
                          ),
                      )}

                      {/* Actions cell */}
                      {visibleColumns.actions && (
                        <td className="p-2 border-b">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startCellEdit(task.id, "name", task.name)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteTask(sprintName, task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Add task row */}
                  <tr className="text-sm">
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="p-2 border-b">
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
            </div>
          </div>
        </div>

        {/* Add Column Modal */}
        {isAddColumnModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Column</h3>
                <button onClick={closeAddColumnModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                  <input
                    type="text"
                    name="label"
                    value={newColumnInfo.label}
                    onChange={handleColumnInfoChange}
                    placeholder="Enter column name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Column Type</label>
                  <select
                    name="type"
                    value={newColumnInfo.type}
                    onChange={handleColumnInfoChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="role">Type</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Column Width</label>
                  <select
                    name="width"
                    value={newColumnInfo.width}
                    onChange={handleColumnInfoChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="10%">Narrow (10%)</option>
                    <option value="15%">Normal (15%)</option>
                    <option value="20%">Wide (20%)</option>
                    <option value="25%">Extra Wide (25%)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={closeAddColumnModal}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewColumn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Column
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Add this Column Management Modal component before the return statement in PMSDashboardSprints
  const ColumnManagementModal = () => {
    const [columnForm, setColumnForm] = useState(
      editingColumn || {
        label: "",
        type: "text",
        visible: true,
        width: "2/12",
      },
    )

    const handleColumnFormChange = (e) => {
      const { name, value, type, checked } = e.target
      setColumnForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{editingColumn ? "Edit Column" : "Add New Column"}</h3>
            <button onClick={closeColumnModal} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {!editingColumn ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                <input
                  type="text"
                  name="label"
                  value={columnForm.label}
                  onChange={handleColumnFormChange}
                  placeholder="Enter column name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                  <input
                    type="text"
                    name="label"
                    value={columnForm.label}
                    onChange={handleColumnFormChange}
                    placeholder="Enter column name"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={["checkbox", "name", "id"].includes(editingColumn.id)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      name="visible"
                      checked={columnForm.visible}
                      onChange={handleColumnFormChange}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {!editingColumn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Type</label>
                <select
                  name="type"
                  value={columnForm.type}
                  onChange={handleColumnFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="role">Type</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column Width</label>
              <select
                name="width"
                value={columnForm.width}
                onChange={handleColumnFormChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="1/12">Narrow (1/12)</option>
                <option value="2/12">Normal (2/12)</option>
                <option value="3/12">Wide (3/12)</option>
                <option value="4/12">Extra Wide (4/12)</option>
              </select>
            </div>

            <div className="flex justify-between space-x-2 pt-4">
              {editingColumn && !["checkbox", "name", "id"].includes(editingColumn.id) && (
                <button
                  onClick={() => {
                    deleteColumn(editingColumn.id)
                    closeColumnModal()
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Column
                </button>
              )}
              <div className="flex ml-auto space-x-2">
                <button
                  onClick={closeColumnModal}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveColumnChanges(columnForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingColumn ? "Save Changes" : "Add Column"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add New Sprint Form component
  const NewSprintForm = () => {
    return (
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={newSprintName}
          onChange={(e) => setNewSprintName(e.target.value)}
          placeholder="New sprint name"
          className="px-3 py-1.5 text-sm border rounded bg-white mr-2"
        />
        <button
          onClick={addNewSprint}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
          disabled={!newSprintName.trim()}
        >
          Add Sprint
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto w-full h-full">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-xl font-medium text-gray-700">Loading tasks...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-8 mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {/* Header section */}
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
                    setSelectedPerson("")
                    setIsPersonDropdownOpen(false)
                  }}
                >
                  All Persons
                </div>
                {getAllOwners().map((owner) => (
                  <div
                    key={owner}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPerson(owner)
                      setIsPersonDropdownOpen(false)
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
                    setSelectedStatus("")
                    setIsFilterDropdownOpen(false)
                  }}
                >
                  All Statuses
                </div>
                {getAllStatuses().map((status) => (
                  <div
                    key={status}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedStatus(status)
                      setIsFilterDropdownOpen(false)
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
                setSearchTerm("")
                setSelectedPerson("")
                setSelectedStatus("")
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
          className={`px-3 py-2 text-sm font-medium ${currentView === "All Sprints" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setCurrentView("All Sprints")}
        >
          All Sprints
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium ${currentView === "Active" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setCurrentView("Active")}
        >
          Active Sprints
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium ${currentView === "Backlog" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setCurrentView("Backlog")}
        >
          Backlog
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium ${currentView === "Kanban" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setCurrentView("Kanban")}
        >
          Kanban
        </button>
      </div>

      {/* New Sprint Form */}
      <div className="mx-8 mb-4">
        <NewSprintForm />
      </div>

      {/* Sprint Tables */}
      {(currentView === "All Sprints" || currentView === "Active") &&
        Object.keys(sprintData)
          .filter((sprintName) => sprintName !== "Backlog")
          .filter((sprintName) => {
            // Only show sprints with matching tasks when filtering
            if (searchTerm || selectedPerson || selectedStatus) {
              return sprintHasMatchingTasks(sprintName)
            }
            return true
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
          ))}

      {/* Backlog Table - Always at the end */}
      {(currentView === "All Sprints" || currentView === "Backlog") &&
        ((!searchTerm && !selectedPerson && !selectedStatus) || sprintHasMatchingTasks("Backlog")) && (
          <SprintTable
            title="Backlog"
            tasks={filterTasks(sprintData["Backlog"])}
            isExpanded={sprintVisibility["Backlog"] !== false}
            toggleExpand={() => toggleSprintVisibility("Backlog")}
            addTask={startAddingTask}
            sprintName="Backlog"
            index={Object.keys(sprintData).length - 1}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input
                    type="text"
                    name="assigned_to"
                    value={newTask.assigned_to}
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
                    name="story_points"
                    value={newTask.story_points || ""}
                    onChange={handleTaskInputChange}
                    placeholder="SP"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={newTask.due_date}
                    onChange={handleTaskInputChange}
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
                <button onClick={addNewTable} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Management Modal */}
      {isColumnModalOpen && <ColumnManagementModal />}
    </div>
  )
}

export default Task_dashboard
