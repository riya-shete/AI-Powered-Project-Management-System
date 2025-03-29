import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaLock, FaEnvelope, FaMobile, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: ""
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              onClick={() => setContactMethod("email")}
            >
              Email
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${contactMethod === "mobile" ? "bg-white shadow-md text-blue-600" : "text-gray-600"}`}
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
          
          {/* Password Field */}
          <div className="mb-2">
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
          
          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
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
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Login
          </button>
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