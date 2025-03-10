import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-900 relative p-6">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative flex flex-col items-center bg-white bg-opacity-90 rounded-lg shadow-lg p-8 w-full max-w-3xl">
        
        {/* Sign In Form */}
        <div className="w-full text-center">
          {/* Back Button */}
          <button 
            onClick={() => navigate("/")} 
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-6"
          >
            <FaArrowLeft /> <span>Back to Home</span>
          </button>

          {/* Login Heading */}
          <h2 className="text-3xl font-bold mb-4">Log In</h2>
          <p className="text-gray-700 mb-6">Access your account and manage projects efficiently.</p>
          
          {/* Login Form */}
          <form className="text-left" onSubmit={(e) => { 
            e.preventDefault();  
            navigate("/purpose-selection"); // Navigate on successful login
          }}>
            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="text-gray-600 flex items-center space-x-2 px-2">
                <FaUser /> <span>Required Information</span>
              </legend>
              
              <input type="email" placeholder="Your Email Address" className="w-full p-3 border rounded mb-4" required />
              <input type="password" placeholder="Password" className="w-full p-3 border rounded mb-4" required />
              
              {/* Forgot Password */}
              <a href="#" onClick={() => navigate("/forgot-password")} className="text-blue-600 hover:underline block mb-4">
                Forgot your password?
              </a>

              {/* Login Button */}
              <button type="submit" className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold">
                Login
              </button>
            </fieldset>
          </form>
          
          {/* OR Divider */}
          <div className="mt-4 flex items-center justify-center">
            <div className="border-t border-gray-300 w-1/4"></div>
            <span className="mx-2 text-gray-600">or Sign in with</span>
            <div className="border-t border-gray-300 w-1/4"></div>
          </div>
          
          {/* Google Login */}
          <div className="mt-4 flex items-center justify-center">
            <button className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition">
              <FcGoogle className="mr-2 text-2xl" /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
