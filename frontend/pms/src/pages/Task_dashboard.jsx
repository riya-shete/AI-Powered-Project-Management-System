"use client"

import { useEffect, useState } from "react"
import { Search, ChevronDown, Plus, X, Settings, Trash2, Edit, Calendar, Users, User ,RefreshCw} from "lucide-react"
import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"
import axios from "axios"
import Lottie from "lottie-react"
import { useParams } from "react-router-dom"
import man from "../assets/man_with_task_list.json"
import AIAssistantWidget from '../components/AIProjectAnalyzer';

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

  // All existing state variables
  const [sprints, setSprints] = useState([])
  const [users, setUsers] = useState([]) // Add users state
  const [selectedSprintId, setSelectedSprintId] = useState("")
  const [sprintData, setSprintData] = useState(() => {
    const savedData = localStorage.getItem("sprintData")
    return savedData ? JSON.parse(savedData) : {}
  })
  const [backlogTasks, setBacklogTasks] = useState([])
  const [taskTables, setTaskTables] = useState([])
  const [customTableTasks, setCustomTableTasks] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("")
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false)
  const [currentView, setCurrentView] = useState("Active Sprints")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [newAITasks, setNewAITasks] = useState([]);

  // Form states
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
  const [editingTask, setEditingTask] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Enhanced newTask state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assigned_to: "",
    assigned_by: "",
    role: "",
    status: "",
    priority: "",
    due_date: "",
    created_at: new Date().toISOString().split("T")[0],
    item_id: "",
  })

  // Fetch users function following your strategy
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      console.log("No token found for fetching users")
      return
    }
    console.log("Fetching users...")
    const response = await fetch(`http://localhost:8000/api/users/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    console.log("Users response status:", response.status)
    if (response.ok) {
      const data = await response.json()
      console.log("Users data received:", data)
      // Handle different API response structures for users
      let usersArray = []
      if (Array.isArray(data)) {
        usersArray = data
      } else if (data.results && Array.isArray(data.results)) {
        usersArray = data.results
      } else if (data.data && Array.isArray(data.data)) {
        usersArray = data.data
      } else {
        console.log("Unexpected users data structure:", data)
        usersArray = []
      }
      setUsers(usersArray)
    } else {
      console.error("Failed to fetch users", response.status)
      const errorText = await response.text()
      console.error("Users error response:", errorText)
    }
  } catch (error) {
    console.error("Error fetching users:", error)
  }
}

const loadAllData = async () => {
  const token = localStorage.getItem("token")
  setLoading(true)

  try {
    // Fetch users first
    await fetchUsers()

    // Fetch sprints
    const sprintHeaders = {
      Authorization: `Token ${token}`,
      "X-Project-ID": projectId,
    }

    const sprintsResponse = await axios.get(`${BASE_URL}/api/sprints/`, { headers: sprintHeaders })
    const mySprints = sprintsResponse.data.results || sprintsResponse.data
    setSprints(mySprints)

    // Organize tasks by sprint
    const dataBySprint = {}
    const visibilityBySprint = {}
    const backlogTasksList = []

    // Initialize sprint data structure
    mySprints.forEach((sprint) => {
      dataBySprint[sprint.name] = []
      visibilityBySprint[sprint.name] = true
    })

    // Add Backlog to visibility
    visibilityBySprint["Backlog"] = true

    // Fetch tasks for each sprint individually
    for (const sprint of mySprints) {
      try {
        const taskHeaders = {
          Authorization: `Token ${token}`,
          "X-Project-ID": projectId,
          "X-Sprint-ID": sprint.id,
        }
        
        const tasksResponse = await axios.get(`${BASE_URL}/api/tasks/`, { headers: taskHeaders })
        const sprintTasks = tasksResponse.data.results || tasksResponse.data || []
        
        console.log(`Sprint "${sprint.name}" tasks:`, sprintTasks)
        console.log(`Sprint fetched from bkend "${sprint.name}" tasks:`, sprintTasks)
        
        // Categorize tasks for this sprint
        sprintTasks.forEach((task) => {
          const isExpired = isTaskExpired(task, sprint)
          if (isExpired) {
            console.log(`Task "${task.name}" expired - moving to backlog`, {
              taskDue: task.due_date,
              sprintEnd: sprint.end_date,
              status: task.status,
              currentDate: new Date()
            })
            // Add to backlog with original sprint info
            backlogTasksList.push({
              ...task,
              original_sprint: sprint.name,
              original_sprint_id: sprint.id
            })
          } else {
            console.log(`Task "${task.name}" active - keeping in sprint`, {
              taskDue: task.due_date,
              sprintEnd: sprint.end_date,
              status: task.status,
              currentDate: new Date()
            })
            // Add to active sprint
            dataBySprint[sprint.name].push(task)
          }
        })
      } catch (error) {
        console.error(`Error fetching tasks for sprint ${sprint.name}:`, error)
        dataBySprint[sprint.name] = []
      }
    }

    // Fetch backlog tasks (tasks with no sprint)
    try {
      const backlogHeaders = {
        Authorization: `Token ${token}`,
        "X-Project-ID": projectId,
      }
      
      // Get all tasks and filter for those without sprint
      const allTasksResponse = await axios.get(`${BASE_URL}/api/tasks/`, { headers: backlogHeaders })
      const allTasks = allTasksResponse.data.results || allTasksResponse.data || []
      
      const tasksWithoutSprint = allTasks.filter(task => !task.sprint)
      console.log("Tasks without sprint (backlog):", tasksWithoutSprint)
      
      // Add tasks without sprint to backlog
      backlogTasksList.push(...tasksWithoutSprint)
      
    } catch (backlogError) {
      console.error("Error fetching backlog tasks:", backlogError)
    }

    // Remove duplicates from backlog
    const uniqueBacklogTasks = backlogTasksList.filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    )

    // Log for debugging
    console.log("Final task distribution:", {
      sprints: Object.keys(dataBySprint).map(name => ({
        name,
        taskCount: dataBySprint[name].length,
        tasks: dataBySprint[name].map(t => ({ id: t.id, name: t.name, due_date: t.due_date, status: t.status }))
      })),
      backlogCount: uniqueBacklogTasks.length,
      backlogTasks: uniqueBacklogTasks.map(t => ({ id: t.id, name: t.name, due_date: t.due_date, status: t.status, original_sprint: t.original_sprint }))
    })

    setSprintData(dataBySprint)
    setBacklogTasks(uniqueBacklogTasks)
    setSprintVisibility(visibilityBySprint)
    setLoading(false)

  } catch (err) {
    console.error("Failed to fetch data:", err)
    setError(`Failed to fetch data: ${err.response?.status} ${err.response?.statusText || err.message}`)
    setLoading(false)
  }
}


// Debug logging for state changes
useEffect(() => {
  console.log("Sprints state updated:", sprints)
  console.log("Sprints count:", sprints.length)
}, [sprints])

useEffect(() => {
  console.log("Users state updated:", users)
  console.log("Users count:", users.length)
}, [users])

// THEN REPLACE YOUR EXISTING DATA LOADING useEffect WITH THIS:
useEffect(() => {
  loadAllData()
}, [projectId])

  // Color functions with proper standard colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border border-red-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"
      case "low":
        return "bg-green-50 text-green-700 border border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-50 text-green-700 border border-green-200"
      case "in progress":
      case "in_progress":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "waiting for review":
      case "waiting_for_review":
        return "bg-purple-50 text-purple-700 border border-purple-200"
      case "ready to start":
      case "ready":
        return "bg-gray-50 text-gray-700 border border-gray-200"
      case "stuck":
        return "bg-red-50 text-red-700 border border-red-200"
      case "backlog":
        return "bg-slate-50 text-slate-700 border border-slate-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "dev":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "design":
        return "bg-purple-50 text-purple-700 border border-purple-200"
      case "quality":
        return "bg-green-50 text-green-700 border border-green-200"
      case "security":
        return "bg-red-50 text-red-700 border border-red-200"
      case "test":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"
      case "bug":
        return "bg-orange-50 text-orange-700 border border-orange-200"
      case "feature":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  // Enhanced filter functions
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.id && task.id.toString().includes(searchTerm)) ||
        (task.item_id && task.item_id.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesPerson = selectedPerson === "" || task.assigned_to?.toString() === selectedPerson
      const matchesStatus = selectedStatus === "" || task.status === selectedStatus
      const matchesRole = selectedRole === "" || task.role === selectedRole
      const matchesPriority = selectedPriority === "" || task.priority === selectedPriority

      return matchesSearch && matchesPerson && matchesStatus && matchesRole && matchesPriority
    })
  }

  // Add this function to handle tasks generated by AI
const handleAITasksGenerated = (tasks) => {
  console.log('AI generated tasks:', tasks);
  setNewAITasks(tasks);
  
  // Refresh the data to show new tasks
  loadAllData();
  
  // Show success message (you can use your existing error state for success too)
  setError(`✅ Successfully added ${tasks.length} tasks from AI assistant!`);
  setTimeout(() => setError(null), 5000);
};

  // Checkbox handlers
  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = (tasks) => {
    const taskIds = tasks.map((task) => task.id)
    const allSelected = taskIds.every((id) => selectedTasks.has(id))

    if (allSelected) {
      const newSelected = new Set(selectedTasks)
      taskIds.forEach((id) => newSelected.delete(id))
      setSelectedTasks(newSelected)
    } else {
      const newSelected = new Set([...selectedTasks, ...taskIds])
      setSelectedTasks(newSelected)
    }
    setShowBulkActions(selectedTasks.size > 0)
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} selected tasks?`)) {
      try {
        const deletePromises = Array.from(selectedTasks).map((taskId) =>
          axios.delete(`${BASE_URL}/api/tasks/${taskId}/`, {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }),
        )

        await Promise.all(deletePromises)

        // Update local state
        setSprintData((prevData) => {
          const newData = { ...prevData }
          Object.keys(newData).forEach((sprintName) => {
            newData[sprintName] = newData[sprintName].filter((task) => !selectedTasks.has(task.id))
          })
          return newData
        })

        setBacklogTasks((prev) => prev.filter((task) => !selectedTasks.has(task.id)))
        setTasks((prev) => prev.filter((task) => !selectedTasks.has(task.id)))
        setSelectedTasks(new Set())
        setShowBulkActions(false)
      } catch (error) {
        console.error("Failed to delete tasks:", error)
        setError("Failed to delete selected tasks")
      }
    }
  }

  // All existing functions (keeping the same logic)
  const isTaskExpired = (task, sprint) => {
  if (task.status?.toLowerCase() === "done") return false

  const todayStr = new Date().toISOString().split("T")[0] // "2025-11-05"
  const today = new Date(todayStr)

  // Task due date
  if (task.due_date) {
    const taskDateStr = new Date(task.due_date).toISOString().split("T")[0]
    const taskDueDate = new Date(taskDateStr)

    if (taskDueDate < today) {
      console.log(`Task "${task.name}" expired (due date passed)`)
      return true
    }
  }

  // Sprint end date
  if (sprint?.end_date) {
    const sprintDateStr = new Date(sprint.end_date).toISOString().split("T")[0]
    const sprintEnd = new Date(sprintDateStr)

    if (sprintEnd < today && !task.due_date) {
      console.log(`Task "${task.name}" expired (sprint ended)`)
      return true
    }
  }

  return false
}



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

  const validateTaskData = (taskData) => {
    const requiredFields = ["name", "description", "project", "sprint"]
    const missingFields = requiredFields.filter((field) => !taskData[field])
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
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
  
  // Properly handle sprint assignment
  const sprintId = addingToSprint === "Backlog" ? null : getSprintId(addingToSprint)

  const taskToAdd = {
    name: newTask.name,
    description: newTask.description,
    project: Number(projectId),
    sprint: sprintId,
    assigned_to: newTask.assigned_to ? Number.parseInt(newTask.assigned_to, 10) : null,
    assigned_by: newTask.assigned_by ? Number.parseInt(newTask.assigned_by, 10) : Number.parseInt(localStorage.getItem("user_id"), 10),
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
  
  console.log("📤 [DEBUG] Data being sent to backend:", JSON.stringify(taskToAdd, null, 2))

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
      // ADD DEBUG HERE - Check what the backend actually returns
      console.log("✅ [DEBUG] Task created successfully:", res.data)
      console.log("🔍 [DEBUG] assigned_to in response:", res.data.assigned_to)
      console.log("🔍 [DEBUG] assigned_to type in response:", typeof res.data.assigned_to)
      console.log("🔍 [DEBUG] Full response structure:", Object.keys(res.data))

      if (addingToSprint === "Backlog") {
        setBacklogTasks((prev) => [...prev, res.data])
      } else {
        setSprintData((prevData) => ({
          ...prevData,
          [addingToSprint]: [...(prevData[addingToSprint] || []), res.data],
        }))
      }
      setTasks((prevTasks) => {
        const safePrev = Array.isArray(prevTasks) ? prevTasks : []
        return [...safePrev, res.data]
      })
      setError(null)
      cancelAddingTask()
    })
    .catch((err) => {
      console.error("❌ [DEBUG] Task creation error:", err)
      console.error("❌ [DEBUG] Error response:", err.response?.data)
      setError(`Failed to create task: ${err.response?.status} ${err.response?.statusText || err.message}`)
    })
}

  const updateTask = (taskId, newTaskData, sprintName) => {
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

    const backendData = {
      name: newTaskData.name || existingTask.name,
      description: newTaskData.description || existingTask.description,
      project: existingTask.project,
      sprint: existingTask.sprint,
      assigned_to: newTaskData.assigned_to ? Number.parseInt(newTaskData.assigned_to, 10) : existingTask.assigned_to,
      assigned_by: newTaskData.assigned_by ? Number.parseInt(newTaskData.assigned_by, 10) : existingTask.assigned_by,
      status: newTaskData.status || existingTask.status,
      priority: newTaskData.priority || existingTask.priority,
      role: newTaskData.role || existingTask.role,
      due_date: newTaskData.due_date || existingTask.due_date,
      created_at: newTaskData.created_at || existingTask.created_at,
      item_id: existingTask.item_id,
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
      })
      .catch((err) => {
        console.error("Update failed:", err.response?.data || err)
        setError(`Failed to update task: ${err.message}`)
      })
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
        })
        .catch((err) => {
          console.error("Failed to delete task:", err)
          setError(`Failed to delete task: ${err.response?.status} ${err.response?.statusText || err.message}`)
        })
    }
  }

  const startAddingTask = (tableName) => {
    setAddingToSprint(tableName)
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      assigned_by: "",
      role: "",
      status: "",
      priority: "",
      due_date: "",
      created_at: new Date().toISOString().split("T")[0],
      item_id: "",
    })
  }

  const cancelAddingTask = () => {
    setAddingToSprint(null)
    setNewTask({
      name: "",
      description: "",
      assigned_to: "",
      assigned_by: "",
      role: "",
      status: "",
      priority: "",
      due_date: "",
      created_at: new Date().toISOString().split("T")[0],
      item_id: "",
    })
  }
