import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaLock, FaEnvelope, FaMobile, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    otp_code: "",
    password: ""
  });
    // New state variables for OTP functionality
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOTPField, setShowOTPField] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
    // OTP Request Function
    const requestOTP = async () => {
      try {
        setIsLoading(true);
        // Based on your backend, it only accepts email for OTP
        if (contactMethod !== "email") {
          alert("Mobile OTP is not supported. Please use email.");
          setIsLoading(false);
          return;
        } 
        
          const response = await axios.post(
            "http://localhost:8000/auth/request-otp/", 
            { email: formData.email },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
        );
        
        console.log("OTP sent successfully:", response.data);
        alert("OTP sent to your " + (contactMethod === "email" ? "email" : "mobile") + ". Please check.");
        setShowOTPField(true);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error requesting OTP:", error);
        alert("Failed to send OTP. Please try again.");
      }
    };

  // OTP Verification Function
   // OTP Verification Function
   const verifyOTP = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/verify-otp/", 
        { 
          email: formData.email, 
          otp_code: formData.otp_code  // Changed from 'otp' to 'otp_code'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const { token, user_id, username, email } = response.data;
      
      // Store the token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      
      console.log("OTP verified successfully. Token saved:", token);
      alert("Login successful!");
      
      // For subsequent API calls, you'll need to include this token in headers
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      navigate("/Dashboard");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error verifying OTP:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Invalid OTP. Please try again.";
      alert(errorMessage);
    }
  };
    const handleSubmit = (e) => {
    e.preventDefault();
    // Login logic here
    navigate("/Dashboard");
  };

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
        
        {/* Login Heading */}
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Welcome Back</h2>
        <p className="text-gray-600 mb-8 text-center">
          Sign in to access your account
        </p>
        
        {/* Form */}
        <form className="w-full" onSubmit={handleSubmit}>
          {/* Contact Method Toggle */}
          <div className="flex w-full mb-6 bg-gray-100 rounded-lg p-1">
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${contactMethod === "email" ? "bg-white shadow-md text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setContactMethod("email");
                setShowOTPField(false);
                setFormData({ ...formData, otp: "" });
              }}
            >
              Email
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${contactMethod === "mobile" ? "bg-white shadow-md text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setContactMethod("mobile")
                setShowOTPField(false); 
                setFormData({ ...formData, otp: "" });
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
                {contactMethod === "email" ? <FaEnvelope className="text-gray-400" /> : <FaMobile className="text-gray-400" />}
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
          </div>
          
          {/* OTP Field (Visible only after requesting OTP) */}
          {showOTPField && ( // <-- new block
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to your {contactMethod}
              </p>
            </div>
          )}

          {/* OTP Password Field */}
          {/* <div className="mb-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                  <FaEye className="text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>
           */}
          {/* Remember Me & Forgot Password */}
          {/* <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot password?
            </button>
          </div> */}
          
          {/* Submit Button */}
          {/* <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Login
          </button>
        </form> */}
          {/* OTP Field (Visible only after requesting OTP) */}
          {showOTPField && ( // <-- new block
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to your {contactMethod}
              </p>
            </div>
          )}

          {/* Buttons */}
          {!showOTPField ? ( // <-- new condition block
            <>
              {/* Request OTP Button */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mb-4"
                onClick={requestOTP}
                disabled={isLoading || !formData[contactMethod]}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              {/* Alternative: Password login option */}
              <div className="text-center">
                <span className="text-gray-600">or</span>
                <button
                  type="button"
                  onClick={() => navigate("/password-login")}
                  className="text-blue-600 hover:underline ml-2"
                >
                  Login with password
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verify OTP Button */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mb-4"
                onClick={verifyOTP}
                disabled={isLoading || !formData.otp || formData.otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP Button */}
              <button
                type="button"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                onClick={() => {
                  setFormData({ ...formData, otp: "" }); // <-- new line
                  requestOTP(); // <-- new line
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
        
        {/* Create account */}
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/SignIn")}
            className="text-blue-600 font-medium hover:underline"
          >
            SignIn
          </button>
        </p>
      </div>
    </div>
  );
}