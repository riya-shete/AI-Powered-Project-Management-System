"use client"
import React, { useEffect, useState } from "react"
import { Search, ChevronDown, Plus, X, Settings, Trash2, Edit } from "lucide-react"
import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"
import axios from "axios"
import Lottie from "lottie-react"
import { useParams } from "react-router-dom"
import man from "../assets/man_with_task_list.json"

const BASE_URL = "http://localhost:8000"

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
  const { projectId } = useParams()
  const [sprintId, setSprintId] = useState(null)

  // State hooks for component
  const [sprints, setSprints] = useState([])
  const [selectedSprintId, setSelectedSprintId] = useState("")
  const [sprintData, setSprintData] = useState(() => {
    const savedData = localStorage.getItem("sprintData")
    return savedData ? JSON.parse(savedData) : {}
  })
  const [backlogTasks, setBacklogTasks] = useState([]) // New state for backlog
  const [taskTables, setTaskTables] = useState([])
  const [customTableTasks, setCustomTableTasks] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedRole, setSelectedRole] = useState("") // New role filter
  const [selectedPriority, setSelectedPriority] = useState("") // New priority filter
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false) // New dropdown
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false) // New dropdown
  const [currentView, setCurrentView] = useState("Active Sprints") // Changed to match tabs
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
  const [newSprintGoal, setNewSprintGoal] = useState("")
  const [newSprintStartDate, setNewSprintStartDate] = useState("")
  const [newSprintEndDate, setNewSprintEndDate] = useState("")
  const [newSprintActive, setNewSprintActive] = useState(true)
  const [showNewSprintForm, setShowNewSprintForm] = useState(false)

  // Updated newTask state with all required fields
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assigned_to: "",
    role: "",
    status: "",
    priority: "",
    due_date: "",
    created_at: new Date().toISOString(),
    item_id: "",
  })

  // Updated columns to hide ID column
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
          { id: "id", label: "Task ID", type: "text", visible: false, width: "1/12", order: 6 }, // Hidden by default
          { id: "created_at", label: "Created at", type: "number", visible: true, width: "1/12", order: 7 },
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
  const [editingTask, setEditingTask] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    console.log("printing project id", projectId)
  }, [])

  // Function to check if task/sprint is expired and should go to backlog
  const isTaskExpired = (task, sprint) => {
    const currentDate = new Date()
    const taskDueDate = task.due_date ? new Date(task.due_date) : null
    const sprintEndDate = sprint?.end_date ? new Date(sprint.end_date) : null

    // Task is expired if due date passed or sprint ended, and task is not done
    return (
      (taskDueDate && taskDueDate < currentDate && task.status?.toLowerCase() !== "done") ||
      (sprintEndDate && sprintEndDate < currentDate && task.status?.toLowerCase() !== "done")
    )
  }

  useEffect(() => {
    if (!sprints || sprints.length === 0) return

    axios
      .get(`${BASE_URL}/api/tasks/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const allTasks = res.data.results || res.data
        const validSprintIds = sprints.map((s) => s.id)
        const filteredTasks = allTasks.filter((task) => validSprintIds.includes(task.sprint))

        // Separate tasks into active sprints and backlog
        const bySprint = {}
        const backlogTasksList = []

        allTasks.forEach((task) => {
          const sprint = sprints.find((s) => s.id === task.sprint)
          const sprintName = sprint?.name || `Sprint ${task.sprint}`

          if (isTaskExpired(task, sprint)) {
            backlogTasksList.push(task)
          } else {
            bySprint[sprintName] = bySprint[sprintName] || []
            bySprint[sprintName].push(task)
          }
        })

        setSprintData((prev) => ({ ...prev, ...bySprint }))
        setBacklogTasks(backlogTasksList)
      })
      .catch((err) => console.error("Failed to load tasks:", err))
  }, [sprints])

  const getSprintId = (sprintName) => {
    if (!Array.isArray(sprints) || sprints.length === 0) {
      console.error("getSprintId: sprint list is empty or undefined", sprints)
      return null
    }
    const match = sprints.find((s) => s.name === sprintName)
    if (!match) {
      console.error(`getSprintId: no sprint found with name "${sprintName}"`, sprints)
      return null
    }
    return match.id
  }

  const generateId = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString()
  }

  const addNewSprint = async () => {
    if (!newSprintName.trim()) return
    try {
      const { data: created } = await axios.post(
        `${BASE_URL}/api/sprints/`,
        {
          name: newSprintName,
          goal: newSprintGoal,
          start_date: newSprintStartDate,
          end_date: newSprintEndDate,
          active: newSprintActive,
          project: projectId,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
            "X-Project-ID": projectId,
          },
        },
      )

      setSprints((prev) => [...prev, created])
      setSprintData((prev) => ({ ...prev, [created.id]: [] }))
      setSprintVisibility((prev) => ({ ...prev, [created.id]: true }))

      setNewSprintName("")
      setNewSprintGoal("")
      setNewSprintStartDate("")
      setNewSprintEndDate("")
      setNewSprintActive(true)
    } catch (err) {
      console.error("Failed to create sprint:", err.response?.data || err.message)
    }
  }

  const accessToken = localStorage.getItem("access_token")

  const deleteSprint = async (sprintId) => {
    if (window.confirm(`Are you sure you want to delete sprint ID ${sprintId} and all its tasks?`)) {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        alert("User not authenticated. Please log in again.")
        return
      }
      try {
        const response = await fetch(`http://localhost:8000/api/sprints/${sprintId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${accessToken}`,
            "X-Object-ID": "1",
            "Content-Type": "application/json",
          },
        })
        if (!response.ok) {
          throw new Error("Failed to delete sprint from the backend")
        }

        setSprintData((prevData) => {
          const newData = { ...prevData }
          delete newData[sprintId]
          return newData
        })
        setSprintVisibility((prev) => {
          const newVisibility = { ...prev }
          delete newVisibility[sprintId]
          return newVisibility
        })
        alert(`Sprint ${sprintId} deleted successfully`)
      } catch (error) {
        console.error(error)
        alert("An error occurred while deleting the sprint.")
      }
    }
  }

  const startAddingTask = (tableName) => {
    setAddingToSprint(tableName)
  }

  const cancelAddingTask = () => {
    setAddingToSprint(null)
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      role: "",
      status: "",
      priority: "",
      created_at: "",
      due_date: "",
      added: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    })
  }

  const validateTaskData = (taskData) => {
    const requiredFields = ["name", "description", "project", "sprint"]
    const missingFields = requiredFields.filter((field) => !taskData[field])
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return false
    }
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

  const addTaskToSprint = () => {
    if (!addingToSprint || !newTask.name) {
      console.error("Missing sprint name or task name")
      return
    }

    const itemId = `T${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`
    const sprintId = addingToSprint === "Backlog" ? null : getSprintId(addingToSprint)

    const taskToAdd = {
      name: newTask.name,
      description: newTask.description,
      project: Number(projectId),
      sprint: sprintId,
      assigned_to: Number.parseInt(newTask.assigned_to, 10),
      reporter: Number.parseInt(localStorage.getItem("user_id"), 10),
      status: newTask.status,
      priority: newTask.priority,
      role: newTask.role,
      due_date: newTask.due_date,
      created_at: newTask.created_at,
      item_id: itemId,
    }

    if (!validateTaskData(taskToAdd)) {
      setError("Invalid task data. Please check all required fields.")
      return
    }

    console.log("=== TASK CREATION DEBUG ===")
    console.log("Sprint name:", addingToSprint)
    console.log("Sprint ID:", getSprintId(addingToSprint))
    console.log("Project ID:", Number(projectId))
    console.log("Task data being sent:", taskToAdd)
    console.log("Token:", localStorage.getItem("token"))
    console.log("User ID:", localStorage.getItem("user_id"))

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

        if (addingToSprint === "Backlog") {
          setBacklogTasks((prev) => [...prev, res.data])
        } else {
          setSprintData((prevData) => ({
            ...prevData,
            [addingToSprint]: [...(prevData[addingToSprint] || []), res.data],
          }))
        }

        setTasks((prevTasks) => {
          console.log("prevTasks in updater:", prevTasks)
          const safePrev = Array.isArray(prevTasks) ? prevTasks : []
          return [...safePrev, res.data]
        })
        setError(null)
      })
      .catch((err) => {
        console.error("=== TASK CREATION ERROR ===")
        console.error("Full error object:", err)
        console.error("Error response:", err.response)
        console.error("Error response data:", err.response?.data)
        if (err.response?.data && typeof err.response.data === "object") {
          console.error("=== DETAILED VALIDATION ERRORS ===")
          Object.entries(err.response.data).forEach(([field, errors]) => {
            console.error(`${field}:`, errors)
          })
        }
        console.error("Error response status:", err.response?.status)
        console.error("Error response headers:", err.response.headers)
        console.error("Request config:", err.config)
        let errorMessage = `Failed to create task: ${err.response?.status} ${err.response?.statusText || err.message}`
        if (err.response?.data) {
          if (typeof err.response.data === "object") {
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

  const deleteTask = (sprintName, taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
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
          if (sprintName === "Backlog") {
            setBacklogTasks((prev) => prev.filter((task) => task.id !== taskId))
          } else {
            setSprintData((prevData) => ({
              ...prevData,
              [sprintName]: prevData[sprintName].filter((task) => task.id !== taskId),
            }))
          }
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
          console.log(`✅ Task ${taskId} deleted from sprint "${sprintName}"`)
        })
        .catch((err) => {
          console.error("Failed to delete task:", err)
          setError(`Failed to delete task: ${err.response?.status} ${err.response?.statusText || err.message}`)
        })
    }
  }

  const buildTaskUpdatePayload = (newTask, existingTask, projectId, sprintId, itemId) => {
    return {
      name: newTask.name || existingTask.name || "Task name",
      description: newTask.description || existingTask.description || "Details",
      project: Number(projectId) || existingTask.project,
      sprint: sprintId || existingTask.sprint,
      assigned_to: Number.parseInt(localStorage.getItem("user_id")) || existingTask.assigned_to,
      reporter: Number.parseInt(localStorage.getItem("user_id")) || existingTask.reporter,
      status: newTask.status || existingTask.status || "backlog",
      priority: newTask.priority || existingTask.priority || "medium",
      due_date: newTask.due_date || existingTask.due_date || new Date().toISOString().split("T")[0],
      created_at: newTask.created_at || existingTask.created_at || new Date().toISOString(),
      item_id: itemId || existingTask.item_id,
    }
  }

  const updateTask = (taskId, newTask, sprintName) => {
    // Look in the sprintData or backlogTasks for this task
    let existingTask
    if (sprintName === "Backlog") {
      existingTask = backlogTasks.find((t) => t.id === taskId)
    } else {
      const list = sprintData[sprintName] || []
      existingTask = list.find((t) => t.id === taskId)
    }

    if (!existingTask) {
      console.error("Task not found!", sprintName, taskId)
      return
    }

    const backendData = buildTaskUpdatePayload(
      newTask,
      existingTask,
      existingTask.project,
      existingTask.sprint,
      existingTask.item_id,
    )

    if (!validateTaskData(backendData)) {
      setError("Invalid task data. Please check all required fields.")
      return
    }

    axios
      .put(`${BASE_URL}/api/tasks/${taskId}/`, backendData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setTasks((ts) => ts.map((t) => (t.id === taskId ? res.data : t)))

        if (sprintName === "Backlog") {
          setBacklogTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)))
        } else {
          setSprintData((sd) => ({
            ...sd,
            [sprintName]: sd[sprintName].map((t) => (t.id === taskId ? res.data : t)),
          }))
        }
        console.log("✅ Task updated!", res.data)
      })
      .catch((err) => {
        console.error("Update failed:", err.response?.data || err)
        setError(`Failed to update task: ${err.message}`)
      })
  }

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getAllOwners = () => {
    const owners = new Set()
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.assigned_to) owners.add(task.assigned_to)
      })
    })
    backlogTasks.forEach((task) => {
      if (task.assigned_to) owners.add(task.assigned_to)
    })
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.assigned_to) owners.add(task.assigned_to)
      })
    })
    return Array.from(owners)
  }

  const getAllStatuses = () => {
    const statuses = new Set()
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.status) statuses.add(task.status)
      })
    })
    backlogTasks.forEach((task) => {
      if (task.status) statuses.add(task.status)
    })
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.status) statuses.add(task.status)
      })
    })
    return Array.from(statuses)
  }

  // New function to get all roles
  const getAllRoles = () => {
    const roles = new Set()
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.role) roles.add(task.role)
      })
    })
    backlogTasks.forEach((task) => {
      if (task.role) roles.add(task.role)
    })
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.role) roles.add(task.role)
      })
    })
    return Array.from(roles)
  }

  // New function to get all priorities
  const getAllPriorities = () => {
    const priorities = new Set()
    Object.values(sprintData).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.priority) priorities.add(task.priority)
      })
    })
    backlogTasks.forEach((task) => {
      if (task.priority) priorities.add(task.priority)
    })
    Object.values(customTableTasks).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.priority) priorities.add(task.priority)
      })
    })
    return Array.from(priorities)
  }

  // Updated filter function to include new filters
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.id && task.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.assigned_to && task.assigned_to.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.status && task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.priority && task.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.role && task.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.created_at && task.created_at.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesPerson = selectedPerson === "" || task.assigned_to === selectedPerson
      const matchesStatus = selectedStatus === "" || task.status === selectedStatus
      const matchesRole = selectedRole === "" || task.role === selectedRole
      const matchesPriority = selectedPriority === "" || task.priority === selectedPriority

      return matchesSearch && matchesPerson && matchesStatus && matchesRole && matchesPriority
    })
  }

  // Sort tasks by due date and priority
  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      // First sort by due date (overdue tasks first)
      const currentDate = new Date()
      const dateA = a.due_date ? new Date(a.due_date) : null
      const dateB = b.due_date ? new Date(b.due_date) : null

      if (dateA && dateB) {
        const isAOverdue = dateA < currentDate
        const isBOverdue = dateB < currentDate

        if (isAOverdue && !isBOverdue) return -1
        if (!isAOverdue && isBOverdue) return 1
        if (isAOverdue && isBOverdue) return dateA - dateB
        return dateA - dateB
      }

      // Then by priority
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    })
  }

  // Fixed color functions with case-insensitive matching
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-100 text-green-700 border border-green-200"
      case "in progress":
        return "bg-blue-100 text-blue-700 border border-blue-200"
      case "waiting for review":
        return "bg-purple-100 text-purple-700 border border-purple-200"
      case "ready to start":
        return "bg-gray-100 text-gray-700 border border-gray-200"
      case "stuck":
        return "bg-red-100 text-red-700 border border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "dev":
        return "bg-blue-100 text-blue-700 border border-blue-200"
      case "design":
        return "bg-purple-100 text-purple-700 border border-purple-200"
      case "quality":
        return "bg-green-100 text-green-700 border border-green-200"
      case "security":
        return "bg-red-100 text-red-700 border border-red-200"
      case "test":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
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

  const sprintHasMatchingTasks = (sprintName) => {
    const tasks = sprintData[sprintName] || []
    return filterTasks(tasks).length > 0
  }

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

  useEffect(() => {
    const token = localStorage.getItem("token")
    setLoading(true)
    const sprintHeaders = {
      Authorization: `Token ${token}`,
      "X-Project-ID": projectId,
    }
    console.log("📦 Fetching sprints for project:", projectId, "→ with headers:", sprintHeaders)

    axios
      .get(`${BASE_URL}/api/sprints/`, { headers: sprintHeaders })
      .then((res) => {
        const mySprints = res.data.results || res.data
        setSprints(mySprints)

        return Promise.all(
          mySprints.map((s) => {
            const taskHeaders = {
              Authorization: `Token ${token}`,
              "X-Sprint-ID": s.id,
            }
            console.log("📝 Fetching tasks for sprint:", s.id, "→ with headers:", taskHeaders)
            return axios.get(`${BASE_URL}/api/tasks/`, { headers: taskHeaders }).then((r) => ({
              sprintName: s.name,
              tasks: r.data.results || r.data,
            }))
          }),
        )
      })
      .then((allSprintTasks) => {
        const dataBySprint = {}
        const visibilityBySprint = {}
        const backlogTasksList = []

        allSprintTasks.forEach(({ sprintName, tasks }) => {
          const activeTasks = []

          tasks.forEach((task) => {
            const sprint = sprints.find((s) => s.name === sprintName)
            if (isTaskExpired(task, sprint)) {
              backlogTasksList.push(task)
            } else {
              activeTasks.push(task)
            }
          })

          dataBySprint[sprintName] = activeTasks
          visibilityBySprint[sprintName] = true
        })

        setSprintData(dataBySprint)
        setBacklogTasks(backlogTasksList)
        setSprintVisibility(visibilityBySprint)
        setLoading(false)
      })
      .catch((err) => {
        console.error("❌ Failed to fetch data:", err)
        setError(`Failed to fetch data: ${err.response?.status} ${err.response?.statusText || err.message}`)
        setLoading(false)
      })
  }, [projectId])

  useEffect(() => {
    localStorage.setItem("sprintData", JSON.stringify(sprintData))
  }, [sprintData])

  useEffect(() => {
    localStorage.setItem("tableColumns", JSON.stringify(columns))
  }, [columns])

  useEffect(() => {
    localStorage.setItem("rowsPerPage", rowsPerPage.toString())
  }, [rowsPerPage])

  useEffect(() => {
    localStorage.setItem("sortConfig", JSON.stringify(sortConfig))
  }, [sortConfig])

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
      setColumns((prevColumns) =>
        prevColumns.map((col) => (col.id === editingColumn.id ? { ...col, ...updatedColumn } : col)),
      )
    } else {
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
            created_at: "7%",
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
            id: false, // Hide ID column by default
            created_at: true,
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

    useEffect(() => {
      localStorage.setItem(`columnWidths-${sprintName}`, JSON.stringify(columnWidths))
    }, [columnWidths, sprintName])

    useEffect(() => {
      localStorage.setItem(`visibleColumns-${sprintName}`, JSON.stringify(visibleColumns))
    }, [visibleColumns, sprintName])

    useEffect(() => {
      localStorage.setItem(`sortConfig-${sprintName}`, JSON.stringify(sortConfig))
    }, [sortConfig, sprintName])

    const sortedTasks = React.useMemo(() => {
      return sortTasks(tasks) // Use the new sorting function
    }, [tasks])

    const requestSort = (key) => {
      let direction = "asc"
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc"
      }
      setSortConfig({ key, direction })
    }

    const toggleColumnVisibility = (columnId) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [columnId]: !prev[columnId],
      }))
    }

    const startColumnResize = (e, columnId) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startWidth = Number.parseFloat(columnWidths[columnId].replace("%", ""))
      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX
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

    const startCellEdit = (taskId, columnId, value) => {
      setEditingCell({ taskId, columnId })
      setEditValue(value !== undefined ? value : "")
    }

    const saveCellEdit = () => {
      if (!editingCell) return
      const { taskId, columnId } = editingCell
      const taskToUpdate = tasks.find((task) => task.id === taskId)
      if (!taskToUpdate) return
      const updatedTaskData = {
        ...taskToUpdate,
        [columnId]: editValue,
      }
      updateTask(taskId, updatedTaskData, sprintName)
      setEditingCell(null)
    }

    const cancelCellEdit = () => {
      setEditingCell(null)
    }

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
      setVisibleColumns((prev) => ({
        ...prev,
        [newColumnInfo.id]: true,
      }))
      setColumnWidths((prev) => ({
        ...prev,
        [newColumnInfo.id]: newColumnInfo.width,
      }))
      const updatedTasks = tasks.map((task) => ({
        ...task,
        [newColumnInfo.id]: "",
      }))
      const updatedSprintData = { ...sprintData }
      updatedSprintData[sprintName] = updatedTasks
      setSprintData(updatedSprintData)
      closeAddColumnModal()
    }

    const deleteColumnFromTable = (columnId) => {
      if (window.confirm(`Are you sure you want to delete the ${columnId} column?`)) {
        setVisibleColumns((prev) => {
          const newVisibility = { ...prev }
          delete newVisibility[columnId]
          return newVisibility
        })
        setColumnWidths((prev) => {
          const newWidths = { ...prev }
          delete newWidths[columnId]
          return newWidths
        })
        const updatedTasks = tasks.map((task) => {
          const newTask = { ...task }
          delete newTask[columnId]
          return newTask
        })
        const updatedSprintData = { ...sprintData }
        updatedSprintData[sprintName] = updatedTasks
        setSprintData(updatedSprintData)
      }
    }

    const availableColumns = Object.keys(visibleColumns).filter((col) => col !== "checkbox" && col !== "actions")
    const statusOptions = ["Done", "In Progress", "Waiting for review", "Ready to start", "Stuck"]
    const priorityOptions = ["High", "Medium", "Low"]
    const roleOptions = ["Bug", "Feature", "Quality", "Security", "Test"]

    return (
      <div
        className={`mb-8 mx-8 w-auto ${getBgColor()} p-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200/90 transition-all duration-500 ease-in-out ${!isExpanded ? "bg-gray-100" : ""} overflow-visible`}
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
            <div className="relative overflow-visible">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="text-gray-600 hover:text-gray-800 p-1 rounded"
              >
                <Settings size={16} />
              </button>
              {isColumnMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Table Options</div>
                  <div className="px-2 py-1 space-y-1">
                    <button
                      onClick={openAddColumnModal}
                      className="block w-full text-left text-sm text-blue-600 hover:bg-gray-100 px-2 py-1"
                    >
                      + Add New Column
                    </button>
                    <button
                      onClick={() => deleteSprint(sprintName)}
                      className="block w-full text-left text-sm text-red-600 hover:bg-gray-100 px-2 py-1"
                    >
                      Delete Sprint
                    </button>
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
                    <th className="p-2 border-b text-left w-10">
                      <input type="checkbox" className="mr-2" />
                    </th>
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
                                    : columnId === "created_at"
                                      ? "Created At"
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
                    {visibleColumns.actions && (
                      <th className="p-2 border-b text-left relative" style={{ width: columnWidths.actions || "10%" }}>
                        <div className="flex items-center">Actions</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map((task) => {
                    const isOverdue =
                      task.due_date && new Date(task.due_date) < new Date() && task.status?.toLowerCase() !== "done"

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-gray-100 bg-opacity-70 text-sm ${isOverdue ? "bg-red-50" : ""}`}
                      >
                        <td className="p-2 border-b w-10">
                          <input type="checkbox" className="mr-2" />
                        </td>
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
                                  ) : columnId === "created_at" ? (
                                    <input
                                      type="datetime-local"
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
                                    className={`truncate max-w-full cursor-pointer hover:bg-gray-200 p-1 rounded ${columnId === "assigned_to" ? "text-blue-600" : ""} ${isOverdue && columnId === "name" ? "text-red-600 font-medium" : ""}`}
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
                                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(task.role)}`}>
                                        {task.role || "Missing"}
                                      </span>
                                    ) : columnId === "due_date" ? (
                                      task.due_date ? (
                                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                          {new Date(task.due_date).toLocaleDateString()}
                                        </span>
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
                        {visibleColumns.actions && (
                          <td className="p-2 border-b">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  console.log("Opening form for", task.id)
                                  console.log("All current tasks:", tasks)
                                  setEditingTask(task)
                                  setShowForm(true)
                                }}
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
                    )
                  })}
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
                    <option value="role">Role</option>
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

  const NewSprintForm = () => {
    return (
      <div
        className="mb-4 space-y-2 bg-white p-4 rounded shadow"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 ">
          <input
            type="text"
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
            placeholder="Sprint name"
            className="flex-1 px-3 py-1.5 text-sm border rounded bg-white"
          />
          <button
            onClick={addNewSprint}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!newSprintName.trim()}
          >
            Add
          </button>
        </div>
        <input
          type="text"
          value={newSprintGoal}
          onChange={(e) => setNewSprintGoal(e.target.value)}
          placeholder="Goal"
          className="w-full px-3 py-1.5 text-sm border rounded"
        />
        <div className="flex space-x-2">
          <input
            type="date"
            value={newSprintStartDate}
            onChange={(e) => setNewSprintStartDate(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border rounded"
          />
          <input
            type="date"
            value={newSprintEndDate}
            onChange={(e) => setNewSprintEndDate(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border rounded"
          />
        </div>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={newSprintActive}
            onChange={(e) => setNewSprintActive(e.target.checked)}
            className="form-checkbox h-4 w-4"
          />
          <span>Active?</span>
        </label>
      </div>
    )
  }

  // Task Update Form Modal
  const TaskUpdateForm = () => {
    const [formData, setFormData] = useState({})

    // Initialize form data when editingTask changes
    useEffect(() => {
      if (editingTask) {
        setFormData({
          name: editingTask.name || "",
          description: editingTask.description || "",
          status: editingTask.status || "backlog",
          priority: editingTask.priority || "Medium",
          role: editingTask.role || "",
          created_at: editingTask.created_at || "",
          assigned_to: editingTask.assigned_to || "",
          due_date: editingTask.due_date || "",
        })
      }
    }, [editingTask])

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (!showForm || !editingTask) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || "backlog"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status</option>
                  <option value="backlog">Backlog</option>
                  <option value="ready">Ready to Start</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_review">Waiting for Review</option>
                  <option value="done">Done</option>
                  <option value="stuck">Stuck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority || "Medium"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="dev">Dev</option>
                  <option value="design">Design</option>
                  <option value="Quality">Quality</option>
                  <option value="Security">Security</option>
                  <option value="Test">Test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <input
                  type="datetime-local"
                  name="created_at"
                  value={formData.created_at || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To (User ID)</label>
                <input
                  type="text"
                  name="assigned_to"
                  value={formData.assigned_to || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Find which sprint this task belongs to
                  let taskSprint = ""
                  Object.entries(sprintData).forEach(([sprintName, tasks]) => {
                    if (tasks.find((t) => t.id === editingTask.id)) {
                      taskSprint = sprintName
                    }
                  })

                  // Check if task is in backlog
                  if (!taskSprint && backlogTasks.find((t) => t.id === editingTask.id)) {
                    taskSprint = "Backlog"
                  }

                  updateTask(editingTask.id, formData, taskSprint)
                  setShowForm(false)
                  setEditingTask(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-64 h-64">
          <Lottie animationData={man} loop={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">Projects / Project {projectId}</nav>
            <h1 className="text-2xl font-semibold text-gray-900">PMS</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              Export Issues
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              Show all issues
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Add Task Button */}
            <button
              onClick={() => {
                setAddingToSprint(currentView === "Backlog" ? "Backlog" : "Main Sprint")
                setShowForm(false)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search issues"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Project Filter */}
            <div className="relative">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Project: Current
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Type/Role Filter */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Type: {selectedRole || "All"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSelectedRole("")
                      setIsRoleDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    All Types
                  </button>
                  {getAllRoles().map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role)
                        setIsRoleDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Status: {selectedStatus || "All"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSelectedStatus("")
                      setIsFilterDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    All Statuses
                  </button>
                  {getAllStatuses().map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status)
                        setIsFilterDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee Filter */}
            <div className="relative">
              <button
                onClick={() => setIsPersonDropdownOpen(!isPersonDropdownOpen)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Assignee: {selectedPerson ? `User ${selectedPerson}` : "All"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {isPersonDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSelectedPerson("")
                      setIsPersonDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    All Assignees
                  </button>
                  {getAllOwners().map((owner) => (
                    <button
                      key={owner}
                      onClick={() => {
                        setSelectedPerson(owner)
                        setIsPersonDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      User {owner}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white px-6 py-2 border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentView("Active Sprints")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentView === "Active Sprints" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Sprints
          </button>
          <button
            onClick={() => setCurrentView("Backlog")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentView === "Backlog" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Backlog
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentView === "Active Sprints" ? (
          <div className="space-y-6">
            {Object.entries(sprintData).map(([sprintName, tasks]) => (
              <SprintTable
                key={sprintName}
                title={sprintName}
                tasks={sortTasks(filterTasks(tasks))}
                isExpanded={sprintVisibility[sprintName]}
                toggleExpand={() => toggleSprintVisibility(sprintName)}
                addTask={startAddingTask}
                sprintName={sprintName}
              />
            ))}
            {Object.keys(sprintData).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No active sprints found</p>
              </div>
            )}
          </div>
        ) : (
          <SprintTable
            title="Backlog"
            tasks={sortTasks(filterTasks(backlogTasks))}
            isExpanded={true}
            toggleExpand={() => {}}
            addTask={startAddingTask}
            sprintName="Backlog"
          />
        )}
      </div>

      {/* Add Task Form */}
      {addingToSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Task to {addingToSprint}</h2>
              <button onClick={cancelAddingTask} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleTaskInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task name"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="backlog">Backlog</option>
                    <option value="ready">Ready to Start</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_review">Waiting for Review</option>
                    <option value="done">Done</option>
                    <option value="stuck">Stuck</option>
                  </select>
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {/* Role & Created At */}
              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={newTask.role}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="Dev">Dev</option>
                    <option value="Design">Design</option>
                    <option value="Quality">Quality</option>
                    <option value="Security">Security</option>
                    <option value="Test">Test</option>
                  </select>
                </div>
                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <input
                    type="datetime-local"
                    name="created_at"
                    value={newTask.created_at ? newTask.created_at.slice(0, 16) : ""}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Assigned To & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="number"
                    name="assigned_to"
                    value={newTask.assigned_to}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user ID"
                  />
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={newTask.due_date}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={cancelAddingTask}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

      {/* Task Update Form Modal */}
      <TaskUpdateForm />

      {/* Column Management Modal */}
      {isColumnModalOpen && <ColumnManagementModal />}
    </div>
  )
}

export default Task_dashboard