const handleMoveToSprint = async (taskId, sprintId) => {
  try {
    const taskToUpdate = backlogTasks.find(task => task.id === taskId)
    if (!taskToUpdate) return

    const updateData = {
      ...taskToUpdate,
      sprint: sprintId,
    }

    // Remove the original_sprint fields before sending to backend
    delete updateData.original_sprint
    delete updateData.original_sprint_id

    const response = await axios.put(`${BASE_URL}/api/tasks/${taskId}/`, updateData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })

    // Update local state
    const updatedTask = response.data
    setBacklogTasks(prev => prev.filter(task => task.id !== taskId))
    
    // Find which sprint to add it back to
    const targetSprint = sprints.find(s => s.id === sprintId)
    if (targetSprint) {
      setSprintData(prev => ({
        ...prev,
        [targetSprint.name]: [...(prev[targetSprint.name] || []), updatedTask]
      }))
    }

    console.log(`Successfully moved task "${taskToUpdate.name}" back to sprint "${targetSprint?.name}"`)

  } catch (error) {
    console.error("Failed to move task to sprint:", error)
    setError("Failed to move task back to sprint")
  }
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
    return Array.from(statuses)
  }

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
    return Array.from(roles)
  }

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
    return Array.from(priorities)
  }

  const toggleSprintVisibility = (sprintName) => {
    setSprintVisibility((prev) => ({
      ...prev,
      [sprintName]: !prev[sprintName],
    }))
  }

