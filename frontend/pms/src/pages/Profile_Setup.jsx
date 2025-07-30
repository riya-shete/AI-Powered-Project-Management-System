"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUser, FaEnvelope, FaBriefcase, FaMapMarkerAlt, FaPhone, FaUserTag } from "react-icons/fa"
import axios from "axios"

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    job_title: "",
    location: "",
    phone: "",
    company: "",
  })

  // Load user data from localStorage on component mount
  useEffect(() => {
    const email = localStorage.getItem("email")
    const username = localStorage.getItem("username")

    if (email) {
      setFormData((prev) => ({
        ...prev,
        email: email,
        username: username || "",
      }))
    }

    // Check if user is authenticated
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

      if (!token) {
        alert("Authentication error. Please login again.")
        navigate("/Login")
        return
      }

      // Update basic user information
      const userResponse = await axios.put(
        `http://localhost:8000/api/users/`,
        {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      )

      console.log("User info updated successfully:", userResponse.data)

      // Update profile information
      const profileResponse = await axios.put(
        `http://localhost:8000/api/profiles/`,
        {
          phone: formData.phone,
          job_title: formData.job_title,
          company: formData.location, // Using location as company for now
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      )

      console.log("Profile updated successfully:", profileResponse.data)

      // Update localStorage with new user info
      localStorage.setItem("username", formData.username)
      localStorage.setItem("first_name", formData.first_name)
      localStorage.setItem("last_name", formData.last_name)

      alert("Profile setup completed successfully!")

      // Navigate to workspace setup
      navigate("/workspace-setup")
    } catch (error) {
      console.error("Error updating profile:", error)

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.")
        localStorage.clear()
        navigate("/Login")
      } else if (error.response?.data?.username) {
        alert("Username already exists. Please choose a different username.")
      } else if (error.response?.data) {
        // Show specific error message from API
        const errorMessage = Object.values(error.response.data).flat().join(", ")
        alert(`Error: ${errorMessage}`)
      } else {
        alert("Failed to update profile. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 text-gray-900 relative p-6">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500 opacity-5 rounded-bl-full z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500 opacity-5 rounded-tr-full z-0"></div>

      <div className="relative flex flex-col items-center bg-white rounded-xl shadow-xl p-8 w-full max-w-lg z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/SignUp")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>

        {/* Logo or Brand */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
          <FaUser className="text-white text-2xl" />
        </div>

        {/* Form Heading */}
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Complete Your Profile</h2>
        <p className="text-gray-600 mb-8 text-center">
          Tell us a bit more about yourself to personalize your experience
        </p>

        {/* Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">First Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Last Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Username *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUserTag className="text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe123"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">This will be your unique identifier</p>
          </div>

          {/* Email (Pre-filled and readonly) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                readOnly
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Job Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaBriefcase className="text-gray-400" />
              </div>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="Software Developer"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Company/Location */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Company/Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Tech Corp / New York, NY"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mt-8"
            disabled={isLoading}
          >
            {isLoading ? "Updating Profile..." : "Complete Setup"}
          </button>
        </form>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/workspace-setup")}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
                                    