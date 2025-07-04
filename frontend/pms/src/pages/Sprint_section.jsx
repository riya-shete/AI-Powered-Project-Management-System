"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, ArrowDownUp, EyeOff, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { useParams } from "react-router-dom"

import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"

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

const SprintMain = () => {
  // Get project ID from URL params or context
  const { projectId } = useParams()
  
  // Sprint data state
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchSprints()
    }
  }, [projectId])

  const fetchSprints = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        alert("User not authenticated. Please log in again.")
        return
      }

      const response = await fetch(`http://localhost:8000/api/sprints/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Project-ID": projectId.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSprints(data.results || [])
      } else {
        console.error("Failed to fetch sprints", response.status)
      }
    } catch (error) {
      console.error("Error fetching sprints:", error)
    } finally {
      setLoading(false)
    }
  }

  // New sprint form state - matching your Sprint model
  const [newSprint, setNewSprint] = useState({
    name: "",
    start_date: "",
    end_date: "",
    active: true,
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [isActiveDropdownOpen, setIsActiveDropdownOpen] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewSprint((prev) => ({ ...prev, [name]: value }))
  }

  const addNewSprint = async () => {
    if (!newSprint.name.trim() || !newSprint.start_date || !newSprint.end_date) return

    const token = localStorage.getItem("token")

    if (!token) {
      alert("User not authenticated. Please log in again.")
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/sprints/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Project-ID": projectId.toString(),
        },
        body: JSON.stringify({
          name: newSprint.name,
          start_date: newSprint.start_date,
          end_date: newSprint.end_date,
          active: newSprint.active,
          project: Number.parseInt(projectId), // Ensure it's a number
        }),
      })

      if (response.ok) {
        const createdSprint = await response.json()
        setSprints((prev) => [...prev, createdSprint])

        // Reset form
        setNewSprint({
          name: "",
          start_date: "",
          end_date: "",
          active: true,
        })
        setShowAddForm(false)
        alert("Sprint created successfully!")
      } else {
        const errorData = await response.json()
        console.error("Failed to create sprint", errorData)
        alert("Failed to create sprint. Please check all required fields.")
      }
    } catch (err) {
      console.error("Failed to create sprint:", err)
      alert("An error occurred while creating the sprint.")
    }
  }

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint)
    setNewSprint({
      name: sprint.name,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      active: sprint.active,
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("User not authenticated. Please log in again.")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/sprints/${editingSprint.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Object-ID": editingSprint.id.toString(), // Use actual sprint ID
        },
        body: JSON.stringify(newSprint),
      })

      if (response.ok) {
        const updatedSprint = await response.json()
        setSprints((prev) => prev.map((sprint) => (sprint.id === editingSprint.id ? updatedSprint : sprint)))

        setNewSprint({
          name: "",
          start_date: "",
          end_date: "",
          active: true,
        })
        setEditingSprint(null)
        setShowAddForm(false)
        alert("Sprint updated successfully!")
      } else {
        console.error("Failed to update sprint")
        alert("Failed to update sprint. Please try again.")
      }
    } catch (error) {
      console.error("Error updating sprint:", error)
      alert("An error occurred while updating the sprint.")
    }
  }

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
            "X-Object-ID": sprintId.toString(), // Use actual sprint ID
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete sprint from the backend")
        }

        // Frontend state update
        setSprints((prev) => prev.filter((sprint) => sprint.id !== sprintId))
        alert("Sprint deleted successfully!")
      } catch (error) {
        console.error(error)
        alert("An error occurred while deleting the sprint.")
      }
    }
  }

  // Filtered sprints based on search query and filters
  const filteredSprints = useMemo(() => {
    return sprints.filter((sprint) => {
      const matchesSearch = searchQuery ? sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) : true

      const matchesActive = activeFilter === "" ? true : activeFilter === "active" ? sprint.active : !sprint.active

      return matchesSearch && matchesActive
    })
  }, [sprints, searchQuery, activeFilter])

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
          "X-Object-ID": sprintId.toString(), // Use actual sprint ID
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

  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Projects / Project {projectId}</div>
            <h1 className="text-2xl text-gray-700 font-bold">Sprints</h1>
          </div>
        </header>

        <div className="flex items-center mb-4">
          <div className="font-medium">Sprints Table</div>
        </div>

        <div className="flex mb-4 space-x-2 flex-wrap">
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingSprint(null)
              setNewSprint({
                name: "",
                start_date: "",
                end_date: "",
                active: true,
              })
              setShowAddForm(true)
            }}
          >
            New Sprint <Plus size={14} className="ml-1" />
          </button>

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

          <div className="relative">
            <button
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => setIsActiveDropdownOpen(!isActiveDropdownOpen)}
            >
              <Filter size={14} className="mr-1" />
              {activeFilter === "active" ? "Active" : activeFilter === "inactive" ? "Inactive" : "All"}
            </button>
            {isActiveDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setActiveFilter("")
                    setIsActiveDropdownOpen(false)
                  }}
                >
                  All Sprints
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setActiveFilter("active")
                    setIsActiveDropdownOpen(false)
                  }}
                >
                  Active Only
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setActiveFilter("inactive")
                    setIsActiveDropdownOpen(false)
                  }}
                >
                  Inactive Only
                </div>
              </div>
            )}
          </div>

          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <ArrowDownUp size={14} className="mr-1" /> Sort
          </button>
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <EyeOff size={14} className="mr-1" /> Hide
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-sm font-medium text-gray-600 w-48">Sprint Name</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Start Date</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">End Date</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-24">Active?</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-32">Created</th>
                <th className="p-3 text-sm font-medium text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Loading sprints...
                  </td>
                </tr>
              ) : filteredSprints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No sprints found for this project.
                  </td>
                </tr>
              ) : (
                filteredSprints.map((sprint) => (
                  <tr key={sprint.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{sprint.name}</div>
                      <div className="text-xs text-gray-500">ID: {sprint.id}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleActive(sprint.id)} className="focus:outline-none">
                        {sprint.active ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <X size={16} className="text-red-500" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {sprint.created_at ? new Date(sprint.created_at).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-gray-500 hover:text-blue-600"
                          onClick={() => handleEditSprint(sprint)}
                          title="Edit Sprint"
                        >
                          <Edit size={14} />
                        </button>
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

      {/* Modal popup for adding/editing sprints */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">{editingSprint ? "Edit Sprint" : "Add New Sprint"}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={newSprint.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={newSprint.active}
                  onChange={(e) => setNewSprint((prev) => ({ ...prev, active: e.target.checked }))}
                  className="rounded mr-2"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
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
