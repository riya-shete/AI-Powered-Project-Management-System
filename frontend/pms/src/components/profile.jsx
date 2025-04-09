import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { X } from 'lucide-react'; 


const Profile = () => {
   // Added navigation functionality
   const navigate = useNavigate();
  
   // Added close/back button handler with fallback
   const handleClose = () => {
     if (window.history.length > 1) {
       navigate(-1); // Go back to previous page
     } else {
       navigate('/home'); // Fallback to home if no history
     }
   };
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
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <button className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-cog text-2xl"></i>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-blue-500 to-blue-400">
                  <span className="text-white text-5xl font-bold">VS</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Vivek Shinde</h2>
                <p className="text-gray-500 mb-2">Software Developer</p>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Premium Member
                </div>
                <div className="flex mt-6 gap-3">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
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
                  <i className="fas fa-user-circle"></i>
                  <span className="font-medium">Personal Info</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1 hover:bg-gray-50">
                  <i className="fas fa-bell"></i>
                  <span className="font-medium">Notifications</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1 hover:bg-gray-50">
                  <i className="fas fa-lock"></i>
                  <span className="font-medium">Security</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1 hover:bg-gray-50">
                  <i className="fas fa-cog"></i>
                  <span className="font-medium">Preferences</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-gray-900 transition hover:translate-x-1 hover:bg-gray-50">
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
                <button className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                  <i className="fas fa-pen"></i> Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Full Name</p>
                  <p className="text-gray-800 font-medium">Vivek Shinde</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email Address</p>
                  <p className="text-gray-800 font-medium">vivek.651.2304@gmail.com</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Phone Number</p>
                  <p className="text-gray-800 font-medium">+91 7558517889</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Location</p>
                  <p className="text-gray-800 font-medium">Banglore</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Date of Birth</p>
                  <p className="text-gray-800 font-medium">April 23, 1992</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Joined</p>
                  <p className="text-gray-800 font-medium">March 2023</p>
                </div>
              </div>
            </div>
            
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
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">D</div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Design Team</h4>
                      <p className="text-gray-500 text-sm">8 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">+5</div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">D</div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Development Team</h4>
                      <p className="text-gray-500 text-sm">12 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">+9</div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">M</div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Marketing Team</h4>
                      <p className="text-gray-500 text-sm">6 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">+3</div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mr-3">P</div>
                    <div>
                      <h4 className="text-gray-800 font-semibold">Product Team</h4>
                      <p className="text-gray-500 text-sm">9 members</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">+6</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;