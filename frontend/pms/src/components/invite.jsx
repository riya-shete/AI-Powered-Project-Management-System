import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Check, XCircle, Trash2, Eye } from 'lucide-react';
import { useWorkspace } from "../contexts/WorkspaceContexts";

const Invite = ({ isOpen, onClose }) => {

  // State management
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [workspaceId, setWorkspaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // API base URL
  const API_BASE = 'http://localhost:8000/api';

  const { currentWorkspace } = useWorkspace();
  useEffect(() => {
    if (currentWorkspace) {
      console.log("Current workspace:", currentWorkspace);
      console.log("Current workspace ID:", currentWorkspace.id);  
    }
  }, [currentWorkspace]);
  
  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const userData = JSON.parse(storedUsers);
        setUsers(userData.results || []);
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
      }
    }
  }, []);

  // Load invitations on component mount
    useEffect(() => {
    if (isOpen && workspaceId) {
      getAllInvitations();
    }
  }, [isOpen, workspaceId]);


  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  
  
    useEffect(() => {
    if (isOpen && !workspaceId) {
      setError("Please enter a workspace ID.");
    } else if (isOpen && workspaceId) {
      setError("");
      getAllInvitations();
    }
  }, [isOpen, workspaceId]);

    // Don't render if not open
  if (!isOpen) return null;

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Retrieve the token from localStorage
  const token = localStorage.getItem("token");
  
  // API Functions
  const getAllInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/invitations/`, {
        method: 'GET',
        headers:{
          Authorization: `Token ${token}`, // Use Token format as shown in your fetch
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch invitations');
      setInvitations(data.results || data || []);
    } catch (error) {
      setError('Failed to fetch invitations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInvitationById = async () => {
    try {
      const response = await fetch(`${API_BASE}/invitations/`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,

        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch invitation');
      setSelectedInvitation(data);
      setShowViewModal(true);
    } catch (error) {
      setError('Failed to fetch invitation: ' + error.message);
    }
  };

  const createInvitation = async () => {
    if (!selectedUser || !selectedRole || !workspaceId) {
      setError('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        token: token,
        email: selectedUser.email,
        role: selectedRole,
        workspace: workspaceId
      };
      const response = await fetch(`${API_BASE}/invitations/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Workspace-ID": workspaceId,
        },
        body: JSON.stringify(payload)
      });
      console.log('the payload sent',payload);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create invitation');
      setSuccess('Invitation sent successfully!');
      setShowCreateModal(false);
      resetForm();
      getAllInvitations();
    } catch (error) {
      setError('Failed to create invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkInvitation = async () => {
    try {
      const response = await fetch(`${API_BASE}/invitations/`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to check invitation');
      setSuccess('Invitation status: ' + data.status);
    } catch (error) {
      setError('Failed to check invitation: ' + error.message);
    }
  };

  const acceptInvitation = async (id) => {
    try {
      setLoading(true);
     const url = `${API_BASE}/invitations/0/accept/`;
    const headers = {
      Authorization: `Token ${token}`,
      "X-Object-id": id,
      "Content-Type": "application/json"
    };    
    console.log("Sending POST request to:", url);
    console.log("Headers:", headers)

      const response = await fetch(url, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to accept invitation');
      setSuccess('Invitation accepted successfully!');
      getAllInvitations();
    } catch (error) {
      setError('Failed to accept invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const declineInvitation = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/invitations/decline/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          "X-Object-ID": id
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to decline invitation');
      setSuccess('Invitation declined successfully!');
      getAllInvitations();
    } catch (error) {
      setError('Failed to decline invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/invitations/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
          "X-Object-ID": id
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete invitation');
      }
      setSuccess('Invitation deleted successfully!');
      getAllInvitations();
    } catch (error) {
      setError('Failed to delete invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const resetForm = () => {
    setSelectedUser(null);
    setSelectedRole('member');
    setSearchTerm('');
    setError('');
    setSuccess('');
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setSelectedInvitation(null);
    resetForm();
  };

  const closeMainModal = () => {
    closeModals();
    onClose(); // Close the main invite modal
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Invitation Management</h2>
             <div>
              {currentWorkspace ? (
                <p>Inviting to workspace: <strong>{currentWorkspace.name}</strong></p>
              ) : (
                <p>No active workspace</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Create Invitation
              </button>
              <button
                onClick={closeMainModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Workspace ID Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace ID
            </label>
            <input
              type="text"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workspace ID"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              {success}
            </div>
          )}
        </div>

        {/* Invitations List */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Invitations</h3>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No invitations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{invitation.id}</td>
                      <td className="border border-gray-200 px-4 py-2">{invitation.email}</td>
                      <td className="border border-gray-200 px-4 py-2">{invitation.role}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invitation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invitation.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {invitation.status}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => getInvitationById(invitation.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => checkInvitation(invitation.id)}
                            className="text-green-500 hover:text-green-700"
                            title="Check"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => acceptInvitation(invitation.id)}
                            className="text-green-500 hover:text-green-700"
                            title="Accept"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => declineInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Decline"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            onClick={() => deleteInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-700"
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

      {/* Modals outside main container */}
      {showCreateModal && (
        <div key="create-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Invitation</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {/* User Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
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
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchTerm('');
                    }}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Selected User */}
            {selectedUser && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-gray-600">{selectedUser.email}</div>
              </div>
            )}
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
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
                disabled={!selectedUser || loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="font-medium">Status:</span> {selectedInvitation.status}
              </div>
              <div>
                <span className="font-medium">Created:</span> {selectedInvitation.created_at}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={closeModals}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;