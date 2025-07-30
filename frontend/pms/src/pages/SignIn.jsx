"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUser, FaEnvelope, FaMobile } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import axios from "axios"

export default function SignUp() {
  const navigate = useNavigate()
  const [contactMethod, setContactMethod] = useState("email")
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    otp_code: "",
  })

  // OTP functionality state variables
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPField, setShowOTPField] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // OTP Request Function
  const requestOTP = async () => {
    try {
      setIsLoading(true)

      // Ensure the contact method is email (as per backend requirements)
      if (contactMethod !== "email") {
        alert("Only email-based OTP is supported. Please use your email.")
        setIsLoading(false)
        return
      }

      // Send the email to the backend for OTP generation
      const response = await axios.post(
        "http://localhost:8000/api/auth/request-otp/",
        { email: formData.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      console.log("OTP sent successfully:", response.data)
      alert(`OTP sent to your email (${formData.email}). Please check your inbox.`)
      setShowOTPField(true)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error("Error requesting OTP:", error)
      alert("Failed to send OTP. Please try again.")
    }
  }

  // OTP Verification Function
  const verifyOTP = async () => {
    try {
      setIsLoading(true)

      // Verify the OTP by sending email and OTP code to the backend
      const response = await axios.post(
        "http://localhost:8000/api/auth/verify-otp/",
        {
          email: formData.email,
          otp_code: formData.otp_code,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      // Extract the token and user details from the response
      const { token, user_id, username, email } = response.data
      console.log(response.data)

      // Store the token and user info in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user_id", user_id)
      localStorage.setItem("username", username)
      localStorage.setItem("email", email)

      console.log("Account created successfully. Token saved:", token)
      console.log("User ID:", user_id)
      console.log("Username:", username)
      console.log("Email:", email)

      alert("Account created successfully!")

      // Set the Authorization header for subsequent API calls
      axios.defaults.headers.common["Authorization"] = `Token ${token}`

      // Navigate to the dashboard or profile setup page
      navigate("/Profile_Setup")
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error("Error verifying OTP:", error)
      alert("Invalid OTP. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 text-gray-900 relative p-6">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500 opacity-5 rounded-bl-full z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500 opacity-5 rounded-tr-full z-0"></div>

      <div className="relative flex flex-col items-center bg-white rounded-xl shadow-xl p-8 w-full max-w-md z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>

        {/* Logo or Brand */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
          <FaUser className="text-white text-2xl" />
        </div>

        {/* Form Heading */}
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Create Account</h2>
        <p className="text-gray-600 mb-8 text-center">Join us today and get access to all features</p>

        {/* Form */}
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          {/* Contact Method Toggle */}
          <div className="flex w-full mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                contactMethod === "email" ? "bg-white shadow-md text-blue-600" : "text-gray-600"
              }`}
              onClick={() => {
                setContactMethod("email")
                setShowOTPField(false)
                setFormData({ ...formData, otp_code: "" })
              }}
            >
              Email
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                contactMethod === "mobile" ? "bg-white shadow-md text-blue-600" : "text-gray-600"
              }`}
              onClick={() => {
                setContactMethod("mobile")
                setShowOTPField(false)
                setFormData({ ...formData, otp_code: "" })
              }}
            >
              Mobile
            </button>
          </div>

          {/* Email or Mobile Field */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {contactMethod === "email" ? "Email Address" : "Mobile Number"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {contactMethod === "email" ? (
                  <FaEnvelope className="text-gray-400" />
                ) : (
                  <FaMobile className="text-gray-400" />
                )}
              </div>
              {contactMethod === "email" ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              ) : (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              )}
            </div>
            {contactMethod === "mobile" && (
              <p className="text-sm text-red-500 mt-1">Note: Currently only email-based signup is supported</p>
            )}
          </div>

          {/* OTP Field (Visible only after requesting OTP) */}
          {showOTPField && (
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">Enter OTP</label>
              <input
                type="text"
                name="otp_code"
                value={formData.otp_code}
                onChange={handleChange}
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
            </div>
          )}

          {/* Buttons */}
          {!showOTPField ? (
            <>
              {/* Request OTP Button */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mb-4"
                onClick={requestOTP}
                disabled={isLoading || !formData[contactMethod] || contactMethod === "mobile"}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              {/* Info text */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We'll send you a verification code to confirm your {contactMethod}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Verify OTP Button */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mb-4"
                onClick={verifyOTP}
                disabled={isLoading || !formData.otp_code || formData.otp_code.length !== 6}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>

              {/* Resend OTP Button */}
              <button
                type="button"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                onClick={() => {
                  setFormData({ ...formData, otp_code: "" })
                  requestOTP()
                }}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </>
          )}
        </form>

        {/* OR Divider */}
        <div className="mt-8 mb-6 flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="w-full mb-6">
          <button className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 mb-2 shadow-sm hover:shadow-md transition">
            <FcGoogle className="mr-2 text-xl" />
            <span className="font-medium">Google</span>
          </button>
        </div>

        {/* Already have account */}
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/Login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
