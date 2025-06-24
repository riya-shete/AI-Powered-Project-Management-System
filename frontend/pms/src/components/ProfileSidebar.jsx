import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSidebar = ({ isOpen, onClose, openNotifications, openTeamChat, openUpdateFeed }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const userData = {
    name: "Vivek Shinde",
    role: "Software Developer",
    initials: "VS",
    email: "vivek.651.2304@gmail.com",
    location: "Banglore",
    isPremium: true,
    teams: 7,
    projects: 12,
    achievements: 9
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleViewFullProfile = () => {
    navigate('/profile');
    onClose();
  };

  // Quick action handlers
  const handleNotifications = () => {
    // First close sidebar
    onClose();
    
    setTimeout(() => {
      openNotifications();
    }, 100);
  };

  const handleTeamChat = () => {
    // First close sidebar
    onClose();
    
    setTimeout(() => {
      openTeamChat();
    }, 100);
  };
  const handleUpdateFeed = () => {
    // First close sidebar
    onClose();
    
    setTimeout(() => {
      openUpdateFeed();
    }, 100);
  };
const handleHelp = () => {
  onClose();
  setTimeout(() => {
    navigate('/Help');
  },100);
};
  return (
    <>
      {/*Blur Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      {/*End of Blur Background Overlay */}

      <div className={`fixed top-0 right-0 z-50 h-full pt-2 pr-9 pb-6 pl-2 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div 
          ref={sidebarRef}
          className="bg-white w-80 h-full shadow-xl rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-100 p-4 flex justify-between items-center rounded-t-2xl">
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
              <div className="w-28 h-28 rounded-full flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-blue-400">
                <span className="text-white text-3xl font-bold">{userData.initials}</span>
              </div>
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

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">QUICK ACTIONS</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={handleNotifications}
                    className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Notifications</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleTeamChat}
                    className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span>Team Chat</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleUpdateFeed}
                    className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span>Update Feed</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleHelp}
                    className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Help</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer */}
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
    </>
  );
};

export default ProfileSidebar;