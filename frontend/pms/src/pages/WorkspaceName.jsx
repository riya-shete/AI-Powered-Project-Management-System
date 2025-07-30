"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaBriefcase, FaUsers, FaRocket, FaBuilding } from "react-icons/fa"
import axios from "axios"

export default function WorkspaceSetup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/Login")
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("user_id")

      if (!token || !userId) {
        alert("Authentication error. Please login again.")
        navigate("/Login")
        return
      }

      // Create workspace using the API
      const response = await axios.post(
        "http://localhost:8000/api/workspaces/",
        {
          name: formData.name,
          description: formData.description,
          // Add any other required fields based on your API
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      )

      console.log("Workspace created successfully:", response.data)

      // Store workspace info in localStorage for dashboard use
      localStorage.setItem("current_workspace_id", response.data.id)
      localStorage.setItem("current_workspace_name", response.data.name)

      alert(`Workspace "${formData.name}" created successfully!`)

      // Navigate to dashboard
      navigate("/Dashboard")
    } catch (error) {
      console.error("Error creating workspace:", error)

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.")
        localStorage.clear()
        navigate("/Login")
      } else if (error.response?.data?.name) {
        alert("Workspace name already exists. Please choose a different name.")
      } else {
        alert("Failed to create workspace. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Navigate to dashboard without creating workspace
    navigate("/Dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 text-gray-900 relative p-6">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500 opacity-5 rounded-bl-full z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500 opacity-5 rounded-tr-full z-0"></div>

      <div className="relative flex flex-col items-center bg-white rounded-xl shadow-xl p-8 w-full max-w-lg z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile-setup")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>

        {/* Logo or Brand */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
          <FaBriefcase className="text-white text-2xl" />
        </div>

        {/* Form Heading */}
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Create Your First Workspace</h2>
        <p className="text-gray-600 mb-8 text-center">
          Set up your workspace to start collaborating with your team and managing projects
        </p>

        {/* Benefits Section */}
        <div className="w-full mb-8 space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <FaUsers className="text-teal-500" />
            <span>Collaborate with team members</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <FaRocket className="text-teal-500" />
            <span>Manage projects efficiently</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <FaBuilding className="text-teal-500" />
            <span>Organize your work in one place</span>
          </div>
        </div>

        {/* Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Workspace Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Workspace Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaBriefcase className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My Awesome Workspace"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                maxLength={100}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Choose a name that represents your team or project</p>
          </div>

          {/* Workspace Description (Optional) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of what this workspace is for..."
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">Help your team understand the purpose of this workspace</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? "Creating Workspace..." : "Create Workspace"}
          </button>
        </form>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button type="button" onClick={handleSkip} className="text-gray-500 hover:text-gray-700 text-sm underline">
            Skip for now, I'll create it later
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg w-full">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Pro Tip</h3>
          <p className="text-xs text-blue-700">
            You can always create additional workspaces later from your dashboard. Each workspace can have its own
            projects, teams, and settings.
          </p>
        </div>
      </div>
    </div>
  )
}
