"use client"

import { useState, useEffect } from "react"
import { Search, X, Plus, Check, XCircle, Trash2, Eye, Users, Building } from "lucide-react"
import axios from "axios" // ADDED: Import axios instead of using fetch
import { useWorkspace } from "../contexts/WorkspaceContexts"

const Invite = ({ isOpen, onClose }) => {
  // State management
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState("member")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // API base URL
  const API_BASE = "http://localhost:8000/api"

  // ENHANCED: Get workspace context with better error handling
  const {
    workspaces,
    currentWorkspace,
    loading: workspaceLoading,
    refreshWorkspaces,
    error: workspaceError,
  } = useWorkspace()

  // ADDED: Get token once and reuse
  const token = localStorage.getItem("token")

  // ADDED: Create axios instance with default config
  const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })

  useEffect(() => {
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      try {
        const userData = JSON.parse(storedUsers)

        // FIXED: Handle both array and object with results property
        if (Array.isArray(userData)) {
          setUsers(userData)
        } else if (userData.results && Array.isArray(userData.results)) {
          setUsers(userData.results)
        } else {
          console.error("Invalid user data format:", userData)
          setUsers([])
        }
      } catch (error) {
        console.error("Error parsing users from localStorage:", error)
        setUsers([])
      }
    }
  }, [])

  // ENHANCED: Load invitations with better workspace validation
  useEffect(() => {
    if (isOpen && currentWorkspace?.id) {
      console.log("🔄 Loading invitations for workspace:", currentWorkspace.name, "ID:", currentWorkspace.id)
      getAllInvitations()
    } else if (isOpen && !currentWorkspace) {
      setError("No active workspace selected. Please select a workspace first.")
    }
  }, [isOpen, currentWorkspace]) // Updated to use currentWorkspace directly

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  // ENHANCED: Workspace validation with better messaging
  useEffect(() => {
    if (isOpen && !currentWorkspace && !workspaceLoading) {
      setError("No active workspace selected. Please select a workspace first.")
    } else if (isOpen && currentWorkspace) {
      setError("")
      console.log("✅ Active workspace detected:", currentWorkspace.name)
    }
  }, [isOpen, currentWorkspace, workspaceLoading])

  if (!isOpen) return null

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // CONVERTED: API Functions using axios instead of fetch
  const getAllInvitations = async () => {
    if (!currentWorkspace?.id) {
      setError("No active workspace to load invitations from")
      return
    }

    try {
      setLoading(true)
      console.log("📨 Fetching invitations for workspace ID:", currentWorkspace.id)

      const response = await apiClient.get("/invitations/", {
        headers: {
          "X-Workspace-ID": currentWorkspace.id, // ADDED: Pass workspace ID in header
        },
      })

      console.log("📨 Invitations response:", response.data)
      setInvitations(response.data.results || response.data || [])
    } catch (error) {
      console.error("❌ Error fetching invitations:", error)
      setError("Failed to fetch invitations: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const getInvitationById = async (invitationId) => {
    try {
      console.log("👁️ Fetching invitation details for ID:", invitationId)

      const response = await apiClient.get("/invitations/", {
        headers: {
          "X-Object-ID": invitationId,
        },
      })

      setSelectedInvitation(response.data)
      setShowViewModal(true)
    } catch (error) {
      console.error("❌ Error fetching invitation:", error)
      setError("Failed to fetch invitation: " + (error.response?.data?.message || error.message))
    }
  }

  // ENHANCED: Create invitation with proper workspace context
  const createInvitation = async () => {
    if (!selectedUser || !selectedRole) {
      setError("Please select a user and role")
      return
    }

    if (!currentWorkspace?.id) {
      setError("No active workspace selected. Cannot send invitation.")
      return
    }

    try {
      setLoading(true)

      const payload = {
        token: "anand",
        email: selectedUser.email,
        role: selectedRole,
        workspace: currentWorkspace.id, // ENHANCED: Use current workspace ID
        // workspace_name: currentWorkspace.name, // ADDED: Include workspace name for reference
      }

      console.log("📤 Sending invitation with payload:", payload)
      console.log("📤 For workspace:", currentWorkspace.name, "ID:", currentWorkspace.id)

      const response = await apiClient.post("/invitations/", payload, {
        headers: {
          "X-Workspace-ID": currentWorkspace.id, // ADDED: Pass workspace ID in header
        },
      })

      console.log("✅ Invitation created successfully:", response.data)
      setSuccess(`Invitation sent successfully to ${selectedUser.email} for workspace "${currentWorkspace.name}"!`)
      setShowCreateModal(false)
      resetForm()
      getAllInvitations() // Refresh the list
    } catch (error) {
      console.error("❌ Error creating invitation:", error)
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create invitation"
      setError("Failed to create invitation: " + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const checkInvitation = async (invitationId) => {
    try {
      console.log("🔍 Checking invitation status for ID:", invitationId)

      const response = await apiClient.get("/invitations/", {
        headers: {
          "X-Object-ID": invitationId,
        },
      })

      setSuccess(`Invitation status: ${response.data.status}`)
    } catch (error) {
      console.error("❌ Error checking invitation:", error)
      setError("Failed to check invitation: " + (error.response?.data?.message || error.message))
    }
  }

  const acceptInvitation = async (id) => {
    try {
      setLoading(true)
      console.log("✅ Accepting invitation ID:", id)

      const response = await apiClient.post(
        "/invitations/0/accept/",
        {},
        {
          headers: {
            "X-Object-ID": id,
          },
        },
      )

      setSuccess("Invitation accepted successfully!")
      getAllInvitations()
    } catch (error) {
      console.error("❌ Error accepting invitation:", error)
      setError("Failed to accept invitation: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const declineInvitation = async (id) => {
    try {
      setLoading(true)
      console.log("❌ Declining invitation ID:", id)

      const response = await apiClient.post(
        "/invitations/decline/",
        {},
        {
          headers: {
            "X-Object-ID": id,
          },
        },
      )

      setSuccess("Invitation declined successfully!")
      getAllInvitations()
    } catch (error) {
      console.error("❌ Error declining invitation:", error)
      setError("Failed to decline invitation: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const deleteInvitation = async (id) => {
    try {
      setLoading(true)
      console.log("🗑️ Deleting invitation ID:", id)

      await apiClient.delete("/invitations/", {
        headers: {
          "X-Object-ID": id,
        },
      })

      setSuccess("Invitation deleted successfully!")
      getAllInvitations()
    } catch (error) {
      console.error("❌ Error deleting invitation:", error)
      setError("Failed to delete invitation: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const resetForm = () => {
    setSelectedUser(null)
    setSelectedRole("member")
    setSearchTerm("")
    setError("")
    setSuccess("")
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowViewModal(false)
    setSelectedInvitation(null)
    resetForm()
  }

  const closeMainModal = () => {
    closeModals()
    onClose() // Close the main invite modal
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">Invitation Management</h2>
            </div>

            {/* ENHANCED: Current Workspace Display */}
            <div className="text-sm">
              {workspaceLoading ? (
                <div className="bg-gray-50 px-3 py-2 rounded-lg animate-pulse">
                  <p className="text-gray-600">Loading workspace...</p>
                </div>
              ) : currentWorkspace ? (
                <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="text-blue-600" size={16} />
                    <p className="text-blue-800 font-semibold">Active Workspace: {currentWorkspace.name}</p>
                  </div>
                  <p className="text-blue-600 text-xs">
                    ID: {currentWorkspace.id} |{currentWorkspace.description && ` ${currentWorkspace.description}`}
                  </p>
                  <p className="text-blue-500 text-xs mt-1">📨 Invitations will be sent for this workspace</p>
                </div>
              ) : (
                <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="text-yellow-600" size={16} />
                    <p className="text-yellow-800 font-medium">No active workspace</p>
                  </div>
                  <p className="text-yellow-600 text-xs mt-1">Please select a workspace to send invitations</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!currentWorkspace || workspaceLoading} // ADDED: Disable if no workspace
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create Invitation
              </button>
              <button
                onClick={closeMainModal}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* ENHANCED: Error/Success Messages */}
          {(error || workspaceError) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
              <XCircle size={16} />
              {error || workspaceError}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
              <Check size={16} />
              {success}
            </div>
          )}
        </div>

        {/* Invitations List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Invitations {currentWorkspace && `for "${currentWorkspace.name}"`}
            </h3>
            <button
              onClick={getAllInvitations}
              disabled={!currentWorkspace || loading}
              className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading invitations...</p>
            </div>
          ) : !currentWorkspace ? (
            <div className="text-center py-8 text-gray-500">
              <Building size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Please select a workspace to view invitations</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No invitations found for this workspace</p>
              <p className="text-sm mt-2">Create your first invitation to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">ID</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Email</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Role</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Status</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-200 px-4 py-3">{invitation.id}</td>
                      <td className="border border-gray-200 px-4 py-3 font-medium">{invitation.email}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span className="capitalize">{invitation.role}</span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invitation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : invitation.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invitation.status}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => getInvitationById(invitation.id)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => checkInvitation(invitation.id)}
                            className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Check Status"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => acceptInvitation(invitation.id)}
                            className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Accept"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => declineInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Decline"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            onClick={() => deleteInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
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
          )}
        </div>
      </div>

      {/* ENHANCED: Create Modal with workspace context */}
      {showCreateModal && (
        <div key="create-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Invitation</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* ADDED: Workspace Context Display in Modal */}
            {currentWorkspace && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="text-blue-600" size={16} />
                  <span className="text-blue-800 font-medium">Inviting to:</span>
                </div>
                <p className="text-blue-700 font-semibold">{currentWorkspace.name}</p>
                <p className="text-blue-600 text-xs">ID: {currentWorkspace.id}</p>
              </div>
            )}

            {/* User Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by username or email..."
                />
              </div>
            </div>

            {/* User Selection */}
            {searchTerm && (
              <div className="mb-4 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="p-3 text-gray-500 text-center">No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user)
                        setSearchTerm("")
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected User */}
            {selectedUser && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="text-green-600" size={16} />
                  <span className="text-green-800 font-medium">Selected User:</span>
                </div>
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-gray-600">{selectedUser.email}</div>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={createInvitation}
                disabled={!selectedUser || loading || !currentWorkspace}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </button>
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedInvitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invitation Details</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium">ID:</span> {selectedInvitation.id}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedInvitation.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {selectedInvitation.role}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedInvitation.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedInvitation.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedInvitation.status}
                </span>
              </div>
              {selectedInvitation.created_at && (
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(selectedInvitation.created_at).toLocaleString()}
                </div>
              )}
              {/* ADDED: Show workspace info if available */}
              {selectedInvitation.workspace && (
                <div>
                  <span className="font-medium">Workspace:</span> {selectedInvitation.workspace}
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={closeModals}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invite
