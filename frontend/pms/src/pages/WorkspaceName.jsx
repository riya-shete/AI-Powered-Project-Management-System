"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaArrowLeft,
  FaBriefcase,
  FaUsers,
  FaRocket,
  FaBuilding,
} from "react-icons/fa"
import { useWorkspace } from "../contexts/WorkspaceContexts" // Import the workspace context

export default function WorkspaceSetup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Use the workspace context
  const { createWorkspace, loading: contextLoading, error: contextError } = useWorkspace()

  // 1️⃣ On mount: verify we have both token & user_id
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("user_id")
    if (!token || !userId) {
      alert("Please login again.")
      navigate("/Login")
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("user_id")

    // double‑check
    if (!token || !userId) {
      alert("Authentication error. Please login again.")
      navigate("/Login")
      return
    }

    try {
      // Use the context's createWorkspace function instead of direct API call
      const newWorkspace = await createWorkspace({
        name: formData.name.trim(),
        description: formData.description.trim(),
      })

      console.log("Workspace created successfully:", newWorkspace)

      // Store the new workspace info in localStorage
      localStorage.setItem("current_workspace_id", newWorkspace.id)
      localStorage.setItem("current_workspace_name", newWorkspace.name)

      alert(`Workspace "${newWorkspace.name}" created successfully!`)
      navigate("/Dashboard")
    } catch (error) {
      console.error("Error creating workspace:", error)
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.")
        localStorage.clear()
        navigate("/Login")
      } else if (error.response?.data?.name) {
        alert("Workspace name already exists. Please choose a different name.")
      } else if (error.message?.includes("already exists")) {
        alert("Workspace name already exists. Please choose a different name.")  
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "Failed to create workspace. Please try again."
        alert(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => navigate("/Dashboard")

  // Show context loading state if available
  const isFormLoading = isLoading || contextLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 text-gray-900 p-6 relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500 opacity-5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500 opacity-5 rounded-tr-full" />

      <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-lg z-10">
        <button
          onClick={() => navigate("/profile-setup")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <FaBriefcase className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-blue-700">
            Create Your First Workspace
          </h2>
          <p className="text-gray-600 text-center">
            Set up your workspace to start collaborating with your team and
            managing projects
          </p>
        </div>

        {/* Show context error if available */}
        {contextError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{contextError}</p>
          </div>
        )}

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

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Workspace Name *
            </label>
            <div className="relative">
              <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My Awesome Workspace"
                required
                maxLength={100}
                className="w-full pl-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a name that represents your team or project
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of this workspace..."
              maxLength={500}
              className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Help your team understand the purpose of this workspace
            </p>
          </div>

          <button
            type="submit"
            disabled={isFormLoading || !formData.name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFormLoading ? "Creating Workspace…" : "Create Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Skip for now, I'll create it later
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Pro Tip</h3>
          <p className="text-xs text-blue-700">
            You can always create additional workspaces later from your
            dashboard. Each workspace can have its own projects, teams, and
            settings.
          </p>
        </div>
      </div>
    </div>
  )
}