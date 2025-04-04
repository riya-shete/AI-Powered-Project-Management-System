import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();
    alert("Password reset link has been sent to your email. Please check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-900 relative p-6">
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      <div className="relative flex flex-col items-center bg-white bg-opacity-95 rounded-lg shadow-2xl p-10 w-full max-w-md">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/SignIn")} 
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-6 transition"
        >
          <FaArrowLeft className="text-lg" /> <span>Back to Login</span>
        </button>
        
        {/* Header */}
        <h2 className="text-3xl text-gray-700 font-bold mb-2 text-center">Forgot your password?</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email and we'll send instructions to reset your password.
        </p>
        
        {/* Forgot Password Form */}
        <form onSubmit={handleResetPassword} className="w-full">
          <label className="block text-gray-600 mb-2 font-medium">Your Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            Reset Your Password
          </button>
        </form>
      </div>
    </div>
  );
}
