"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaUserTag,
} from "react-icons/fa"
import axios from "axios"

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [profileId, setProfileId] = useState(null)
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

  useEffect(() => {
    const token = localStorage.getItem("token")
    const email = localStorage.getItem("email")
    const username = localStorage.getItem("username")

    if (!token) return navigate("/Login")

    setFormData((f) => ({ ...f, email: email || "", username: username || "" }))

    axios
      .get("http://localhost:8000/api/profiles/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        let myProfile = Array.isArray(res.data)
          ? res.data.find((p) => p.user?.username === username) || res.data[0]
          : res.data

        if (myProfile) {
          const uid = myProfile.user.id
          const pid = myProfile.id

          setUserId(uid)
          setProfileId(pid)

          // ✅ Store user_id in localStorage
          localStorage.setItem("user_id", uid)

          setFormData((f) => ({
            ...f,
            first_name: myProfile.user.first_name || f.first_name,
            last_name: myProfile.user.last_name || f.last_name,
            phone: myProfile.phone || "",
            job_title: myProfile.job_title || "",
            location: myProfile.company || "",
            company: myProfile.company || "",
          }))
        }
      })
      .catch((err) => {
        console.error("Could not fetch profile:", err)
      })
  }, [navigate])

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Please login again.")
      return navigate("/Login")
    }
    if (!userId || !profileId) {
      return alert("Still loading your profile, please wait a sec and retry.")
    }

    try {
      setIsLoading(true)

      await axios.put(
        "http://localhost:8000/api/users/",
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
            "X-Object-ID": userId,
          },
        }
      )

      await axios.put(
        "http://localhost:8000/api/profiles/",
        {
          phone: formData.phone,
          job_title: formData.job_title,
          company: formData.location,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
            "X-Object-ID": profileId,
          },
        }
      )

      localStorage.setItem("username", formData.username)
      localStorage.setItem("first_name", formData.first_name)
      localStorage.setItem("last_name", formData.last_name)

      alert("Profile setup completed!")
      navigate("/WorkspaceName")
    } catch (err) {
      console.error("Update error:", err)
      const resp = err.response
      if (resp?.status === 401) {
        alert("Session expired.")
        localStorage.clear()
        return navigate("/Login")
      }
      if (resp?.data?.username) {
        return alert("Username already taken.")
      }
      if (resp?.data) {
        return alert(Object.values(resp.data).flat().join(", "))
      }
      alert("Failed to update, please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500 opacity-5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500 opacity-5 rounded-tr-full" />

      <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
        <button
          onClick={() => navigate("/SignUp")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-blue-700">Complete Your Profile</h2>
          <p className="text-gray-600 text-center">Tell us a bit about yourself</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="John"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <div className="relative">
              <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="johndoe"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Your unique identifier</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                value={formData.email}
                readOnly
                className="w-full pl-10 py-3 border bg-gray-100 rounded-lg text-gray-600"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <div className="relative">
              <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="Software Developer"
              />
            </div>
          </div>

          {/* Company / Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Company / Location</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="Acme Inc. / New York, NY"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 py-3 border rounded-lg focus:ring-teal-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-teal-700 text-white rounded-lg transition"
          >
            {isLoading ? "Updating..." : "Complete Setup"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/workspace-setup")}
            className="text-sm text-gray-500 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
