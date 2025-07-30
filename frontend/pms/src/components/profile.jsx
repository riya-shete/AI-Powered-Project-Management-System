"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { X, User, Mail, Phone, MapPin, Clock } from "lucide-react"
import axios from "axios"

const Profile = () => {
  const navigate = useNavigate()
  const { userId } = useParams() // Get user ID from URL params

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/home")
    }
  }

  // State for user profile data
  const [profileData, setProfileData] = useState(null)
  const [tempInfo, setTempInfo] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to fetch user profile by ID
  const fetchUserProfile = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:8000/api/profiles/`, {
        headers: {
          Authorization: `Token ${token}`,
          "X-Object-ID": id || "4",
        },
      })

      const rawProfileData = response.data
      const userData = rawProfileData.user
      console.log("Raw API response:", response.data)
      console.log("User data:", userData)

      // Transform API data to match component structure
      const transformedData = {
        id: userData.id,
        // Handle empty first_name and last_name by using username as fallback
        fullName:
          userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`.trim()
            : userData.first_name || userData.last_name || userData.username,
        email: userData.email,
        phoneNumber: rawProfileData.phone && rawProfileData.phone.trim() !== "" ? rawProfileData.phone : "Not provided",
        location:
          rawProfileData.location && rawProfileData.location.trim() !== "" ? rawProfileData.location : "Not specified",
        jobTitle:
          rawProfileData.job_title && rawProfileData.job_title.trim() !== ""
            ? rawProfileData.job_title
            : "Software Developer",
        username: userData.username,
        avatar: rawProfileData.avatar, // Assuming avatar is also at the root
        lastActive: rawProfileData.last_active,
        dateOfBirth: "Not specified", // Not in API response
        joined: rawProfileData.last_active
          ? new Date(rawProfileData.last_active).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })
          : "Recently",
      }

      console.log("Transformed data:", transformedData)
      setProfileData(transformedData)
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError(err.response?.data?.message || "Failed to fetch user profile")
    } finally {
      setLoading(false)
    }
  }

  // Function to update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token")

      // Split fullName into first_name and last_name
      const nameParts = updatedData.fullName.trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      const updatePayload = {
        first_name: firstName,
        last_name: lastName,
        email: updatedData.email,
        phone: updatedData.phoneNumber === "Not provided" ? "" : updatedData.phoneNumber,
        location: updatedData.location === "Not specified" ? "" : updatedData.location,
        job_title: updatedData.jobTitle === "Software Developer" ? "" : updatedData.jobTitle,
      }

      console.log("Update payload:", updatePayload)

      const response = await axios.put(`http://localhost:8000/api/profiles/`, updatePayload, {
        headers: {
          Authorization: `Token ${token}`,
          "X-Object-ID": profileData.id,
        },
      })

      console.log("Profile updated successfully:", response.data)
      return true
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
      return false
    }
  }

  // UseEffect to fetch user profile on component mount
  useEffect(() => {
    const userIdToFetch = userId || localStorage.getItem("currentUserId") || "4"
    fetchUserProfile(userIdToFetch)
  }, [userId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTempInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }))
  }

  const startEditing = () => {
    setTempInfo({ ...profileData })
    setIsEditing(true)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const success = await updateUserProfile(tempInfo)
    if (success) {
      setProfileData(tempInfo)
      setIsEditing(false)
      // Refresh the profile data
      fetchUserProfile(profileData.id)
    }
  }

  const handleCancel = () => {
    setTempInfo({})
    setIsEditing(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchUserProfile(userId || "4")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The requested profile could not be found.</p>
        </div>
      </div>
    )
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition"
        aria-label="Close profile"
      >
        <X size={24} className="text-gray-700" />
      </button>

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Last active: {new Date(profileData.lastActive).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-blue-500 to-blue-400">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar || "/placeholder.svg"}
                      alt={profileData.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-5xl font-bold">{getInitials(profileData.fullName)}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
                <p className="text-gray-500 mb-2">@{profileData.username}</p>
                <p className="text-gray-600 mb-2">{profileData.jobTitle}</p>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Active User</div>
                <div className="flex mt-6 gap-3">
                  <button
                    onClick={startEditing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Edit Profile
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition">
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>
              <ul>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-blue-600 bg-blue-50 transition hover:translate-x-1">
                  <User size={18} />
                  <span className="font-medium">Personal Info</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1">
                  <i className="fas fa-bell"></i>
                  <span className="font-medium">Notifications</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1">
                  <i className="fas fa-lock"></i>
                  <span className="font-medium">Security</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1">
                  <i className="fas fa-cog"></i>
                  <span className="font-medium">Preferences</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1">
                  <i className="fas fa-question-circle"></i>
                  <span className="font-medium">Help & Support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-2xl p-8 mb-6 shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <i className="fas fa-pen"></i> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="text-green-500 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-check"></i> Save
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={tempInfo.fullName || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={tempInfo.email || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={tempInfo.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={tempInfo.location || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={tempInfo.jobTitle || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-1 block">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={tempInfo.username || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        readOnly
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                      <User size={16} /> Full Name
                    </p>
                    <p className="text-gray-800 font-medium">{profileData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                      <Mail size={16} /> Email Address
                    </p>
                    <p className="text-gray-800 font-medium">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                      <Phone size={16} /> Phone Number
                    </p>
                    <p className="text-gray-800 font-medium">{profileData.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                      <MapPin size={16} /> Location
                    </p>
                    <p className="text-gray-800 font-medium">{profileData.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Job Title</p>
                    <p className="text-gray-800 font-medium">{profileData.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Username</p>
                    <p className="text-gray-800 font-medium">@{profileData.username}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 flex items-center shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <i className="fas fa-users text-blue-500"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Teams</p>
                  <p className="text-2xl font-bold text-gray-800">7</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 flex items-center shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <i className="fas fa-project-diagram text-green-500"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Projects</p>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 flex items-center shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <i className="fas fa-award text-purple-500"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Achievements</p>
                  <p className="text-2xl font-bold text-gray-800">9</p>
                </div>
              </div>
            </div>

            {/* Teams Section */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Teams</h3>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
                  <i className="fas fa-plus"></i> Create Team
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                      D
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Design Team</h4>
                      <p className="text-gray-500 text-sm">8 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">
                      +5
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                      D
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Development Team</h4>
                      <p className="text-gray-500 text-sm">12 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">
                      +9
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                      M
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Marketing Team</h4>
                      <p className="text-gray-500 text-sm">6 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">
                      +3
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mr-3">
                      P
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Product Team</h4>
                      <p className="text-gray-500 text-sm">9 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">
                      +6
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