// User Dropdown Component - FIXED VERSION
const UserDropdown = ({ value, onChange, placeholder = "Select user", name }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const selectedUser = users.find((user) => user.id.toString() === value?.toString())

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (userId) => {
    onChange({ target: { name, value: userId } })
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          <span className={selectedUser ? "text-gray-900" : "text-gray-500"}>
            {selectedUser
              ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() ||
                selectedUser.username ||
                selectedUser.email
              : placeholder}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => handleSelect("")}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
            >
              <span className="text-gray-500">Unassigned</span>
            </button>
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id.toString())}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-gray-900">
                    {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username}
                  </div>
                  {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && <div className="px-3 py-2 text-gray-500 text-sm">No users found</div>}
          </div>
        </div>
      )}
    </div>
  )
}



  // Enhanced SprintTable component
  const SprintTable = ({ title, tasks, isExpanded, toggleExpand, addTask, sprintName, isBacklog = false }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const sprint = sprints.find((s) => s.name === sprintName)
  const filteredTasks = filterTasks(tasks)
  const allSelected = filteredTasks.length > 0 && filteredTasks.every((task) => selectedTasks.has(task.id))
  const someSelected = filteredTasks.some((task) => selectedTasks.has(task.id))

  // ADD DEBUG CODE HERE - right before the return statement
  console.log(`🔍 [DEBUG] ${title} tasks:`, filteredTasks.map(task => ({
    id: task.id,
    name: task.name,
    assigned_to: task.assigned_to,
    assigned_to_type: typeof task.assigned_to,
    assigned_to_raw: task.assigned_to
  })))

  return (
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Sprint Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button onClick={toggleExpand} className="flex items-center space-x-2 text-gray-900 hover:text-blue-600">
              <ChevronDown
                size={20}
                className={`transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
              />
              <span className="font-semibold text-lg">{title}</span>
            </button>

            {sprint && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>
                    {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                    {new Date(sprint.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>{filteredTasks.length} tasks</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Settings size={16} />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        addTask(sprintName)
                        setIsSettingsOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => {
                        // Add export functionality
                        setIsSettingsOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Sprint
                    </button>
                    <button
                      onClick={() => {
                        // Add duplicate functionality
                        setIsSettingsOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Duplicate Sprint
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${sprintName}?`)) {
                          // Add delete sprint functionality
                        }
                        setIsSettingsOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Sprint
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => addTask(sprintName)}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected && !allSelected
                      }}
                      onChange={() => handleSelectAll(filteredTasks)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status?.toLowerCase() !== "done"
                  const assignedUser = users.find((u) => u.id.toString() === task.assigned_to?.toString())
                  const assignedbyUser = users.find((u) => u.id.toString() === task.assigned_by?.toString())

                  // Add safety checks for task data
                  if (!task || !task.id) {
                    console.warn("Invalid task data:", task)
                    return null // Skip rendering invalid tasks
                  }

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50" : ""} ${selectedTasks.has(task.id) ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <div className={`font-medium text-gray-900 ${isOverdue ? "text-red-600" : ""}`}>
                            {task.name || "Unnamed Task"}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 mt-1 truncate">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                        >
                          {task.status || "No Status"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority || "No Priority"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(task.role)}`}
                        >
                          {task.role || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(() => {
                                // Case 1: assigned_to is an object with user details
                                if (task.assigned_to && typeof task.assigned_to === 'object') {
                                  return `${task.assigned_to.first_name || ''} ${task.assigned_to.last_name || ''}`.trim() || 
                                        task.assigned_to.username || 
                                        task.assigned_to.email ||
                                        'Unassigned';
                                }
                                
                                // Case 2: assigned_to is a user ID (number or string)
                                if (task.assigned_to) {
                                  const assignedUser = users.find(u => u.id.toString() === task.assigned_to.toString());
                                  if (assignedUser) {
                                    return `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() || 
                                          assignedUser.username || 
                                          assignedUser.email;
                                  }
                                  return `User ${task.assigned_to}`;
                                }
                                
                                // Case 3: No assignment
                                return "Unassigned";
                              })()}
                            </span>
                          </div>
                        </td>
                      <td className="px-4 py-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {/* <CHANGE> Handle reporter as both object and ID */}
                              {assignedbyUser
                                ? `${assignedbyUser.first_name || ""} ${assigned_by.last_name || ""}`.trim() || assignedbyUser.username || assignedbyUser.email
                                : typeof task.assigned_by === 'object' && task.assigned_by?.username
                                  ? task.assigned_by.username
                                  : task.assigned_by
                                    ? `User ${task.assigned_by}`
                                    : "Unknown"}
                            </span>
                          </div>
                        </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {task.created_at ? new Date(task.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {task.due_date ? (
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingTask(task)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit task"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(sprintName, task.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* Add move back button for backlog tasks */}
                          {isBacklog && task.original_sprint && (
                            <button
                              onClick={() => handleMoveToSprint(task.id, task.original_sprint_id)}
                              className="text-green-600 hover:text-green-800"
                              title={`Move back to ${task.original_sprint}`}
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // Task Update Form Modal
  const TaskUpdateForm = () => {
    const [formData, setFormData] = useState({})

    useEffect(() => {
      if (editingTask) {
        setFormData({
          name: editingTask.name || "",
          description: editingTask.description || "",
          status: editingTask.status || "backlog",
          priority: editingTask.priority || "medium",
          role: editingTask.role || "",
          created_at: editingTask.created_at ? editingTask.created_at.split("T")[0] : "",
          assigned_to: editingTask.assigned_to?.toString() || "",
          assigned_by: editingTask.assigned_by?.toString() || "",
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
                  value={formData.priority || "medium"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="dev">Dev</option>
                  <option value="design">Design</option>
                  <option value="quality">Quality</option>
                  <option value="security">Security</option>
                  <option value="test">Test</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <input
                  type="date"
                  name="created_at"
                  value={formData.created_at || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <UserDropdown
                  value={formData.assigned_to || ""}
                  onChange={handleInputChange}
                  placeholder="Select assignee"
                  name="assigned_to"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                <UserDropdown
                  value={formData.assigned_by || ""}
                  onChange={handleInputChange}
                  placeholder="Select assigned_by"
                  name="assigned_by"
                />
              </div>
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
                  let taskSprint = ""
                  Object.entries(sprintData).forEach(([sprintName, tasks]) => {
                    if (tasks.find((t) => t.id === editingTask.id)) {
                      taskSprint = sprintName
                    }
                  })
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

  // Show your original Lottie loading animation
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
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">Projects / Project {projectId}</nav>
            <h1 className="text-2xl font-semibold text-gray-900">PMS</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-md">
                <span className="text-sm text-blue-700">{selectedTasks.size} selected</span>
                <button onClick={handleBulkDelete} className="text-sm text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            )}

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

            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="relative">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Project: Current
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

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
                tasks={tasks}
                isExpanded={sprintVisibility[sprintName]}
                toggleExpand={() => toggleSprintVisibility(sprintName)}
                addTask={startAddingTask}
                sprintName={sprintName}
              />
            ))}
            
            {/* Backlog Section at the end of Active Sprints */}
            <SprintTable
              title="Backlog (Expired Tasks)"
              tasks={backlogTasks}
              isExpanded={sprintVisibility["Backlog"]}
              toggleExpand={() => toggleSprintVisibility("Backlog")}
              addTask={startAddingTask}
              sprintName="Backlog"
              isBacklog={true}
            />
            
            {Object.keys(sprintData).length === 0 && backlogTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No active sprints or tasks found</p>
              </div>
            )}
          </div>
        ) : (
          // Keep the separate backlog view if needed
          <SprintTable
            title="Backlog"
            tasks={backlogTasks}
            isExpanded={true}
            toggleExpand={() => {}}
            addTask={startAddingTask}
            sprintName="Backlog"
            isBacklog={true}
          />
)}
      </div>

      {/* Add Task Form */}
      {addingToSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Task to {addingToSprint}</h2>
              <button onClick={cancelAddingTask} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="role"
                    value={newTask.role}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="dev">Dev</option>
                    <option value="design">Design</option>
                    <option value="quality">Quality</option>
                    <option value="security">Security</option>
                    <option value="test">Test</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <input
                    type="date"
                    name="created_at"
                    value={newTask.created_at}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <UserDropdown
                    value={newTask.assigned_to}
                    onChange={handleTaskInputChange}
                    placeholder="Select assignee"
                    name="assigned_to"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                  <UserDropdown
                    value={newTask.assigned_by}
                    onChange={handleTaskInputChange}
                    placeholder="Select assigned_by"
                    name="assigned_by"
                  />
                </div>
              </div>

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
      <AIAssistantWidget 
      projectId={projectId}
      onTasksGenerated={handleAITasksGenerated}
      sprints={sprints} // Pass the sprints array so user can choose which sprint to add tasks to
    />
    </div>
  )
}

export default Task_dashboard
