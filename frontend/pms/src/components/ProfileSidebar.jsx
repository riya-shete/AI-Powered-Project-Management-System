import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  // Dummy user data - in a real app, you would fetch this from your state management or API
  const userData = {
    name: "Vivek Shinde",
    role: "Software Developer",
    avatar: "https://t4.ftcdn.net/jpg/09/61/69/71/240_F_961697155_J7ZlI6T87DqEtLIRZoXkdMAMs87VyfAu.jpg",
    email: "vivek.651.2304@gmail.com",
    location: "San Francisco, CA",
    isPremium: true,
    teams: 7,
    projects: 12,
    achievements: 9
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // View full profile handler
  const handleViewFullProfile = () => {
    navigate('/profile');
    onClose();
  };

  return (
    <div className={`fixed top-0 right-0 z-50 h-full transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div 
        ref={sidebarRef}
        className="bg-white w-80 h-full shadow-lg rounded-l-lg flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">My Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Summary */}
        <div className="p-6 flex flex-col items-center border-b">
          <div className="relative">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-2 border-blue-500"
            />
            {userData.isPremium && (
              <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-semibold">{userData.name}</h3>
          <p className="text-gray-600">{userData.role}</p>
          {userData.isPremium && (
            <span className="mt-2 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Premium Member</span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-3 flex justify-between items-center border-b">
          <div className="text-center">
            <span className="block text-lg font-semibold">{userData.teams}</span>
            <span className="text-sm text-gray-600">Teams</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-semibold">{userData.projects}</span>
            <span className="text-sm text-gray-600">Projects</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-semibold">{userData.achievements}</span>
            <span className="text-sm text-gray-600">Achievements</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">ACCOUNT</h4>
            <ul className="space-y-2">
              <li>
                <button className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Personal Information</span>
                </button>
              </li>
              <li>
                <button className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security</span>
                </button>
              </li>
              <li>
                <button className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preferences</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer with View Full Profile button */}
        <div className="p-4 border-t">
          <button 
            onClick={handleViewFullProfile}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;