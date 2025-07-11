import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsDemo from "./notitication"; 

import ProfileSidebar from './ProfileSidebar';
import PopupChatWindow from "./inbox"; // Imported chat component
import Invite from './invite'; 
import { UserPlus } from 'lucide-react';



const Navbar = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isFeedOpen, setFeedOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isInviteOpen, setInviteOpen] = useState(false);


  const handleNavigation = (path) => {
    navigate(path);
  };

  // Toggle notifications popup
  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  const closeNotificationPopup = () => {
    setNotificationOpen(false);
  };

  

  const closeFeedModal = () => {
    setFeedOpen(false);
  };
  const toggleProfileSidebar = () => {
    setIsProfileSidebarOpen(!isProfileSidebarOpen);
  };
  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };
  //invitation handkler
  const handleInviteClick = () => {
  setInviteOpen(true);
  };
  const closeInviteModal = () => {
    setInviteOpen(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between w-full px-6 py-3 bg-blue-500 border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <div 
            className="flex items-center mr-8 space-x-2 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <div className="bg-blue-600 p-1.5 rounded-md">
              <img 
                src="https://t3.ftcdn.net/jpg/10/72/44/00/240_F_1072440017_zNNC9vqpxBgm9C2U4qG8d5KrR4KIH6cj.jpg" 
                alt="Logo" 
                className="w-5 h-5" 
              />
            </div>
            <div>
              <span className="font-bold text-white text-lg">PMS</span>
              <span className="text-blue-100 font-medium ml-1">dev</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-5">
          {/* Notifications Button */}
          <button 
            className="text-white hover:text-blue-100 transition-colors duration-200 relative group"
            onClick={handleNotificationClick}
          >
            <span className="sr-only">Notifications</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
          
          {/* Inbox Button toggles the chat popup */}
          <button 
            className="text-white hover:text-blue-100 transition-colors duration-200"
            onClick={toggleChat}
          >
            <span className="sr-only">Inbox / Chat</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </button>
          
          
          
          {/* Search Button */}
          <button 
            className="text-white hover:text-blue-100 transition-colors duration-200"
            onClick={() => handleNavigation('/search')}
          >
            <span className="sr-only">Search</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
          
          {/* Help Button */}
          <button 
            className="text-white hover:text-blue-100 transition-colors duration-200"
            onClick={() => handleNavigation('/help')}
          >
            <span className="sr-only">Help</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </button>

          {/* Invite Button */}
          <button 
            className="text-white hover:text-blue-100 p-2 rounded-lg transition-colors duration-200"
            onClick={handleInviteClick}
            aria-label="Invite"
          >
            <UserPlus className="w-6 h-6" />
          </button>
          
          <div className="border-l border-blue-400 h-8 mx-2"></div>
          
          {/* Profile Button */}
          <button 
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-400 transition-colors duration-200"
            onClick={toggleProfileSidebar} // Changed from handleNavigation to toggleProfileSidebar
          >
            <img 
              src="https://t4.ftcdn.net/jpg/09/61/69/71/240_F_961697155_J7ZlI6T87DqEtLIRZoXkdMAMs87VyfAu.jpg" 
              alt="Profile" 
              className="w-8 h-8 rounded-full border-2 border-white" 
            />
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Render Notifications Modal */}
      <NotificationsDemo isOpen={isNotificationOpen} onClose={closeNotificationPopup} />


      <ProfileSidebar 
  isOpen={isProfileSidebarOpen} 
  onClose={() => setIsProfileSidebarOpen(false)}
  openNotifications={() => setNotificationOpen(true)}
  openTeamChat={() => setChatOpen(true)}
  
/>
      {isChatOpen && <PopupChatWindow onClose={() => setChatOpen(false)} />}
      {/* Render Invite Modal */}
      <Invite isOpen={isInviteOpen} onClose={closeInviteModal} />
    </>
  );
};

export default Navbar;
