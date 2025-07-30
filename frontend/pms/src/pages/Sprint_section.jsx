"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, ArrowDownUp, EyeOff, Plus, Edit, Trash2, User, Calendar, AlertTriangle } from "lucide-react"
import { useParams } from "react-router-dom"
import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"
import Lottie from "lottie-react";
import sprint from "../assets/sprint_ani.json"

/**
 * Main Sprints Page Component
 * Renders the complete sprints management interface with navbar and sidebar
 */
const SprintsPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <SprintMain />
      </div>
    </div>
  )
}

/**
 * Sprint Main Component
 * Contains all sprint management functionality including CRUD operations,
 * filtering, sorting, and data visualization
 */
const SprintMain = () => {
  // Get project ID from URL parameters
  const { projectId } = useParams()

  // Core state management for sprints and users data
  const [sprints, setSprints] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Sorting configuration
  const [sortBy, setSortBy] = useState("end_date")
  const [sortOrder, setSortOrder] = useState("asc")

  /**
   * Initialize data fetching when component mounts or projectId changes
   */
  useEffect(() => {
    if (projectId) {
      console.log("Project ID found:", projectId)
      fetchSprints()
      fetchUsers()
    } else {
      console.log("No project ID found")
    }
  }, [projectId])

  /**
   * Fetch sprints data from API
   * Handles different response structures and provides comprehensive error handling
   */
  const fetchSprints = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("No token found")
        alert("User not authenticated. Please log in again.")
        return
      }

      console.log("Fetching sprints for project:", projectId)
      const response = await fetch(`http://localhost:8000/api/sprints/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Project-ID": projectId.toString(),
        },
      })

      console.log("Sprints response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw sprints data received:", data)

        // Handle different API response structures
        let sprintsArray = []
        if (Array.isArray(data)) {
          sprintsArray = data
        } else if (data.results && Array.isArray(data.results)) {
          sprintsArray = data.results
        } else if (data.data && Array.isArray(data.data)) {
          sprintsArray = data.data
        } else {
          console.log("Unexpected data structure:", data)
          sprintsArray = []
        }

        console.log("Processed sprints array:", sprintsArray)
        console.log("Number of sprints:", sprintsArray.length)

        setSprints(sprintsArray)
      } else {
        console.error("Failed to fetch sprints", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching sprints:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch users data for assignment dropdowns
   * Handles different response structures for user data
   */
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

  // Form state for creating/editing sprints
  const [newSprint, setNewSprint] = useState({
    name: "",
    start_date: "",
    end_date: "",
    active: true,
    description: "",
    goal: "",
    priority: "medium",
    assigned_to: "",
    assigned_by: "",
  })

  // UI state management
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Dropdown states
  const [isActiveDropdownOpen, setIsActiveDropdownOpen] = useState(false)
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  // Configuration arrays
  const priorityOptions = [
    { value: "low", label: "Low", color: "text-green-600 bg-green-100" },
    { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-100" },
    { value: "high", label: "High", color: "text-red-600 bg-red-100" },
  ]

  const sortOptions = [
    { value: "end_date", label: "Due Date" },
    { value: "start_date", label: "Start Date" },
    { value: "name", label: "Name" },
    { value: "priority", label: "Priority" },
    { value: "created_at", label: "Created Date" },
  ]

  /**
   * Check if a sprint has expired (past due date and still active)
   */
  const isSprintExpired = (sprint) => {
    if (!sprint.end_date) return false
    const today = new Date()
    const endDate = new Date(sprint.end_date)
    return endDate < today && sprint.active
  }

  /**
   * Determine sprint status based on dates and active state
   */
  const getSprintStatus = (sprint) => {
    if (!sprint.active) return "inactive"
    if (isSprintExpired(sprint)) return "expired"

    const today = new Date()
    const startDate = new Date(sprint.start_date)
    const endDate = new Date(sprint.end_date)

    if (today < startDate) return "upcoming"
    if (today >= startDate && today <= endDate) return "active"
    return "completed"
  }

  /**
   * Handle form input changes for sprint creation/editing
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewSprint((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setNewSprint({
      name: "",
      start_date: "",
      end_date: "",
      active: true,
      description: "",
      goal: "",
      priority: "medium",
      assigned_to: "",
      assigned_by: "",
    })
  }

  /**
   * Create a new sprint via API
   */
  const addNewSprint = async () => {
    if (!newSprint.name.trim() || !newSprint.start_date || !newSprint.end_date) return

    const token = localStorage.getItem("token")
    if (!token) {
      alert("User not authenticated. Please log in again.")
      return
    }

    try {
      const sprintData = {
        name: newSprint.name,
        start_date: newSprint.start_date,
        end_date: newSprint.end_date,
        active: newSprint.active,
        description: newSprint.description,
        goal: newSprint.goal,
        priority: newSprint.priority,
        project: Number.parseInt(projectId),
      }

      // Enhanced debugging for assignment fields
      console.log("Form assigned_to value:", newSprint.assigned_to)
      console.log("Form assigned_by value:", newSprint.assigned_by)

      // Replace the assignment field handling with this more robust version:
      if (newSprint.assigned_to && newSprint.assigned_to !== "" && newSprint.assigned_to !== "null") {
        const assignedToId = Number.parseInt(newSprint.assigned_to)
        if (!isNaN(assignedToId) && assignedToId > 0) {
          sprintData.assigned_to = assignedToId
          console.log("Setting assigned_to to:", assignedToId)
        } else {
          console.log("Invalid assigned_to value, skipping:", newSprint.assigned_to)
        }
      } else {
        console.log("No assigned_to value provided")
      }

      if (newSprint.assigned_by && newSprint.assigned_by !== "" && newSprint.assigned_by !== "null") {
        const assignedById = Number.parseInt(newSprint.assigned_by)
        if (!isNaN(assignedById) && assignedById > 0) {
          sprintData.assigned_by = assignedById
          console.log("Setting assigned_by to:", assignedById)
        } else {
          console.log("Invalid assigned_by value, skipping:", newSprint.assigned_by)
        }
      } else {
        console.log("No assigned_by value provided")
      }

      console.log("Final sprint data being sent:", JSON.stringify(sprintData, null, 2))

      const response = await fetch("http://localhost:8000/api/sprints/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Project-ID": projectId.toString(),
        },
        body: JSON.stringify(sprintData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const createdSprint = await response.json()
        console.log("Sprint created successfully - FULL RESPONSE:", JSON.stringify(createdSprint, null, 2))

        // Check if assigned_to was preserved
        if (sprintData.assigned_to && !createdSprint.assigned_to) {
          console.error("WARNING: assigned_to was lost during creation!")
          console.error("Sent:", sprintData.assigned_to, "Received:", createdSprint.assigned_to)
        }

        setSprints((prev) => [...prev, createdSprint])
        resetForm()
        setShowAddForm(false)
        alert("Sprint created successfully!")
      } else {
        const errorData = await response.json()
        console.error("Failed to create sprint - ERROR RESPONSE:", JSON.stringify(errorData, null, 2))
        alert(`Failed to create sprint: ${JSON.stringify(errorData)}`)
      }
    } catch (err) {
      console.error("Failed to create sprint:", err)
      alert("An error occurred while creating the sprint.")
    }
  }

  /**
   * Prepare sprint data for editing
   */
  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint)
    setNewSprint({
      name: sprint.name,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      active: sprint.active,
      description: sprint.description || "",
      goal: sprint.goal || "",
      priority: sprint.priority || "medium",
      assigned_to: sprint.assigned_to?.toString() || "",
      assigned_by: sprint.assigned_by?.toString() || "",
    })
    setShowAddForm(true)
  }

  /**
   * Save edited sprint changes via API
   */
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("User not authenticated. Please log in again.")
      return
    }

    try {
      const sprintData = {
        name: newSprint.name,
        start_date: newSprint.start_date,
        end_date: newSprint.end_date,
        active: newSprint.active,
        description: newSprint.description,
        goal: newSprint.goal,
        priority: newSprint.priority,
      }

      console.log("EDIT - Form assigned_to value:", newSprint.assigned_to)
      console.log("EDIT - Form assigned_by value:", newSprint.assigned_by)

      if (newSprint.assigned_to) {
        const assignedToId = Number.parseInt(newSprint.assigned_to)
        console.log("EDIT - Parsed assigned_to ID:", assignedToId)
        sprintData.assigned_to = assignedToId
      } else {
        sprintData.assigned_to = null
      }

      if (newSprint.assigned_by) {
        const assignedById = Number.parseInt(newSprint.assigned_by)
        console.log("EDIT - Parsed assigned_by ID:", assignedById)
        sprintData.assigned_by = assignedById
      } else {
        sprintData.assigned_by = null
      }

      console.log("EDIT - Final sprint data being sent:", JSON.stringify(sprintData, null, 2))

      const response = await fetch(`http://localhost:8000/api/sprints/${editingSprint.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Object-ID": editingSprint.id.toString(),
        },
        body: JSON.stringify(sprintData),
      })

      if (response.ok) {
        const updatedSprint = await response.json()
        console.log("EDIT - Sprint updated successfully - FULL RESPONSE:", JSON.stringify(updatedSprint, null, 2))

        setSprints((prev) => prev.map((sprint) => (sprint.id === editingSprint.id ? updatedSprint : sprint)))
        resetForm()
        setEditingSprint(null)
        setShowAddForm(false)
        alert("Sprint updated successfully!")
      } else {
        const errorData = await response.json()
        console.error("EDIT - Failed to update sprint - ERROR RESPONSE:", JSON.stringify(errorData, null, 2))
        alert(`Failed to update sprint: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Error updating sprint:", error)
      alert("An error occurred while updating the sprint.")
    }
  }

  /**
   * Delete sprint with confirmation
   */
  const deleteSprint = async (sprintId) => {
    if (window.confirm(`Are you sure you want to delete sprint "${sprints.find((s) => s.id === sprintId)?.name}"?`)) {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("User not authenticated. Please log in again.")
        return
      }

      try {
        const response = await fetch(`http://localhost:8000/api/sprints/${sprintId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "X-Object-ID": sprintId.toString(),
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete sprint from the backend")
        }

        setSprints((prev) => prev.filter((sprint) => sprint.id !== sprintId))
        alert("Sprint deleted successfully!")
      } catch (error) {
        console.error(error)
        alert("An error occurred while deleting the sprint.")
      }
    }
  }

  /**
   * Move expired sprint to backlog (set as inactive)
   */
  const moveToBacklog = async (sprintId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("User not authenticated. Please log in again.")
        return
      }

      const response = await fetch(`http://localhost:8000/api/sprints/${sprintId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Object-ID": sprintId.toString(),
        },
        body: JSON.stringify({
          active: false,
        }),
      })

      if (response.ok) {
        setSprints((prev) => prev.map((s) => (s.id === sprintId ? { ...s, active: false } : s)))
        alert("Sprint moved to backlog!")
      } else {
        console.error("Failed to move sprint to backlog")
      }
    } catch (error) {
      console.error("Error moving sprint to backlog:", error)
    }
  }

  /**
   * Enhanced filtering and sorting logic with improved expired sprint handling
   */
  const filteredAndSortedSprints = useMemo(() => {
    console.log("Filtering sprints. Total sprints:", sprints.length)
    console.log("Search query:", searchQuery)
    console.log("Active filter:", activeFilter)
    console.log("Priority filter:", priorityFilter)
    console.log("Status filter:", statusFilter)

    if (!Array.isArray(sprints)) {
      console.log("Sprints is not an array:", sprints)
      return []
    }

    // Apply filters
    const filtered = sprints.filter((sprint) => {
      if (!sprint) {
        console.log("Found null/undefined sprint")
        return false
      }

      const matchesSearch = searchQuery
        ? sprint.name && sprint.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesActive = activeFilter === "" ? true : activeFilter === "active" ? sprint.active : !sprint.active

      const matchesPriority = priorityFilter === "" ? true : sprint.priority === priorityFilter

      let matchesStatus = true
      if (statusFilter) {
        const status = getSprintStatus(sprint)
        matchesStatus = status === statusFilter
      }

      const result = matchesSearch && matchesActive && matchesPriority && matchesStatus

      if (!result) {
        console.log(`Sprint ${sprint.name} filtered out:`, {
          matchesSearch,
          matchesActive,
          matchesPriority,
          matchesStatus,
        })
      }

      return result
    })

    console.log("Filtered sprints count:", filtered.length)

    // Enhanced sorting logic with special handling for expired sprints
    filtered.sort((a, b) => {
      // Special handling for due date sorting - expired sprints should be at the end
      if (sortBy === "end_date") {
        const aExpired = isSprintExpired(a)
        const bExpired = isSprintExpired(b)

        // If sorting by due date, put expired sprints at the end regardless of sort order
        if (aExpired && !bExpired) return 1
        if (!aExpired && bExpired) return -1

        // If both expired or both not expired, sort normally by date
        const aValue = new Date(a.end_date || 0)
        const bValue = new Date(b.end_date || 0)

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      }

      // Regular sorting for other fields
      let aValue, bValue

      switch (sortBy) {
        case "start_date":
        case "created_at":
          aValue = new Date(a[sortBy] || 0)
          bValue = new Date(b[sortBy] || 0)
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a[sortBy]] || 0
          bValue = priorityOrder[b[sortBy]] || 0
          break
        case "name":
        default:
          aValue = (a[sortBy] || "").toLowerCase()
          bValue = (b[sortBy] || "").toLowerCase()
          break
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    console.log("Final sorted sprints:", filtered)
    return filtered
  }, [sprints, searchQuery, activeFilter, priorityFilter, statusFilter, sortBy, sortOrder])

  /**
   * Toggle sprint active status
   */
  const handleToggleActive = async (sprintId) => {
    try {
      const sprint = sprints.find((s) => s.id === sprintId)
      const token = localStorage.getItem("token")
      if (!token) {
        alert("User not authenticated. Please log in again.")
        return
      }

      const response = await fetch(`http://localhost:8000/api/sprints/${sprintId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Object-ID": sprintId.toString(),
        },
        body: JSON.stringify({
          active: !sprint.active,
        }),
      })

      if (response.ok) {
        setSprints((prev) => prev.map((s) => (s.id === sprintId ? { ...s, active: !s.active } : s)))
      } else {
        console.error("Failed to update sprint active status")
      }
    } catch (error) {
      console.error("Error toggling sprint active status:", error)
    }
  }

  /**
   * Generate priority badge with appropriate styling
   */
  const getPriorityBadge = (priority) => {
    const option = priorityOptions.find((opt) => opt.value === priority)
    if (!option) return null
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>{option.label}</span>
  }

  /**
   * Generate status badge with appropriate styling
   */
  const getStatusBadge = (sprint) => {
    const status = getSprintStatus(sprint)
    const statusConfig = {
      active: { label: "Active", color: "text-blue-600 bg-blue-100" },
      upcoming: { label: "Upcoming", color: "text-purple-600 bg-purple-100" },
      expired: { label: "Expired", color: "text-red-600 bg-red-100" },
      completed: { label: "Completed", color: "text-green-600 bg-green-100" },
      inactive: { label: "Inactive", color: "text-gray-600 bg-gray-100" },
    }

    const config = statusConfig[status] || statusConfig.inactive
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  /**
   * Get user display name with improved null handling
   * Fixed the assigned_to issue by properly handling the user lookup
   */
  const getUserName = (userId) => {
    console.log("Getting user name for ID:", userId, "from users:", users.length, "users")

    // Handle null, undefined, or empty values
    if (!userId || userId === "null" || userId === null) {
      return "Unassigned"
    }

    // Find user by ID (handle both string and number IDs)
    const user = users.find((u) => {
      return u.id === userId || u.id === Number.parseInt(userId) || u.id.toString() === userId.toString()
    })

    if (!user) {
      console.log("User not found for ID:", userId)
      return "Unassigned"
    }

    // Build display name with fallbacks
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim()
    return fullName || user.username || user.email || `User ${user.id}`
  }

  /**
   * Handle sorting changes with toggle functionality
   */
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setIsSortDropdownOpen(false)
  }

  // Add this function after the other helper functions
  const debugCurrentState = () => {
    console.log("=== DEBUG STATE ===")
    console.log("Current sprints:", sprints)
    console.log("Current users:", users)
    console.log("Form state:", newSprint)
    console.log(
      "Users available for assignment:",
      users.map((u) => ({ id: u.id, name: getUserName(u.id) })),
    )
    console.log("==================")
  }

  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Projects / Project {projectId}</div>
            <h1 className="text-2xl text-gray-700 font-bold">Sprints</h1>
          </div>
        </header>

        {/* Table Info and Stats */}
        <div className="flex items-center mb-4">
          <div className="font-medium">Sprints Table</div>
          <div className="ml-4 text-sm text-gray-500">
            Sorted by: {sortOptions.find((opt) => opt.value === sortBy)?.label} ({sortOrder === "asc" ? "↑" : "↓"})
          </div>
          <div className="ml-4 text-sm text-blue-600">
            Total: {sprints.length} | Filtered: {filteredAndSortedSprints.length}
          </div>
        </div>

        {/* Action Bar with Filters and Controls */}
        <div className="flex mb-4 space-x-2 flex-wrap">
          {/* New Sprint Button */}
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingSprint(null)
              resetForm()
              setShowAddForm(true)
            }}
          >
            New Sprint <Plus size={14} className="ml-1" />
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search sprints"
              className="px-3 py-1.5 text-sm border rounded bg-white pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <Filter size={14} className="mr-1" />
              {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Status"}
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("")
                    setIsStatusDropdownOpen(false)
                  }}
                >
                  All Status
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("active")
                    setIsStatusDropdownOpen(false)
                  }}
                >
                  Active
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("upcoming")
                    setIsStatusDropdownOpen(false)
                  }}
                >
                  Upcoming
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("expired")
                    setIsStatusDropdownOpen(false)
                  }}
                >
                  Expired
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("completed")
                    setIsStatusDropdownOpen(false)
                  }}
                >
                  Completed
                </div>
              </div>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative">
            <button
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            >
              <Filter size={14} className="mr-1" />
              {priorityFilter ? priorityOptions.find((p) => p.value === priorityFilter)?.label : "All Priority"}
            </button>
            {isPriorityDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPriorityFilter("")
                    setIsPriorityDropdownOpen(false)
                  }}
                >
                  All Priority
                </div>
                {priorityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPriorityFilter(option.value)
                      setIsPriorityDropdownOpen(false)
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <ArrowDownUp size={14} className="mr-1" />
              Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </button>
            {isSortDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSort(option.value)}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <span className="text-blue-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-sm font-medium text-gray-600 w-48">Sprint Name</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Start Date</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Due Date</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-48">Description</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-24">Priority</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Status</th>
                
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Assigned By</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Created</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                        <td colSpan="10">
                          <div className="flex justify-center items-center h-[500px]">
                            <div className="w-52 h-52">
                              <Lottie animationData={sprint} loop={true} />
                            </div>
                          </div>
                        </td>
                      </tr>
              ) : filteredAndSortedSprints.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500">
                    {sprints.length === 0
                      ? "No sprints found for this project."
                      : `No sprints match the current filters. Total sprints: ${sprints.length}`}
                  </td>
                </tr>
              ) : (
                filteredAndSortedSprints.map((sprint) => (
                  <tr
                    key={sprint.id}
                    className={`border-t hover:bg-gray-50 ${isSprintExpired(sprint) ? "bg-red-50" : ""}`}
                  >
                    {/* Sprint Name with Goal */}
                    <td className="p-3">
                      <div className="font-medium text-gray-900 flex items-center">
                        {sprint.name}
                        {isSprintExpired(sprint) && (
                          <AlertTriangle size={16} className="ml-2 text-red-500" title="Sprint Expired" />
                        )}
                      </div>
                      {sprint.goal && (
                        <div className="text-xs text-gray-600 mt-1 truncate max-w-xs" title={sprint.goal}>
                          Goal: {sprint.goal}
                        </div>
                      )}
                    </td>

                    {/* Start Date */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : "-"}
                      </span>
                    </td>

                    {/* Due Date with Calendar Icon */}
                    <td className="p-3">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        <span
                          className={`text-sm ${isSprintExpired(sprint) ? "text-red-600 font-medium" : "text-gray-700"}`}
                        >
                          {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={sprint.description}>
                        {sprint.description || "-"}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="p-3">{getPriorityBadge(sprint.priority)}</td>

                    {/* Status Badge */}
                    <td className="p-3">{getStatusBadge(sprint)}</td>

                    {/* Assigned To
                    <td className="p-3">
                      <div className="flex items-center">
                        <User size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-700">{getUserName(sprint.assigned_to)}</span>
                      </div>
                    </td> */}

                    {/* Assigned By */}
                    <td className="p-3">
                      <div className="flex items-center">
                        <User size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-700">{getUserName(sprint.assigned_by)}</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {sprint.created_at ? new Date(sprint.created_at).toLocaleDateString() : "-"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {/* Move to Backlog for Expired Sprints */}
                        {isSprintExpired(sprint) && (
                          <button
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => moveToBacklog(sprint.id)}
                            title="Move to Backlog"
                          >
                            <AlertTriangle size={14} />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          className="text-gray-500 hover:text-blue-600"
                          onClick={() => handleEditSprint(sprint)}
                          title="Edit Sprint"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => deleteSprint(sprint.id)}
                          title="Delete Sprint"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sprint Creation/Editing Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">{editingSprint ? "Edit Sprint" : "Add New Sprint"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sprint Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Sprint Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newSprint.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sprint name"
                />
              </div>

              {/* Date Fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={newSprint.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={newSprint.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Priority and Assignment Fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={newSprint.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <select
                  name="assigned_to"
                  value={newSprint.assigned_to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Assignee </option>
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const displayName =
                        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        user.username ||
                        user.email ||
                        `User ${user.id}`
                      return (
                        <option key={user.id} value={user.id}>
                          {displayName}
                        </option>
                      )
                    })
                  ) : (
                    <option disabled>Loading users...</option>
                  )}
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium mb-1">Assigned By</label>
                <select
                  name="assigned_by"
                  value={newSprint.assigned_by}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Assigner </option>
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const displayName =
                        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        user.username ||
                        user.email ||
                        `User ${user.id}`
                      return (
                        <option key={user.id} value={user.id}>
                          {displayName}
                        </option>
                      )
                    })
                  ) : (
                    <option disabled>Loading users...</option>
                  )}
                </select>
              </div>

              {/* Text Areas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Goal</label>
                <textarea
                  name="goal"
                  value={newSprint.goal}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sprint goal"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={newSprint.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sprint description"
                />
              </div>

              {/* Active Checkbox */}
              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={newSprint.active}
                  onChange={handleInputChange}
                  className="rounded mr-2"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingSprint(null)
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                onClick={editingSprint ? handleSaveEdit : addNewSprint}
                disabled={!newSprint.name || !newSprint.start_date || !newSprint.end_date}
              >
                {editingSprint ? "Save Changes" : "Create Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintsPage
