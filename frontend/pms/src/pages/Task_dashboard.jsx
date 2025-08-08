"use client"

import { useEffect, useState, useRef } from "react"
import { Search, ChevronDown, Plus, X, Settings, Trash2, Edit, Calendar, Users, User } from "lucide-react"
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
        <div className="flex-1 overflow-y-auto">
          <PMSDashboardSprints />
        </div>
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

  const personDropdownRef = useRef(null)
  const filterDropdownRef = useRef(null)
  const roleDropdownRef = useRef(null)
  const priorityDropdownRef = useRef(null)

  // Enhanced newTask state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assigned_to: "",
    reporter: "",
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

  // Debug logging for state changes
  useEffect(() => {
    console.log("Sprints state updated:", sprints)
    console.log("Sprints count:", sprints.length)
  }, [sprints])

  useEffect(() => {
    console.log("Users state updated:", users)
    console.log("Users count:", users.length)
  }, [users])

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (personDropdownRef.current && !personDropdownRef.current.contains(event.target)) {
      setIsPersonDropdownOpen(false)
    }
    if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
      setIsFilterDropdownOpen(false)
    }
    if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
      setIsRoleDropdownOpen(false)
    }
    if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
      setIsPriorityDropdownOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])


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
    const currentDate = new Date()
    const taskDueDate = task.due_date ? new Date(task.due_date) : null
    const sprintEndDate = sprint?.end_date ? new Date(sprint.end_date) : null

    return (
      (taskDueDate && taskDueDate < currentDate && task.status?.toLowerCase() !== "done") ||
      (sprintEndDate && sprintEndDate < currentDate && task.status?.toLowerCase() !== "done")
    )
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
    const sprintId = addingToSprint === "Backlog" ? null : getSprintId(addingToSprint)

    const taskToAdd = {
      name: newTask.name,
      description: newTask.description,
      project: Number(projectId),
      sprint: sprintId,
      assigned_to: newTask.assigned_to ? Number.parseInt(newTask.assigned_to, 10) : null,
      reporter: newTask.reporter
        ? Number.parseInt(newTask.reporter, 10)
        : Number.parseInt(localStorage.getItem("user_id"), 10),
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
        console.error("Task creation error:", err)
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
      reporter: newTaskData.reporter ? Number.parseInt(newTaskData.reporter, 10) : existingTask.reporter,
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
      reporter: "",
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
      reporter: "",
      role: "",
      status: "",
      priority: "",
      due_date: "",
      created_at: new Date().toISOString().split("T")[0],
      item_id: "",
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

  // User Dropdown Component
  const UserDropdown = ({ value, onChange, placeholder = "Select user", name }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const dropdownRef = useRef(null) 

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

    const selectedUser = users.find((user) => user.id.toString() === value)

    const filteredUsers = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        >
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-gray-400" />
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
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onChange({ target: { name, value: "" } })
                  setIsOpen(false)
                  setSearchTerm("")
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-500">Unassigned</span>
              </button>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onChange({ target: { name, value: user.id.toString() } })
                    setIsOpen(false)
                    setSearchTerm("")
                  }}
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

  // Load data effect
  useEffect(() => {
    const token = localStorage.getItem("token")
    setLoading(true)

    // Fetch users first
    fetchUsers()

    const sprintHeaders = {
      Authorization: `Token ${token}`,
      "X-Project-ID": projectId,
    }

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
            return axios.get(`${BASE_URL}/api/tasks/`, { headers: taskHeaders }).then((r) => ({
              sprintName: s.name,
              sprintData: s,
              tasks: r.data.results || r.data,
            }))
          }),
        )
      })
      .then((allSprintTasks) => {
        const dataBySprint = {}
        const visibilityBySprint = {}
        const backlogTasksList = []

        allSprintTasks.forEach(({ sprintName, sprintData: sprint, tasks }) => {
          const activeTasks = []
          tasks.forEach((task) => {
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
        console.error("Failed to fetch data:", err)
        setError(`Failed to fetch data: ${err.response?.status} ${err.response?.statusText || err.message}`)
        setLoading(false)
      })
  }, [projectId])

  // Enhanced SprintTable component
  const SprintTable = ({ title, tasks, isExpanded, toggleExpand, addTask, sprintName }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsDropdownRef = useRef(null) 

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

    const sprint = sprints.find((s) => s.name === sprintName)
    const filteredTasks = filterTasks(tasks)
    const allSelected = filteredTasks.length > 0 && filteredTasks.every((task) => selectedTasks.has(task.id))
    const someSelected = filteredTasks.some((task) => selectedTasks.has(task.id))

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
            <div className="relative" ref={settingsDropdownRef}>
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
                    Reporter
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
                  const isOverdue =
                    task.due_date && new Date(task.due_date) < new Date() && task.status?.toLowerCase() !== "done"
                  const assignedUser = users.find((u) => u.id.toString() === task.assigned_to?.toString())
                  const reporterUser = users.find((u) => u.id.toString() === task.reporter?.toString())

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
                            {task.name}
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
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
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
                            {assignedUser
                              ? `${assignedUser.first_name || ""} ${assignedUser.last_name || ""}`.trim() ||
                                assignedUser.username ||
                                assignedUser.email
                              : task.assigned_to
                                ? `User ${task.assigned_to}`
                                : "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {reporterUser
                              ? `${reporterUser.first_name || ""} ${reporterUser.last_name || ""}`.trim() ||
                                reporterUser.username ||
                                reporterUser.email
                              : task.reporter
                                ? `User ${task.reporter}`
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
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(sprintName, task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
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
          reporter: editingTask.reporter?.toString() || "",
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                <UserDropdown
                  value={formData.reporter || ""}
                  onChange={handleInputChange}
                  placeholder="Select reporter"
                  name="reporter"
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
    <div className="flex-1 bg-gray-50 min-h-screen">
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
            {/* <div className="relative">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Project: Current
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div> */}

            <div className="relative" ref={roleDropdownRef}>
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

            <div className="relative" ref={filterDropdownRef}>
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

            <div className="relative"ref={personDropdownRef}>
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
            {Object.keys(sprintData).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No active sprints found</p>
              </div>
            )}
          </div>
        ) : (
          <SprintTable
            title="Backlog"
            tasks={backlogTasks}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                  <UserDropdown
                    value={newTask.reporter}
                    onChange={handleTaskInputChange}
                    placeholder="Select reporter"
                    name="reporter"
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
    </div>
  )
}

export default Task_dashboard
