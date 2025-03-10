import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaLock, FaEnvelope, FaMobile, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Registration logic here
    navigate("/purpose-selection");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900 relative p-6">
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600 opacity-10 z-0"></div>
      
      <div className="relative flex flex-col items-center bg-white rounded-xl shadow-xl p-8 w-full max-w-md z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>
        
        {/* Logo or Brand */}
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <FaUser className="text-white text-2xl" />
        </div>
        
        {/* Form Heading */}
        <h2 className="text-3xl font-bold mb-2 text-indigo-700">Create Account</h2>
        <p className="text-gray-600 mb-8 text-center">
          Join us today and get access to all features
        </p>
        
        {/* Form */}
        <form className="w-full" onSubmit={handleSubmit}>
          {/* Contact Method Toggle */}
          <div className="flex w-full mb-6 bg-gray-100 rounded-lg p-1">
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${contactMethod === "email" ? "bg-white shadow-md text-indigo-600" : "text-gray-600"}`}
              onClick={() => setContactMethod("email")}
            >
              Email
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${contactMethod === "mobile" ? "bg-white shadow-md text-indigo-600" : "text-gray-600"}`}
              onClick={() => setContactMethod("mobile")}
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
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              ) : (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              )}
            </div>
          </div>
          
          {/* Password Field */}
          <div className="mb-5">
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
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>
          
          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 
                  <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                  <FaEye className="text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Create Account
          </button>
        </form>
        
        {/* OR Divider */}
        <div className="mt-8 mb-6 flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        {/* Already have account */}
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/Login")}
            className="text-indigo-600 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}